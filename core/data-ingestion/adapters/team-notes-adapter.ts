/**
 * Team Notes Adapter
 * 
 * Ingests depth charts and injury reports from official team sources:
 * - PDF depth charts
 * - HTML game notes 
 * - Injury reports
 * - Press release data
 */

import { BaseAdapter, AdapterConfig, RawDataRecord } from './base-adapter';
import { PlayerDepthChart, DataSource } from '../schemas/database-schema';
import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface TeamNotesRecord {
  team_id: string;
  player_name: string;
  position: string;
  depth_rank: number;
  starter_prob: number;
  injury_status: 'OUT' | 'QUESTIONABLE' | 'ACTIVE';
  injury_note?: string;
  source_url: string;
  parse_confidence: number;
}

interface TeamSource {
  team_id: string;
  team_name: string;
  depth_chart_url?: string;
  injury_report_url?: string;
  game_notes_url?: string;
  parse_method: 'pdf' | 'html' | 'json';
}

export class TeamNotesAdapter extends BaseAdapter<TeamNotesRecord> {
  private teamSources: TeamSource[] = [];

  constructor() {
    const config: AdapterConfig = {
      sourceId: 'team_notes',
      sourceName: 'Official Team Notes',
      sourceType: 'team_notes',
      rateLimit: {
        requestsPerHour: 200, // Conservative to avoid blocking
        requestsPerMinute: 10
      },
      timeout: 45000, // PDFs can be slow
      retryAttempts: 3
    };
    
    super(config);
    this.loadTeamSources();
  }

  protected async fetchRawData(season: number, week: number): Promise<RawDataRecord[]> {
    const rawRecords: RawDataRecord[] = [];

    for (const teamSource of this.teamSources) {
      try {
        console.log(`[TeamNotes] Processing ${teamSource.team_name} (${teamSource.team_id})`);
        
        // Fetch depth chart if available
        if (teamSource.depth_chart_url) {
          const depthData = await this.fetchDepthChart(teamSource, season, week);
          rawRecords.push(...depthData);
        }

        // Fetch injury report if available
        if (teamSource.injury_report_url) {
          const injuryData = await this.fetchInjuryReport(teamSource, season, week);
          rawRecords.push(...injuryData);
        }

        // Fetch game notes if available
        if (teamSource.game_notes_url) {
          const notesData = await this.fetchGameNotes(teamSource, season, week);
          rawRecords.push(...notesData);
        }

        // Rate limiting between teams
        await this.sleep(1000);

      } catch (error) {
        console.warn(`[TeamNotes] Failed to process ${teamSource.team_name}:`, error);
        // Continue with other teams
      }
    }

    return rawRecords;
  }

  protected async processData(rawData: RawDataRecord[], season: number, week: number): Promise<TeamNotesRecord[]> {
    const processedRecords: TeamNotesRecord[] = [];
    const playerMap = new Map<string, TeamNotesRecord>();

    for (const rawRecord of rawData) {
      try {
        const record = await this.processRawRecord(rawRecord, season, week);
        if (record) {
          // Use player+position as key to merge multiple sources
          const key = `${record.team_id}_${this.standardizePlayerName(record.player_name)}_${record.position}`;
          
          const existing = playerMap.get(key);
          if (existing) {
            // Merge records, preferring higher confidence
            playerMap.set(key, this.mergePlayerRecords(existing, record));
          } else {
            playerMap.set(key, record);
          }
        }
      } catch (error) {
        console.warn('[TeamNotes] Failed to process raw record:', error);
      }
    }

    return Array.from(playerMap.values());
  }

  protected validateRecord(record: TeamNotesRecord): boolean {
    const requiredFields = ['team_id', 'player_name', 'position', 'depth_rank'];
    const errors = this.validateRequiredFields(record, requiredFields);
    
    if (errors.length > 0) {
      console.warn(`[TeamNotes] Validation failed:`, errors, record);
      return false;
    }

    // Additional validations
    if (record.depth_rank < 1 || record.depth_rank > 10) {
      console.warn(`[TeamNotes] Invalid depth rank: ${record.depth_rank}`);
      return false;
    }

    if (record.starter_prob < 0 || record.starter_prob > 1) {
      console.warn(`[TeamNotes] Invalid starter probability: ${record.starter_prob}`);
      return false;
    }

    if (!['OUT', 'QUESTIONABLE', 'ACTIVE'].includes(record.injury_status)) {
      console.warn(`[TeamNotes] Invalid injury status: ${record.injury_status}`);
      return false;
    }

    return true;
  }

