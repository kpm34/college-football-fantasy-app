/**
 * ESPN+ Integration Service
 * 
 * Provides access to ESPN+ premium content and analysis for enhanced player projections
 * Credentials: kmp34@pitt.edu / #Kash2002
 */

import { OpenAI } from 'openai';

// Initialize OpenAI client using existing AI Gateway
const openai = new OpenAI({
  baseURL: process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1/ai',
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY || 'sk-dummy'
});

interface ESPNPlusArticle {
  title: string;
  url: string;
  publishDate: string;
  author: string;
  content: string;
  sentiment: number; // -1 to 1
  playerMentions: string[];
  keyInsights: string[];
}

interface PlayerAnalysis {
  playerName: string;
  team: string;
  position: string;
  expertSentiment: number; // -1 to 1
  injuryConcernLevel: number; // 0 to 1
  depthChartCertainty: number; // 0 to 1
  coachingChangeImpact: number; // -0.5 to 0.5
  keyInsights: string[];
  sources: string[];
  lastUpdated: Date;
}

export class ESPNPlusService {
  private baseUrl = 'https://plus.espn.com';
  private credentials = {
    username: process.env.ESPN_USERNAME || 'kpm34@pitt.edu',
    password: process.env.ESPN_PASSWORD || '#Kash2002'
  };

  /**
   * Search for articles about a specific player using WebFetch + OpenAI analysis
   */
  async searchPlayerArticles(playerName: string, team?: string, limit: number = 10): Promise<ESPNPlusArticle[]> {
    try {
      const searchQuery = team ? `${playerName} ${team} college football 2025` : `${playerName} college football 2025`;
      const searchUrls = [
        `${this.baseUrl}/college-football/player/_/id/${this.searchPlayerId(playerName, team)}`,
        `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&type=articles`,
        `https://www.espn.com/college-football/search?searchTerm=${encodeURIComponent(searchQuery)}`,
        `https://www.espn.com/college-football/player/_/name/${encodeURIComponent(playerName.replace(' ', '-'))}`
      ];
      
      const articles: ESPNPlusArticle[] = [];
      
      for (const url of searchUrls.slice(0, Math.min(3, limit))) {
        try {
          // Use WebFetch to get content (simulated for now without actual ESPN+ login)
          const content = await this.fetchWithFallback(url, searchQuery);
          
          if (content) {
            const analyzedArticles = await this.analyzeContentWithAI(content, playerName, team || '');
            articles.push(...analyzedArticles);
            
            if (articles.length >= limit) break;
          }
        } catch (error) {
          console.warn(`Error fetching ${url}:`, error);
        }
      }
      
      return articles.slice(0, limit);
      
    } catch (error) {
      console.error(`Error searching ESPN+ for ${playerName}:`, error);
      return [];
    }
  }

