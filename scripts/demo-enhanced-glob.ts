#!/usr/bin/env npx tsx

/**
 * Enhanced Glob Demo Script
 * 
 * Demonstrates the modern glob utilities with performance improvements,
 * better error handling, and advanced file search capabilities.
 */

import { 
  findFiles, 
  findFilesWithStats, 
  findAndReadFiles,
  findFilesByType,
  iterateFiles,
  FilePatterns,
  ProjectFileSearcher
} from '../lib/utils/glob-helpers';

async function demonstrateBasicUsage() {
  console.log('🔍 Basic Glob Usage Examples\n');

  try {
    // Find all TypeScript files
    console.log('1. Finding all TypeScript files:');
    const tsFiles = await findFiles(FilePatterns.typescript, {
      ignore: FilePatterns.ignorePatterns,
      maxDepth: 3
    });
    console.log(`   Found ${tsFiles.length} TypeScript files`);
    console.log(`   Examples: ${tsFiles.slice(0, 3).join(', ')}\n`);

    // Find test files
    console.log('2. Finding test files:');
    const testFiles = await findFiles(FilePatterns.tests, {
      ignore: FilePatterns.ignorePatterns
    });
    console.log(`   Found ${testFiles.length} test files`);
    console.log(`   Examples: ${testFiles.slice(0, 2).join(', ')}\n`);

    // Find files with stats
    console.log('3. Finding files with detailed stats:');
    const configFiles = await findFilesWithStats(FilePatterns.configs, {
      maxDepth: 2
    });
    
    console.log(`   Found ${configFiles.length} config files:`);
    for (const file of configFiles.slice(0, 3)) {
      console.log(`     ${file.path} - ${(file.size / 1024).toFixed(1)}KB, modified: ${file.modified.toLocaleDateString()}`);
    }
    console.log('');

  } catch (error) {
    console.error('Error in basic usage demo:', error);
  }
}

async function demonstrateAdvancedSearch() {
  console.log('🚀 Advanced Search Examples\n');

  try {
    // Search by file type with multiple criteria
    console.log('1. Advanced file type search:');
    const recentTsFiles = await findFilesByType('.', {
      extensions: ['ts', 'tsx'],
      excludePatterns: FilePatterns.ignorePatterns,
      minSize: 1000, // At least 1KB
      maxSize: 50000, // Less than 50KB
      maxDepth: 4
    });
    
    console.log(`   Found ${recentTsFiles.length} TypeScript files (1-50KB)`);
    console.log(`   Examples: ${recentTsFiles.slice(0, 3).join(', ')}\n`);

    // Search by content
    console.log('2. Content-based search:');
    const appwriteFiles = await findFilesByType('.', {
      extensions: ['ts', 'js'],
      excludePatterns: FilePatterns.ignorePatterns,
      containsText: ['appwrite', 'database'],
      maxDepth: 3
    });
    
    console.log(`   Found ${appwriteFiles.length} files containing "appwrite" and "database"`);
    console.log(`   Examples: ${appwriteFiles.slice(0, 2).join(', ')}\n`);

  } catch (error) {
    console.error('Error in advanced search demo:', error);
  }
}

async function demonstrateProjectSearcher() {
  console.log('🏗️ Project File Searcher Examples\n');

  try {
    const searcher = new ProjectFileSearcher();

    // Find API routes
    console.log('1. Finding API routes:');
    const apiRoutes = await searcher.findApiRoutes();
    console.log(`   Found ${apiRoutes.length} API routes`);
    console.log(`   Examples: ${apiRoutes.slice(0, 3).join(', ')}\n`);

    // Find components
    console.log('2. Finding React components:');
    const components = await searcher.findComponents();
    console.log(`   Found ${components.length} component files`);
    console.log(`   Examples: ${components.slice(0, 3).join(', ')}\n`);

    // Find schema files
    console.log('3. Finding schema-related files:');
    const schemaFiles = await searcher.findSchemaFiles();
    console.log(`   Found ${schemaFiles.length} schema files`);
    console.log(`   Examples: ${schemaFiles.slice(0, 2).join(', ')}\n`);

    // Search by content with match counts
    console.log('4. Content search with match counts:');
    const projectionMatches = await searcher.searchByContent(
      FilePatterns.typescript,
      'projection',
      { ignoreCase: true }
    );
    
    console.log(`   Found ${projectionMatches.length} files containing "projection":`);
    for (const match of projectionMatches.slice(0, 5)) {
      console.log(`     ${match.path} - ${match.matches} matches`);
    }
    console.log('');

  } catch (error) {
    console.error('Error in project searcher demo:', error);
  }
}