  private async fetchDepthChart(teamSource: TeamSource, season: number, week: number): Promise<RawDataRecord[]> {
    if (!teamSource.depth_chart_url) return [];

    try {
      const url = this.buildSeasonalUrl(teamSource.depth_chart_url, season, week);
      const response = await this.makeRequest(url);
      
      if (teamSource.parse_method === 'pdf') {
        return await this.parsePdfDepthChart(response, teamSource);
      } else if (teamSource.parse_method === 'html') {
        return await this.parseHtmlDepthChart(response, teamSource);
      } else {
        return await this.parseJsonDepthChart(response, teamSource);
      }
    } catch (error) {
      console.warn(`[TeamNotes] Failed to fetch depth chart for ${teamSource.team_name}:`, error);
      return [];
    }
  }

  private async fetchInjuryReport(teamSource: TeamSource, season: number, week: number): Promise<RawDataRecord[]> {
    if (!teamSource.injury_report_url) return [];

    try {
      const url = this.buildSeasonalUrl(teamSource.injury_report_url, season, week);
      const response = await this.makeRequest(url);
      const html = await response.text();
      
      return this.parseInjuryReport(html, teamSource);
    } catch (error) {
      console.warn(`[TeamNotes] Failed to fetch injury report for ${teamSource.team_name}:`, error);
      return [];
    }
  }

  private async fetchGameNotes(teamSource: TeamSource, season: number, week: number): Promise<RawDataRecord[]> {
    if (!teamSource.game_notes_url) return [];

    try {
      const url = this.buildSeasonalUrl(teamSource.game_notes_url, season, week);
      const response = await this.makeRequest(url);
      const html = await response.text();
      
      return this.parseGameNotes(html, teamSource);
    } catch (error) {
      console.warn(`[TeamNotes] Failed to fetch game notes for ${teamSource.team_name}:`, error);
      return [];
    }
  }

  private async parsePdfDepthChart(response: Response, teamSource: TeamSource): Promise<RawDataRecord[]> {
    // For PDF parsing, we'd normally use pdf-parse or similar
    // For now, return empty array as PDF parsing requires additional setup
    console.warn(`[TeamNotes] PDF parsing not yet implemented for ${teamSource.team_name}`);
    return [];
    
    /*
    // Future implementation:
    const buffer = await response.arrayBuffer();
    const pdfData = await pdfParse(Buffer.from(buffer));
    const text = pdfData.text;
    
    return this.parseDepthChartText(text, teamSource);
    */
  }

  private async parseHtmlDepthChart(response: Response, teamSource: TeamSource): Promise<RawDataRecord[]> {
    const html = await response.text();
    const $ = cheerio.load(html);
    const records: RawDataRecord[] = [];

    // Generic depth chart parsing patterns
    const depthChartSelectors = [
      'table.depth-chart tbody tr',
      '.roster-table tbody tr',
      '.depth-chart-row',
      '[data-position] .player'
    ];

    for (const selector of depthChartSelectors) {
      $(selector).each((index, element) => {
        try {
          const record = this.parseDepthChartRow($, element, teamSource);
          if (record) {
            records.push(record);
          }
        } catch (error) {
          // Continue parsing other rows
        }
      });
      
      if (records.length > 0) break; // Use first successful selector
    }

    return records;
  }

  private async parseJsonDepthChart(response: Response, teamSource: TeamSource): Promise<RawDataRecord[]> {
    const data = await response.json();
    const records: RawDataRecord[] = [];

    // Generic JSON depth chart parsing
    if (data.depth_chart || data.roster) {
      const depthChart = data.depth_chart || data.roster;
      
      for (const position of Object.keys(depthChart)) {
        const players = depthChart[position];
        if (Array.isArray(players)) {
          players.forEach((player, index) => {
            const record = this.createDepthChartRecord(player, position, index + 1, teamSource);
            if (record) records.push(record);
          });
        }
      }
    }

    return records;
  }

