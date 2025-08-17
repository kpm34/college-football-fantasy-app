/**
 * Base Adapter Abstract Class
 * 
 * Provides common functionality for all data ingestion adapters
 * including error handling, logging, rate limiting, and data validation.
 */

import { DataSource, ProvenanceRecord } from '../schemas/database-schema';

export interface AdapterConfig {
  sourceId: string;
  sourceName: string;
  sourceType: 'team_notes' | 'vendor' | 'stats_inference' | 'manual_override';
  rateLimit?: {
    requestsPerHour: number;
    requestsPerMinute?: number;
  };
  timeout?: number; // milliseconds
  retryAttempts?: number;
  backoffMultiplier?: number;
}

export interface AdapterResult<T = any> {
  success: boolean;
  data: T[];
  metadata: {
    totalRecords: number;
    validRecords: number;
    errorRecords: number;
    executionTime: number;
    source: DataSource;
    confidence: number;
    warnings: string[];
  };
  errors?: AdapterError[];
}

export interface AdapterError {
  type: 'parsing' | 'validation' | 'network' | 'rate_limit' | 'unknown';
  message: string;
  record?: any;
  retryable: boolean;
  timestamp: string;
}

export interface RawDataRecord {
  source: DataSource;
  timestamp: string;
  confidence: number;
  data: any;
  provenance: ProvenanceRecord;
}

export abstract class BaseAdapter<T = any> {
  protected config: AdapterConfig;
  protected requestCount: number = 0;
  protected lastRequestTime: number = 0;
  protected rateLimitResetTime: number = 0;

