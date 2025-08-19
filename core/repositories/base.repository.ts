/**
 * Base Repository Pattern
 * Provides common database operations with caching and platform optimization
 */

import { Client, Databases, Query, Models, ID as ClientID } from 'appwrite';
import { Client as ServerClient, Databases as ServerDatabases, ID as ServerID } from 'node-appwrite';
import { randomUUID } from 'crypto';
import { env } from '../config/environment';
import { AppError, NotFoundError, ValidationError } from '../errors/app-error';
import { SchemaValidator } from '../validation/schema-enforcer';

// Conditionally import KV only if configured
let kv: any = null;
if (env.features.caching) {
  import('@vercel/kv').then(module => {
    kv = module.kv;
  }).catch(() => {
    console.warn('Vercel KV not available - caching disabled');
  });
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  cache?: {
    key?: string;
    ttl?: number; // seconds
    bypass?: boolean;
  };
}

export interface CreateOptions {
  invalidateCache?: string[];
}

export interface UpdateOptions extends CreateOptions {
  partial?: boolean;
}

export abstract class BaseRepository<T extends Models.Document> {
  protected databases: Databases | ServerDatabases;
  protected databaseId: string;
  protected collectionId: string;
  protected cachePrefix: string;
  protected defaultCacheTTL: number = 300; // 5 minutes

  constructor(
    protected isServer: boolean = true,
    protected client?: Client | ServerClient
  ) {
    this.databaseId = env.client.appwrite.databaseId;
    
    if (isServer) {
      if (!client) {
        // Create server client with API key
        const serverClient = new ServerClient()
          .setEndpoint(env.server.appwrite.endpoint)
          .setProject(env.server.appwrite.projectId)
          .setKey(env.server.appwrite.apiKey);
        this.client = serverClient;
      }
      this.databases = new ServerDatabases(this.client as ServerClient);
    } else {
      if (!client) {
        // Create client instance
        const browserClient = new Client()
          .setEndpoint(env.client.appwrite.endpoint)
          .setProject(env.client.appwrite.projectId);
        this.client = browserClient;
      }
      this.databases = new Databases(this.client as Client);
    }
  }