  private parseDepthChartRow($: cheerio.CheerioAPI, element: cheerio.Element, teamSource: TeamSource): RawDataRecord | null {
    const row = $(element);
    
    // Extract player information
    const playerName = row.find('.player-name, .name, td:nth-child(2)').text().trim();
    const position = row.find('.position, .pos, td:nth-child(3)').text().trim();
    const depthStr = row.find('.depth, .rank, td:first-child').text().trim();
    
    if (!playerName || !position) return null;

    const depthRank = parseInt(depthStr) || 1;
    const starterProb = depthRank === 1 ? 0.9 : (depthRank === 2 ? 0.3 : 0.1);

    return {
      source: 'team_notes' as DataSource,
      timestamp: new Date().toISOString(),
      confidence: 0.9,
      data: {
        team_id: teamSource.team_id,
        player_name: playerName,
        position: this.standardizePosition(position),
        depth_rank: depthRank,
        starter_prob: starterProb,
        injury_status: 'ACTIVE',
        parse_confidence: 0.8
      },
      provenance: this.createProvenanceRecord('depth_chart', { position, depth_rank: depthRank }, 0.9)
    };
  }

  private parseInjuryReport(html: string, teamSource: TeamSource): RawDataRecord[] {
    const $ = cheerio.load(html);
    const records: RawDataRecord[] = [];

    // Common injury report selectors
    const injurySelectors = [
      '.injury-report tbody tr',
      '.player-status tbody tr',
      '[data-status] .player'
    ];

    for (const selector of injurySelectors) {
      $(selector).each((index, element) => {
        try {
          const row = $(element);
          const playerName = row.find('.player-name, .name, td:nth-child(1)').text().trim();
          const status = row.find('.status, td:nth-child(2)').text().trim().toUpperCase();
          const injury = row.find('.injury, .note, td:nth-child(3)').text().trim();
          
          if (playerName && ['OUT', 'QUESTIONABLE', 'PROBABLE'].includes(status)) {
            const injuryStatus = status === 'PROBABLE' ? 'ACTIVE' : status as 'OUT' | 'QUESTIONABLE';
            
            records.push({
              source: 'team_notes' as DataSource,
              timestamp: new Date().toISOString(),
              confidence: 0.95,
              data: {
                team_id: teamSource.team_id,
                player_name: playerName,
                injury_status: injuryStatus,
                injury_note: injury,
                parse_confidence: 0.9
              },
              provenance: this.createProvenanceRecord('injury_status', injuryStatus, 0.95)
            });
          }
        } catch (error) {
          // Continue with other rows
        }
      });
      
      if (records.length > 0) break;
    }

    return records;
  }

  private parseGameNotes(html: string, teamSource: TeamSource): RawDataRecord[] {
    const $ = cheerio.load(html);
    const records: RawDataRecord[] = [];
    
    // Look for depth chart mentions in game notes
    const text = $.text().toLowerCase();
    const depthMentions = this.extractDepthMentions(text, teamSource.team_id);
    
    for (const mention of depthMentions) {
      records.push({
        source: 'team_notes' as DataSource,
        timestamp: new Date().toISOString(),
        confidence: 0.7, // Lower confidence for inferred data
        data: mention,
        provenance: this.createProvenanceRecord('game_notes_inference', mention, 0.7)
      });
    }

    return records;
  }

  private extractDepthMentions(text: string, teamId: string): any[] {
    const mentions: any[] = [];
    
    // Pattern matching for depth chart changes
    const patterns = [
      /(\w+\s+\w+)\s+(?:will start|starting|named starter|moves to|promoted to)/g,
      /(\w+\s+\w+)\s+(?:out|sidelined|injured|questionable)/g,
      /(\w+\s+\w+)\s+(?:backup|second string|behind)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const playerName = match[1].trim();
        if (playerName && playerName.length > 3) { // Basic name validation
          mentions.push({
            team_id: teamId,
            player_name: playerName,
            inference_type: 'game_notes',
            parse_confidence: 0.6
          });
        }
      }
    }