  constructor(config: AdapterConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      backoffMultiplier: 2,
      ...config
    };
  }

  /**
   * Main entry point for adapter execution
   */
  async execute(season: number, week: number): Promise<AdapterResult<T>> {
    const startTime = Date.now();
    const runId = this.generateRunId(season, week);
    
    try {
      console.log(`[${this.config.sourceId}] Starting ingestion for ${season}W${week}`);
      
      // Rate limiting check
      await this.enforceRateLimit();
      
      // Execute adapter-specific logic
      const rawData = await this.fetchRawData(season, week);
      
      // Process and validate data
      const processedData = await this.processData(rawData, season, week);
      
      // Calculate execution metrics
      const executionTime = Date.now() - startTime;
      const validRecords = processedData.filter(record => this.validateRecord(record)).length;
      const totalRecords = processedData.length;
      
      const result: AdapterResult<T> = {
        success: true,
        data: processedData,
        metadata: {
          totalRecords,
          validRecords,
          errorRecords: totalRecords - validRecords,
          executionTime,
          source: this.config.sourceId as DataSource,
          confidence: this.calculateConfidence(processedData),
          warnings: []
        }
      };
      
      console.log(`[${this.config.sourceId}] Completed: ${validRecords}/${totalRecords} valid records in ${executionTime}ms`);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const adapterError: AdapterError = {
        type: this.categorizeError(error),
        message: error instanceof Error ? error.message : String(error),
        retryable: this.isRetryableError(error),
        timestamp: new Date().toISOString()
      };
      
      console.error(`[${this.config.sourceId}] Failed after ${executionTime}ms:`, adapterError);
      
      return {
        success: false,
        data: [],
        metadata: {
          totalRecords: 0,
          validRecords: 0,
          errorRecords: 0,
          executionTime,
          source: this.config.sourceId as DataSource,
          confidence: 0,
          warnings: []
        },
        errors: [adapterError]
      };
    }
  }

  /**
   * Abstract method for fetching raw data from source
   */
  protected abstract fetchRawData(season: number, week: number): Promise<RawDataRecord[]>;

  /**
   * Abstract method for processing raw data into standardized format
   */
  protected abstract processData(rawData: RawDataRecord[], season: number, week: number): Promise<T[]>;

  /**
   * Abstract method for validating individual records
   */
  protected abstract validateRecord(record: T): boolean;

  /**
   * Rate limiting enforcement
   */
  protected async enforceRateLimit(): Promise<void> {
    if (!this.config.rateLimit) return;

    const now = Date.now();
    const hoursSinceReset = (now - this.rateLimitResetTime) / (1000 * 60 * 60);

    // Reset counters every hour
    if (hoursSinceReset >= 1) {
      this.requestCount = 0;
      this.rateLimitResetTime = now;
    }

    // Check if we've exceeded rate limit
    if (this.requestCount >= this.config.rateLimit.requestsPerHour) {
      const waitTime = (1000 * 60 * 60) - (now - this.rateLimitResetTime);
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 60000)} minutes.`);
    }

    // Enforce per-minute rate limit if specified
    if (this.config.rateLimit.requestsPerMinute) {
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minInterval = (60 * 1000) / this.config.rateLimit.requestsPerMinute;
      
      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        console.log(`[${this.config.sourceId}] Rate limiting: waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }

    this.requestCount++;
    this.lastRequestTime = now;
  }

  /**
   * HTTP request helper with timeout and retries
   */
  protected async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'College-Football-Fantasy-Bot/1.0',
        ...options.headers
      }
    };

    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retryAttempts! && this.isRetryableError(error)) {
          const delay = Math.pow(this.config.backoffMultiplier!, attempt - 1) * 1000;
          console.log(`[${this.config.sourceId}] Attempt ${attempt} failed, retrying in ${delay}ms`);
          await this.sleep(delay);
        } else {
          clearTimeout(timeoutId);
          break;
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Generate unique run ID for tracking
   */
  protected generateRunId(season: number, week: number): string {
    const timestamp = Date.now();
    return `${this.config.sourceId}_${season}W${week}_${timestamp}`;
  }

  /**
   * Create provenance record
   */
  protected createProvenanceRecord(
    fieldName: string,
    value: any,
    confidence: number = 1.0
  ): ProvenanceRecord {
    return {
      field_name: fieldName,
      value,
      source: this.config.sourceId as DataSource,
      timestamp: new Date().toISOString(),
      confidence,
      replacement_reason: 'initial_ingestion'
    };
  }

  /**
   * Calculate overall confidence score for dataset
   */
  protected calculateConfidence(data: T[]): number {
    if (data.length === 0) return 0;
    
    // Base confidence by adapter type
    const baseConfidence: Record<string, number> = {
      'team_notes': 0.95,      // Official sources are highly reliable
      'vendor': 0.85,          // Licensed vendors are good but not perfect  
      'stats_inference': 0.75, // Statistical inference is decent
      'manual_override': 1.0   // Manual overrides are always trusted
    };
    
    const base = baseConfidence[this.config.sourceType] || 0.5;
    
    // Adjust based on data completeness
    const completeness = data.length > 0 ? 1.0 : 0.0;
    
    return Math.min(1.0, base * completeness);
  }

  /**
   * Categorize errors for better handling
   */
  protected categorizeError(error: any): AdapterError['type'] {
    if (!error) return 'unknown';
    
    const message = String(error.message || error).toLowerCase();
    
    if (message.includes('timeout') || message.includes('network')) {
      return 'network';
    } else if (message.includes('rate limit') || message.includes('429')) {
      return 'rate_limit';
    } else if (message.includes('parse') || message.includes('json')) {
      return 'parsing';
    } else if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    
    return 'unknown';
  }

  /**
   * Determine if error is retryable
   */
  protected isRetryableError(error: any): boolean {
    const type = this.categorizeError(error);
    return ['network', 'rate_limit'].includes(type);
  }

  /**
   * Sleep helper for delays
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitize string for safe database storage
   */
  protected sanitizeString(value: any): string {
    if (value == null) return '';
    return String(value).trim().replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  }

  /**
   * Parse numeric value with fallback
   */
  protected parseNumeric(value: any, defaultValue: number = 0): number {
    if (value == null) return defaultValue;
    const parsed = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse date with fallback
   */
  protected parseDate(value: any): string {
    if (!value) return new Date().toISOString();
    
    try {
      if (value instanceof Date) return value.toISOString();
      return new Date(value).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Standardize player name for matching
   */
  protected standardizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(jr\.?|sr\.?|ii|iii|iv|v)\b/gi, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Standardize team name
   */
  protected standardizeTeamName(team: string): string {
    const teamMappings: Record<string, string> = {
      'miami': 'Miami',
      'miami (fl)': 'Miami',
      'miami hurricanes': 'Miami',
      'florida state': 'Florida State',
      'fsu': 'Florida State',
      'georgia tech': 'Georgia Tech',
      'gt': 'Georgia Tech',
      'north carolina': 'North Carolina',
      'unc': 'North Carolina',
      'nc state': 'NC State',
      'ncsu': 'NC State'
      // Add more mappings as needed
    };
    
    const normalized = team.toLowerCase().trim();
    return teamMappings[normalized] || team;
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(record: any, requiredFields: string[]): string[] {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (record[field] == null || record[field] === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    return errors;
  }
}

/**
 * Adapter Registry for managing all adapters
 */
export class AdapterRegistry {
  private adapters: Map<string, BaseAdapter> = new Map();

  register(adapter: BaseAdapter): void {
    this.adapters.set(adapter['config'].sourceId, adapter);
  }

  get(sourceId: string): BaseAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  getAll(): BaseAdapter[] {
    return Array.from(this.adapters.values());
  }

  getByType(sourceType: string): BaseAdapter[] {
    return this.getAll().filter(adapter => 
      adapter['config'].sourceType === sourceType
    );
  }
}

// Global registry instance
export const adapterRegistry = new AdapterRegistry();