  /**
   * Get a single document by ID
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    try {
      // Check cache if enabled
      const cacheKey = options?.cache?.key || `${this.cachePrefix}:${id}`;
      if (!options?.cache?.bypass && env.features.caching) {
        const cached = await this.getFromCache<T>(cacheKey);
        if (cached) return cached;
      }

      // Fetch from database
      const document = await this.databases.getDocument(
        this.databaseId,
        this.collectionId,
        id
      ) as T;

      // Cache the result
      if (env.features.caching) {
        await this.setCache(cacheKey, document, options?.cache?.ttl || this.defaultCacheTTL);
      }

      return document;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw new AppError(500, 'REPOSITORY_ERROR', `Failed to find document: ${error.message}`);
    }
  }

  /**
   * Find multiple documents with filtering
   */
  async find(options?: QueryOptions): Promise<{ documents: T[]; total: number }> {
    try {
      const queries: string[] = [];

      // Build queries
      if (options?.limit) {
        queries.push(Query.limit(options.limit));
      }
      if (options?.offset) {
        queries.push(Query.offset(options.offset));
      }
      if (options?.orderBy) {
        const order = options.orderDirection === 'asc' 
          ? Query.orderAsc(options.orderBy)
          : Query.orderDesc(options.orderBy);
        queries.push(order);
      }
      if (options?.search) {
        queries.push(Query.search('search', options.search));
      }

      // Add custom filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            queries.push(Query.equal(key, value));
          } else if (value !== null && value !== undefined) {
            queries.push(Query.equal(key, [value]));
          }
        });
      }

      // Check cache for list queries
      const cacheKey = options?.cache?.key || 
        `${this.cachePrefix}:list:${JSON.stringify({ queries, options })}`;
      
      if (!options?.cache?.bypass && env.features.caching) {
        const cached = await this.getFromCache<{ documents: T[]; total: number }>(cacheKey);
        if (cached) return cached;
      }

      // Fetch from database
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        queries
      );

      const result = {
        documents: response.documents as T[],
        total: response.total
      };

      // Cache the result
      if (env.features.caching) {
        await this.setCache(cacheKey, result, options?.cache?.ttl || this.defaultCacheTTL);
      }

      return result;
    } catch (error: any) {
      throw new AppError(500, 'REPOSITORY_ERROR', `Failed to find documents: ${error.message}`);
    }
  }

  /**
   * Create a new document with schema transformation
   */
  async create(data: Partial<T>, options?: CreateOptions): Promise<T> {
    try {
      // Validate data
      await this.validateCreate(data);

      // Transform data for schema compliance
      const transformedData = SchemaValidator.transform(this.collectionId, data);

      // Never allow caller-provided IDs to leak into create payload
      // Appwrite determines ID from the third argument only
      if ((transformedData as any).$id) {
        delete (transformedData as any).$id;
      }

      // Create document with retry on rare duplicate-ID collisions
      let lastError: any | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const idToUse = attempt === 0
            ? (this.isServer ? ServerID : ClientID).unique()
            : randomUUID().replace(/-/g, '').slice(0, 36);

          const document = await this.databases.createDocument(
            this.databaseId,
            this.collectionId,
            idToUse,
            transformedData
          ) as T;

          // Invalidate related caches
          if (options?.invalidateCache) {
            await this.invalidateCache(options.invalidateCache);
          }

          // Invalidate list caches
          await this.invalidateCache([`${this.cachePrefix}:list:*`]);

          return document;
        } catch (err: any) {
          lastError = err;
          const message = String(err?.message || '');
          const isDuplicateId = message.includes('requested ID already exists') || message.includes('already exists');
          // Retry only on duplicate ID errors; otherwise throw immediately
          if (!isDuplicateId) {
            throw err;
          }
          // Continue to next attempt with a brand-new UUID
        }
      }

      // If we exhausted retries, throw enriched error
      throw lastError;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const message = `Failed to create document in collection '${this.collectionId}': ${error.message}`;
      console.error(message);
      throw new AppError(500, 'REPOSITORY_ERROR', message);
    }
  }

  /**
   * Update an existing document with schema transformation
   */
  async update(id: string, data: Partial<T>, options?: UpdateOptions): Promise<T> {
    try {
      // Validate data
      await this.validateUpdate(id, data);

      // Get existing document if doing partial update
      let updateData = data;
      if (options?.partial) {
        const existing = await this.findById(id);
        if (!existing) {
          throw new NotFoundError(`Document ${id} not found`);
        }
        updateData = { ...existing, ...data, $id: id };
      }

      // Transform data for schema compliance
      const transformedData = SchemaValidator.transform(this.collectionId, updateData);

      // Update document
      const document = await this.databases.updateDocument(
        this.databaseId,
        this.collectionId,
        id,
        transformedData
      ) as T;

      // Invalidate caches
      await this.invalidateCache([
        `${this.cachePrefix}:${id}`,
        `${this.cachePrefix}:list:*`,
        ...(options?.invalidateCache || [])
      ]);

      return document;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'REPOSITORY_ERROR', `Failed to update document: ${error.message}`);
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string, options?: UpdateOptions): Promise<void> {
    try {
      await this.databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        id
      );

      // Invalidate caches
      await this.invalidateCache([
        `${this.cachePrefix}:${id}`,
        `${this.cachePrefix}:list:*`,
        ...(options?.invalidateCache || [])
      ]);
    } catch (error: any) {
      throw new AppError(500, 'REPOSITORY_ERROR', `Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Count documents matching criteria
   */
  async count(options?: QueryOptions): Promise<number> {
    const result = await this.find({ ...options, limit: 1 });
    return result.total;
  }

  /**
   * Check if a document exists
   */
  async exists(id: string): Promise<boolean> {
    const document = await this.findById(id);
    return document !== null;
  }

  /**
   * Get from cache (Vercel KV)
   */
  protected async getFromCache<R>(key: string): Promise<R | null> {
    try {
      if (!env.features.caching) return null;
      const cached = await kv.get<R>(key);
      return cached;
    } catch (error) {
      console.warn(`Cache get failed for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache (Vercel KV)
   */
  protected async setCache(key: string, value: any, ttl: number): Promise<void> {
    try {
      if (!env.features.caching) return;
      await kv.setex(key, ttl, value);
    } catch (error) {
      console.warn(`Cache set failed for ${key}:`, error);
    }
  }

  /**
   * Invalidate cache patterns
   */
  protected async invalidateCache(patterns: string[]): Promise<void> {
    try {
      if (!env.features.caching) return;
      
      for (const pattern of patterns) {
        if (pattern.endsWith('*')) {
          // Pattern matching - scan and delete
          const keys = await kv.keys(pattern);
          if (keys.length > 0) {
            await kv.del(...keys);
          }
        } else {
          // Direct key deletion
          await kv.del(pattern);
        }
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }

  /**
   * Validate data before create - override in subclasses
   */
  protected async validateCreate(data: Partial<T>): Promise<void> {
    // Override in subclasses for specific validation
  }

  /**
   * Validate data before update - override in subclasses
   */
  protected async validateUpdate(id: string, data: Partial<T>): Promise<void> {
    // Override in subclasses for specific validation
  }

  /**
   * Subscribe to realtime changes
   */
  subscribeToChanges(
    callback: (event: any) => void,
    documentId?: string
  ): () => void {
    if (this.isServer) {
      throw new Error('Realtime subscriptions are only available on client side');
    }

    const channel = documentId
      ? `databases.${this.databaseId}.collections.${this.collectionId}.documents.${documentId}`
      : `databases.${this.databaseId}.collections.${this.collectionId}.documents`;

    const unsubscribe = (this.client as Client).subscribe(channel, callback);
    return unsubscribe;
  }
}