    return mentions;
  }

  private createDepthChartRecord(player: any, position: string, rank: number, teamSource: TeamSource): RawDataRecord | null {
    const playerName = player.name || player.player_name || player.full_name;
    if (!playerName) return null;

    const starterProb = rank === 1 ? 0.9 : (rank === 2 ? 0.3 : 0.1);

    return {
      source: 'team_notes' as DataSource,
      timestamp: new Date().toISOString(),
      confidence: 0.9,
      data: {
        team_id: teamSource.team_id,
        player_name: playerName,
        position: this.standardizePosition(position),
        depth_rank: rank,
        starter_prob: starterProb,
        injury_status: 'ACTIVE',
        parse_confidence: 0.85
      },
      provenance: this.createProvenanceRecord('json_depth_chart', { position, rank }, 0.9)
    };
  }

  private async processRawRecord(rawRecord: RawDataRecord, season: number, week: number): Promise<TeamNotesRecord | null> {
    const data = rawRecord.data;
    
    if (!data.team_id || !data.player_name) return null;

    return {
      team_id: data.team_id,
      player_name: this.sanitizeString(data.player_name),
      position: data.position || 'RB', // Default position
      depth_rank: data.depth_rank || 1,
      starter_prob: data.starter_prob || 0.5,
      injury_status: data.injury_status || 'ACTIVE',
      injury_note: data.injury_note ? this.sanitizeString(data.injury_note) : undefined,
      source_url: data.source_url || '',
      parse_confidence: data.parse_confidence || 0.8
    };
  }

  private mergePlayerRecords(existing: TeamNotesRecord, incoming: TeamNotesRecord): TeamNotesRecord {
    // Prefer higher confidence data
    if (incoming.parse_confidence > existing.parse_confidence) {
      return {
        ...existing,
        ...incoming,
        parse_confidence: Math.max(existing.parse_confidence, incoming.parse_confidence)
      };
    }
    
    // Merge specific fields preferentially
    return {
      ...existing,
      // Prefer explicit injury information
      injury_status: incoming.injury_note ? incoming.injury_status : existing.injury_status,
      injury_note: incoming.injury_note || existing.injury_note,
      // Use most specific depth information
      depth_rank: existing.depth_rank > 0 ? existing.depth_rank : incoming.depth_rank,
      starter_prob: Math.max(existing.starter_prob, incoming.starter_prob),
      parse_confidence: Math.max(existing.parse_confidence, incoming.parse_confidence)
    };
  }

  private standardizePosition(position: string): string {
    const positionMappings: Record<string, string> = {
      'qb': 'QB',
      'quarterback': 'QB',
      'rb': 'RB',
      'runningback': 'RB',
      'running back': 'RB',
      'hb': 'RB',
      'halfback': 'RB',
      'wr': 'WR',
      'wide receiver': 'WR',
      'receiver': 'WR',
      'te': 'TE',
      'tight end': 'TE',
      'k': 'K',
      'kicker': 'K',
      'pk': 'K'
    };

    const normalized = position.toLowerCase().trim();
    return positionMappings[normalized] || position.toUpperCase();
  }

  private buildSeasonalUrl(baseUrl: string, season: number, week: number): string {
    return baseUrl
      .replace('{season}', String(season))
      .replace('{year}', String(season))
      .replace('{week}', String(week));
  }

  private loadTeamSources(): void {
    try {
      // Load team sources from configuration file
      const configPath = join(process.cwd(), 'core/data-ingestion/config/team-sources.json');
      const configData = readFileSync(configPath, 'utf8');
      this.teamSources = JSON.parse(configData);
      
      console.log(`[TeamNotes] Loaded ${this.teamSources.length} team sources`);
    } catch (error) {
      console.warn('[TeamNotes] Failed to load team sources, using defaults');
      this.teamSources = this.getDefaultTeamSources();
    }
  }

  private getDefaultTeamSources(): TeamSource[] {
    // Default team sources for Power 4 conferences
    return [
      // SEC
      { team_id: 'alabama', team_name: 'Alabama', parse_method: 'html' },
      { team_id: 'georgia', team_name: 'Georgia', parse_method: 'html' },
      { team_id: 'lsu', team_name: 'LSU', parse_method: 'html' },
      { team_id: 'florida', team_name: 'Florida', parse_method: 'html' },
      
      // ACC  
      { team_id: 'miami', team_name: 'Miami', parse_method: 'html' },
      { team_id: 'clemson', team_name: 'Clemson', parse_method: 'html' },
      { team_id: 'florida-state', team_name: 'Florida State', parse_method: 'html' },
      { team_id: 'north-carolina', team_name: 'North Carolina', parse_method: 'html' },
      
      // Big Ten
      { team_id: 'michigan', team_name: 'Michigan', parse_method: 'html' },
      { team_id: 'ohio-state', team_name: 'Ohio State', parse_method: 'html' },
      { team_id: 'penn-state', team_name: 'Penn State', parse_method: 'html' },
      { team_id: 'wisconsin', team_name: 'Wisconsin', parse_method: 'html' },
      
      // Big 12
      { team_id: 'texas', team_name: 'Texas', parse_method: 'html' },
      { team_id: 'oklahoma', team_name: 'Oklahoma', parse_method: 'html' },
      { team_id: 'baylor', team_name: 'Baylor', parse_method: 'html' },
      { team_id: 'tcu', team_name: 'TCU', parse_method: 'html' }
    ];
  }
}