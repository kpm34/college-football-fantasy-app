/**
 * Modern Glob Utilities
 * 
 * Enhanced glob functions with the latest glob v11 features,
 * better error handling, performance optimizations, and TypeScript support.
 */

import { glob, globSync, globIterate, globIterateSync } from 'glob';
import { promises as fs } from 'fs';
import path from 'path';

export interface GlobOptions {
  /**
   * Current working directory to search within
   */
  cwd?: string;
  
  /**
   * Follow symbolic links
   */
  follow?: boolean;
  
  /**
   * Include dotfiles (files starting with .)
   */
  dot?: boolean;
  
  /**
   * Make glob case insensitive (default: true on macOS/Windows, false on Linux)
   */
  nocase?: boolean;
  
  /**
   * Patterns to ignore
   */
  ignore?: string | string[];
  
  /**
   * Maximum directory depth to traverse
   */
  maxDepth?: number;
  
  /**
   * Only return files (not directories)
   */
  filesOnly?: boolean;
  
  /**
   * Only return directories (not files)
   */
  dirsOnly?: boolean;
  
  /**
   * Include file stats in results
   */
  withFileTypes?: boolean;
  
  /**
   * Absolute paths instead of relative
   */
  absolute?: boolean;
}

export interface FileStats {
  path: string;
  stats: import('fs').Stats;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: Date;
}

/**
 * Enhanced glob function with better TypeScript support and error handling
 */