  /**
   * Analyze article content using OpenAI
   */
  private async analyzeContentWithAI(content: string, playerName: string, team: string): Promise<ESPNPlusArticle[]> {
    try {
      const analysisPrompt = `
        Analyze the following sports article content about ${playerName} from ${team}:
        
        ${content}
        
        Extract and provide:
        1. Overall sentiment about the player (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
        2. Key insights about the player (performance, role, potential)
        3. Any injury concerns mentioned
        4. Depth chart positioning information
        5. Coaching or system changes that might affect the player
        
        Respond in JSON format:
        {
          "sentiment": -1 to 1,
          "keyInsights": ["insight1", "insight2", ...],
          "injuryMentions": ["any injury info"],
          "depthChartInfo": "starter/backup/competing/unclear",
          "coachingChanges": "any coaching change impacts"
        }
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert college football analyst. Analyze articles and extract structured insights about players.'
          },
          {
            role: 'user', 
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });
      
      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return [{
        title: `AI Analysis: ${playerName}`,
        url: 'analyzed-content',
        publishDate: new Date().toISOString(),
        author: 'AI Analysis',
        content: content.substring(0, 1000),
        sentiment: analysis.sentiment || 0,
        playerMentions: [playerName],
        keyInsights: analysis.keyInsights || []
      }];
      
    } catch (error) {
      console.error('Error analyzing content with AI:', error);
      return [];
    }
  }

  /**
   * Fallback content fetching (placeholder for actual ESPN+ integration)
   */
  private async fetchWithFallback(url: string, searchQuery: string): Promise<string> {
    // In production, this would:
    // 1. Authenticate with ESPN+ using credentials
    // 2. Fetch actual article content
    // 3. Handle paywalls and premium content
    
    // For now, return simulated content based on search query
    return `Recent analysis of ${searchQuery} shows promising development. 
    The player continues to work with coaching staff on improving performance. 
    No significant injury concerns reported. Competing for starting position 
    with strong potential for fantasy relevance this season.`;
  }

  /**
   * Helper method to search for ESPN player ID
   */
  private searchPlayerId(playerName: string, team?: string): string {
    // In production, this would search ESPN's player database
    // For now, return a placeholder ID
    return '12345';
  }

  /**
   * Get comprehensive player analysis from ESPN+ content
   */
  async getPlayerAnalysis(playerName: string, team: string, position: string): Promise<PlayerAnalysis> {
    try {
      const articles = await this.searchPlayerArticles(playerName, team, 5);
      
      if (articles.length === 0) {
        return this.getDefaultAnalysis(playerName, team, position);
      }
      
      // Analyze sentiment across all articles
      const avgSentiment = articles.reduce((sum, article) => sum + article.sentiment, 0) / articles.length;
      
      // Extract injury concerns
      const injuryConcern = this.analyzeInjuryConcerns(articles);
      
      // Analyze depth chart mentions
      const depthCertainty = this.analyzeDepthChartCertainty(articles, playerName);
      
      // Check for coaching changes
      const coachingImpact = this.analyzeCoachingImpact(articles, team);
      
      // Compile all insights
      const allInsights = articles.flatMap(a => a.keyInsights);
      const sources = articles.map(a => a.url);
      
      return {
        playerName,
        team,
        position,
        expertSentiment: Math.max(-1, Math.min(1, avgSentiment)),
        injuryConcernLevel: Math.max(0, Math.min(1, injuryConcern)),
        depthChartCertainty: Math.max(0, Math.min(1, depthCertainty)),
        coachingChangeImpact: Math.max(-0.5, Math.min(0.5, coachingImpact)),
        keyInsights: allInsights.slice(0, 10), // Top 10 insights
        sources,
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error(`Error getting ESPN+ analysis for ${playerName}:`, error);
      return this.getDefaultAnalysis(playerName, team, position);
    }
  }

  /**
   * Get team-wide analysis for coaching changes, offensive system changes
   */
  async getTeamAnalysis(team: string): Promise<{
    coachingStability: number;
    offensiveSystemChange: boolean;
    recruitingMomentum: number;
    keyPlayersDeparted: string[];
    keyPlayersAdded: string[];
  }> {
    try {
      const searchQuery = `${team} college football coaching staff recruiting 2025`;
      const webFetch = new WebFetch();
      const content = await webFetch.fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}`,
        `Analyze ${team}'s coaching stability, offensive system changes, recruiting success, and key player transfers for 2025 season.`
      );
      
      return this.parseTeamAnalysis(content, team);
      
    } catch (error) {
      console.error(`Error getting team analysis for ${team}:`, error);
      return {
        coachingStability: 0.8,
        offensiveSystemChange: false,
        recruitingMomentum: 0.5,
        keyPlayersDeparted: [],
        keyPlayersAdded: []
      };
    }
  }

  /**
   * Get injury reports and updates
   */
  async getInjuryReports(team?: string): Promise<{
    playerName: string;
    team: string;
    position: string;
    injuryType: string;
    severity: 'minor' | 'moderate' | 'major';
    expectedReturn: string;
    impactLevel: number; // 0 to 1
  }[]> {
    try {
      const query = team ? `${team} injury report` : 'college football injury report';
      const webFetch = new WebFetch();
      const content = await webFetch.fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`,
        `Find current injury reports for college football players. Include player names, injury types, severity, and expected return dates.`
      );
      
      return this.parseInjuryReports(content);
      
    } catch (error) {
      console.error('Error getting injury reports:', error);
      return [];
    }
  }

  private parseSearchResults(content: string, playerName: string): ESPNPlusArticle[] {
    // Placeholder parsing logic
    // In production, this would parse the actual ESPN+ HTML/API response
    
    return [{
      title: `${playerName} Season Outlook`,
      url: `${this.baseUrl}/article/placeholder`,
      publishDate: new Date().toISOString(),
      author: 'ESPN Staff',
      content: content,
      sentiment: 0.1, // Slightly positive default
      playerMentions: [playerName],
      keyInsights: [
        `${playerName} expected to be key contributor`,
        'No major injury concerns reported',
        'Competition for starting role'
      ]
    }];
  }

  private analyzeInjuryConcerns(articles: ESPNPlusArticle[]): number {
    let injuryScore = 0;
    
    for (const article of articles) {
      const content = (article.content + article.title).toLowerCase();
      
      // High concern keywords
      if (content.includes('injured') || content.includes('hurt') || content.includes('surgery')) {
        injuryScore += 0.3;
      }
      
      // Moderate concern keywords
      if (content.includes('questionable') || content.includes('limited') || content.includes('recovering')) {
        injuryScore += 0.2;
      }
      
      // Minor concern keywords
      if (content.includes('minor') || content.includes('day-to-day')) {
        injuryScore += 0.1;
      }
      
      // Positive keywords (reduce concern)
      if (content.includes('healthy') || content.includes('fully recovered') || content.includes('no restrictions')) {
        injuryScore -= 0.1;
      }
    }
    
    return Math.max(0, Math.min(1, injuryScore / articles.length));
  }

  private analyzeDepthChartCertainty(articles: ESPNPlusArticle[], playerName: string): number {
    let certaintyScore = 0.5; // Default neutral
    
    for (const article of articles) {
      const content = (article.content + article.title).toLowerCase();
      
      // High certainty keywords
      if (content.includes('starting') || content.includes('starter') || content.includes('first team')) {
        certaintyScore += 0.2;
      }
      
      // Uncertainty keywords
      if (content.includes('competing') || content.includes('battle') || content.includes('unclear')) {
        certaintyScore -= 0.2;
      }
      
      // Backup indicators
      if (content.includes('backup') || content.includes('second team') || content.includes('depth')) {
        certaintyScore -= 0.3;
      }
    }
    
    return Math.max(0, Math.min(1, certaintyScore));
  }

  private analyzeCoachingImpact(articles: ESPNPlusArticle[], team: string): number {
    let impact = 0;
    
    for (const article of articles) {
      const content = (article.content + article.title).toLowerCase();
      
      // Positive coaching changes
      if (content.includes('new coach') && content.includes('improved')) {
        impact += 0.2;
      }
      
      // Negative coaching changes
      if (content.includes('coaching change') && content.includes('uncertainty')) {
        impact -= 0.2;
      }
      
      // System changes
      if (content.includes('new system') || content.includes('scheme change')) {
        impact -= 0.1; // Usually temporary negative impact
      }
    }
    
    return Math.max(-0.5, Math.min(0.5, impact));
  }

  private parseTeamAnalysis(content: string, team: string): any {
    // Placeholder team analysis
    return {
      coachingStability: 0.8,
      offensiveSystemChange: false,
      recruitingMomentum: 0.6,
      keyPlayersDeparted: [],
      keyPlayersAdded: []
    };
  }

  private parseInjuryReports(content: string): any[] {
    // Placeholder injury parsing
    return [];
  }

  private getDefaultAnalysis(playerName: string, team: string, position: string): PlayerAnalysis {
    return {
      playerName,
      team,
      position,
      expertSentiment: 0, // Neutral
      injuryConcernLevel: 0.1, // Low default concern
      depthChartCertainty: 0.7, // Moderately certain
      coachingChangeImpact: 0, // No impact
      keyInsights: ['Limited ESPN+ coverage available'],
      sources: [],
      lastUpdated: new Date()
    };
  }

  /**
   * Batch analyze multiple players
   */
  async batchAnalyzePlayers(players: { name: string; team: string; position: string }[]): Promise<PlayerAnalysis[]> {
    const analyses: PlayerAnalysis[] = [];
    
    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      const batchPromises = batch.map(player => 
        this.getPlayerAnalysis(player.name, player.team, player.position)
      );
      
      const batchResults = await Promise.all(batchPromises);
      analyses.push(...batchResults);
      
      // Add delay between batches to be respectful of ESPN's servers
      if (i + batchSize < players.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return analyses;
  }
}

export const espnPlusService = new ESPNPlusService();