async function demonstrateStreamingIteration() {
  console.log('🌊 Streaming File Iteration Example\n');

  try {
    console.log('Iterating through large file sets (streaming):');
    let count = 0;
    const maxToShow = 5;

    for await (const file of iterateFiles(FilePatterns.code, {
      ignore: FilePatterns.ignorePatterns,
      maxDepth: 3
    })) {
      if (count < maxToShow) {
        console.log(`   Processing: ${file}`);
      } else if (count === maxToShow) {
        console.log('   ... (streaming continues without loading all files into memory)');
      }
      
      count++;
      
      // Break after demonstrating a reasonable number
      if (count > 20) break;
    }
    
    console.log(`   Total files processed: ${count}\n`);

  } catch (error) {
    console.error('Error in streaming demo:', error);
  }
}

async function demonstratePerformanceComparison() {
  console.log('⚡ Performance Comparison\n');

  try {
    // Sync vs Async comparison
    console.log('Comparing synchronous vs asynchronous operations:');
    
    const pattern = '**/*.{ts,js}';
    const options = { 
      ignore: FilePatterns.ignorePatterns, 
      maxDepth: 2 
    };

    // Async version
    const asyncStart = Date.now();
    const asyncFiles = await findFiles(pattern, options);
    const asyncTime = Date.now() - asyncStart;
    
    console.log(`   Async: Found ${asyncFiles.length} files in ${asyncTime}ms`);
    
    // Memory usage for large file operations
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Read multiple files efficiently
    const filesToRead = asyncFiles.slice(0, 10);
    const filesWithContent = await findAndReadFiles(filesToRead);
    
    const memoryAfterRead = process.memoryUsage().heapUsed;
    const memoryDiff = ((memoryAfterRead - initialMemory) / 1024 / 1024).toFixed(2);
    
    console.log(`   Read ${filesWithContent.length} files, memory usage: +${memoryDiff}MB\n`);

  } catch (error) {
    console.error('Error in performance demo:', error);
  }
}

async function main() {
  console.log('🏈 Enhanced Glob Utilities Demo');
  console.log('==================================\n');

  try {
    await demonstrateBasicUsage();
    await demonstrateAdvancedSearch();
    await demonstrateProjectSearcher();
    await demonstrateStreamingIteration();
    await demonstratePerformanceComparison();

    console.log('✅ Demo completed successfully!');
    console.log('\n💡 Key Benefits of Enhanced Glob:');
    console.log('   • Better TypeScript support with modern ES modules');
    console.log('   • Improved error handling and logging');
    console.log('   • Performance optimizations for large codebases');
    console.log('   • Built-in common patterns and ignore lists');
    console.log('   • Streaming iteration for memory efficiency');
    console.log('   • Advanced filtering by size, date, content');
    console.log('   • Project-specific search utilities');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Command line options
import { program } from 'commander';

if (require.main === module) {
  program
    .name('demo-enhanced-glob')
    .description('Demonstrate enhanced glob utilities')
    .option('--basic', 'Run only basic examples')
    .option('--advanced', 'Run only advanced examples')
    .option('--project', 'Run only project searcher examples')
    .option('--stream', 'Run only streaming examples')
    .option('--perf', 'Run only performance examples');

  program.parse();
  const options = program.opts();

  if (Object.keys(options).length === 0) {
    // Run all demos
    main();
  } else {
    // Run specific demos
    (async () => {
      console.log('🏈 Enhanced Glob Utilities Demo');
      console.log('==================================\n');

      if (options.basic) await demonstrateBasicUsage();
      if (options.advanced) await demonstrateAdvancedSearch();
      if (options.project) await demonstrateProjectSearcher();
      if (options.stream) await demonstrateStreamingIteration();
      if (options.perf) await demonstratePerformanceComparison();

      console.log('✅ Selected demos completed!');
    })().catch(console.error);
  }
}