export async function findFiles(
  patterns: string | string[],
  options: GlobOptions = {}
): Promise<string[]> {
  try {
    const globOptions = buildGlobOptions(options);
    
    // Handle multiple patterns
    if (Array.isArray(patterns)) {
      const allResults = await Promise.all(
        patterns.map(pattern => glob(pattern, globOptions))
      );
      
      // Flatten and deduplicate results
      const combined = allResults.flat();
      return Array.from(new Set(combined)).sort();
    }
    
    const results = await glob(patterns, globOptions);
    return results.sort();
    
  } catch (error) {
    console.error('[GlobHelpers] Error finding files:', error);
    throw new Error(`Failed to find files with pattern "${patterns}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Synchronous version of findFiles
 */
export function findFilesSync(
  patterns: string | string[],
  options: GlobOptions = {}
): string[] {
  try {
    const globOptions = buildGlobOptions(options);
    
    if (Array.isArray(patterns)) {
      const allResults = patterns.map(pattern => globSync(pattern, globOptions));
      const combined = allResults.flat();
      return Array.from(new Set(combined)).sort();
    }
    
    const results = globSync(patterns, globOptions);
    return results.sort();
    
  } catch (error) {
    console.error('[GlobHelpers] Error finding files sync:', error);
    throw new Error(`Failed to find files with pattern "${patterns}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find files with detailed file statistics
 */
export async function findFilesWithStats(
  patterns: string | string[],
  options: GlobOptions = {}
): Promise<FileStats[]> {
  try {
    const files = await findFiles(patterns, { ...options, absolute: true });
    
    const statsPromises = files.map(async (filePath) => {
      try {
        const stats = await fs.stat(filePath);
        return {
          path: filePath,
          stats,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          size: stats.size,
          modified: stats.mtime
        };
      } catch (error) {
        console.warn(`[GlobHelpers] Failed to stat file ${filePath}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(statsPromises);
    return results.filter((stat): stat is FileStats => stat !== null);
    
  } catch (error) {
    console.error('[GlobHelpers] Error finding files with stats:', error);
    throw error;
  }
}

/**
 * Find files and read their contents
 */
export async function findAndReadFiles(
  patterns: string | string[],
  options: GlobOptions & { encoding?: BufferEncoding } = {}
): Promise<Array<{ path: string; content: string; size: number }>> {
  try {
    const files = await findFiles(patterns, options);
    const encoding = options.encoding || 'utf8';
    
    const readPromises = files.map(async (filePath) => {
      try {
        const fullPath = options.absolute ? filePath : path.resolve(options.cwd || process.cwd(), filePath);
        const content = await fs.readFile(fullPath, encoding);
        const stats = await fs.stat(fullPath);
        
        return {
          path: filePath,
          content,
          size: stats.size
        };
      } catch (error) {
        console.warn(`[GlobHelpers] Failed to read file ${filePath}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(readPromises);
    return results.filter((result): result is NonNullable<typeof result> => result !== null);
    
  } catch (error) {
    console.error('[GlobHelpers] Error finding and reading files:', error);
    throw error;
  }
}

/**
 * Iterate over files as they're found (streaming approach for large result sets)
 */
export async function* iterateFiles(
  patterns: string | string[],
  options: GlobOptions = {}
): AsyncIterable<string> {
  const globOptions = buildGlobOptions(options);
  
  try {
    if (Array.isArray(patterns)) {
      for (const pattern of patterns) {
        for await (const file of globIterate(pattern, globOptions)) {
          yield file;
        }
      }
    } else {
      for await (const file of globIterate(patterns, globOptions)) {
        yield file;
      }
    }
  } catch (error) {
    console.error('[GlobHelpers] Error iterating files:', error);
    throw error;
  }
}

/**
 * Find files by multiple criteria with advanced filtering
 */
export async function findFilesByType(
  baseDir: string,
  options: {
    extensions?: string[];
    namePatterns?: string[];
    excludePatterns?: string[];
    minSize?: number;
    maxSize?: number;
    modifiedAfter?: Date;
    modifiedBefore?: Date;
    containsText?: string[];
    maxDepth?: number;
  } = {}
): Promise<string[]> {
  try {
    // Build glob patterns from extensions and name patterns
    const patterns: string[] = [];
    
    if (options.extensions && options.extensions.length > 0) {
      const extPattern = options.extensions.length === 1 
        ? `**/*.${options.extensions[0]}` 
        : `**/*.{${options.extensions.join(',')}}`;
      patterns.push(extPattern);
    }
    
    if (options.namePatterns && options.namePatterns.length > 0) {
      patterns.push(...options.namePatterns.map(pattern => `**/${pattern}`));
    }
    
    if (patterns.length === 0) {
      patterns.push('**/*'); // Default to all files
    }
    
    const globOptions: GlobOptions = {
      cwd: baseDir,
      ignore: options.excludePatterns,
      maxDepth: options.maxDepth,
      filesOnly: true
    };
    
    let files = await findFiles(patterns, globOptions);
    
    // Apply additional filters if specified
    if (options.minSize || options.maxSize || options.modifiedAfter || options.modifiedBefore) {
      const filesWithStats = await findFilesWithStats(patterns, { ...globOptions, absolute: true });
      
      const filtered = filesWithStats.filter(fileStats => {
        if (options.minSize && fileStats.size < options.minSize) return false;
        if (options.maxSize && fileStats.size > options.maxSize) return false;
        if (options.modifiedAfter && fileStats.modified < options.modifiedAfter) return false;
        if (options.modifiedBefore && fileStats.modified > options.modifiedBefore) return false;
        return true;
      });
      
      files = filtered.map(f => path.relative(baseDir, f.path));
    }
    
    // Filter by content if specified
    if (options.containsText && options.containsText.length > 0) {
      const filesWithContent = await findAndReadFiles(files, { cwd: baseDir });
      
      files = filesWithContent
        .filter(file => 
          options.containsText!.every(text => 
            file.content.toLowerCase().includes(text.toLowerCase())
          )
        )
        .map(file => file.path);
    }
    
    return files.sort();
    
  } catch (error) {
    console.error('[GlobHelpers] Error finding files by type:', error);
    throw error;
  }
}

/**
 * Common patterns for different file types
 */
export const FilePatterns = {
  // TypeScript/JavaScript
  typescript: '**/*.{ts,tsx}',
  javascript: '**/*.{js,jsx}',
  code: '**/*.{ts,tsx,js,jsx}',
  
  // Tests
  tests: '**/*.{test,spec}.{ts,tsx,js,jsx}',
  
  // Config files
  configs: '**/*.{json,yaml,yml,toml,ini}',
  
  // Documentation
  docs: '**/*.{md,mdx,rst,txt}',
  
  // Images
  images: '**/*.{jpg,jpeg,png,gif,webp,svg,ico}',
  
  // Data files
  data: '**/*.{csv,json,xml,yaml,yml}',
  
  // Common ignore patterns
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.cache/**',
    'coverage/**',
    '**/.DS_Store',
    '**/Thumbs.db'
  ]
} as const;

/**
 * Optimized search for specific project files
 */
export class ProjectFileSearcher {
  private baseDir: string;
  private commonIgnores: string[];
  
  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    this.commonIgnores = FilePatterns.ignorePatterns;
  }
  
  /**
   * Find API routes
   */
  async findApiRoutes(): Promise<string[]> {
    return await findFiles('app/api/**/route.{ts,js}', {
      cwd: this.baseDir,
      ignore: this.commonIgnores
    });
  }
  
  /**
   * Find components
   */
  async findComponents(): Promise<string[]> {
    return await findFiles([
      'components/**/*.{ts,tsx}',
      'app/components/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}'
    ], {
      cwd: this.baseDir,
      ignore: this.commonIgnores
    });
  }
  
  /**
   * Find configuration files
   */
  async findConfigs(): Promise<string[]> {
    return await findFiles([
      '*.config.{js,ts,mjs}',
      '.*rc',
      '.*rc.{js,json,yaml,yml}',
      'package.json',
      'tsconfig.json'
    ], {
      cwd: this.baseDir,
      maxDepth: 2
    });
  }
  
  /**
   * Find schema-related files
   */
  async findSchemaFiles(): Promise<string[]> {
    return await findFiles([
      '**/schema*.{ts,js,json}',
      '**/types/**/*.{ts,js}',
      '**/models/**/*.{ts,js}'
    ], {
      cwd: this.baseDir,
      ignore: this.commonIgnores
    });
  }
  
  /**
   * Search files by content
   */
  async searchByContent(
    patterns: string | string[],
    searchText: string,
    options: { ignoreCase?: boolean; wholeWord?: boolean } = {}
  ): Promise<Array<{ path: string; matches: number }>> {
    try {
      const files = await findAndReadFiles(patterns, {
        cwd: this.baseDir,
        ignore: this.commonIgnores
      });
      
      const searchRegex = new RegExp(
        options.wholeWord ? `\\b${searchText}\\b` : searchText,
        options.ignoreCase ? 'gi' : 'g'
      );
      
      return files
        .map(file => ({
          path: file.path,
          matches: (file.content.match(searchRegex) || []).length
        }))
        .filter(result => result.matches > 0)
        .sort((a, b) => b.matches - a.matches);
        
    } catch (error) {
      console.error('[ProjectFileSearcher] Error searching by content:', error);
      throw error;
    }
  }
}

/**
 * Build glob options from our enhanced options
 */
function buildGlobOptions(options: GlobOptions): any {
  const globOptions: any = {};
  
  if (options.cwd) globOptions.cwd = options.cwd;
  if (options.ignore) globOptions.ignore = options.ignore;
  if (options.dot !== undefined) globOptions.dot = options.dot;
  if (options.nocase !== undefined) globOptions.nocase = options.nocase;
  if (options.follow !== undefined) globOptions.follow = options.follow;
  if (options.maxDepth !== undefined) globOptions.maxDepth = options.maxDepth;
  if (options.absolute !== undefined) globOptions.absolute = options.absolute;
  if (options.withFileTypes !== undefined) globOptions.withFileTypes = options.withFileTypes;
  
  // Handle filesOnly/dirsOnly options
  if (options.filesOnly) {
    globOptions.nodir = true;
  } else if (options.dirsOnly) {
    // For directories only, we'll need to filter results post-glob
    globOptions.mark = true; // Mark directories with trailing /
  }
  
  return globOptions;
}