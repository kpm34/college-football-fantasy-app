import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { 
  registerAppwriteTools, 
  registerVercelTools, 
  registerSplineTools,
  registerThirdEyeCapitalTools,
  registerLovableTools,
  registerGoHighLevelTools
} from './platform-tools';

const handler = createMcpHandler(
  (server) => {
    // Register platform-specific tools
    registerAppwriteTools(server);
    registerVercelTools(server);
    registerSplineTools(server);
    registerThirdEyeCapitalTools(server);
    registerLovableTools(server);
    registerGoHighLevelTools(server);
    // ========== ROUTE & NAVIGATION TOOLS ==========
    
    // Get current page/route information
    server.tool(
      'get_current_route',
      'Gets information about the current route and page',
      {},
      async () => {
        const headersList = await headers();
        const referer = headersList.get('referer') || 'No referer';
        const host = headersList.get('host') || 'localhost:3000';
        const userAgent = headersList.get('user-agent') || 'Unknown';
        
        return {
          content: [{ 
            type: 'text', 
            text: `Current route info:\n- Host: ${host}\n- Referer: ${referer}\n- User Agent: ${userAgent}\n- Base URL: http://${host}` 
          }],
        };
      },
    );

    // List all available routes
    server.tool(
      'list_routes',
      'Lists all available routes in the app',
      {},
      async () => {
        const appDir = path.join(process.cwd(), 'app');
        const routes: string[] = [];
        
        async function findRoutes(dir: string, basePath: string = ''): Promise<void> {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('(') && !entry.name.startsWith('_')) {
              const routePath = basePath + '/' + entry.name;
              const fullPath = path.join(dir, entry.name);
              
              // Check if it has a page.tsx
              try {
                await fs.access(path.join(fullPath, 'page.tsx'));
                routes.push(routePath);
              } catch {}
              
              // Recurse
              await findRoutes(fullPath, routePath);
            }
          }
        }
        
        try {
          // Add root route
          try {
            await fs.access(path.join(appDir, 'page.tsx'));
            routes.push('/');
          } catch {}
          
          await findRoutes(appDir);
          
          return {
            content: [{ 
              type: 'text', 
              text: `Available routes:\n${routes.map(r => `- ${r}`).join('\n')}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error listing routes: ${error}` 
            }],
          };
        }
      },
    );

    // ========== PROJECT STRUCTURE TOOLS ==========
    
    // Get project structure
    server.tool(
      'get_project_structure',
      'Gets the file structure of any directory',
      { 
        directory: z.string().optional().default('app'),
        maxDepth: z.number().optional().default(3),
        showHidden: z.boolean().optional().default(false)
      },
      async ({ directory, maxDepth, showHidden }) => {
        const baseDir = path.join(process.cwd(), directory);
        
        async function getDirectoryStructure(dir: string, depth: number = 0): Promise<string> {
          if (depth >= maxDepth) return '';
          
          const entries = await fs.readdir(dir, { withFileTypes: true });
          let structure = '';
          
          for (const entry of entries) {
            if (!showHidden && entry.name.startsWith('.')) continue;
            if (entry.name === 'node_modules' || entry.name === '.next') continue;
            
            const indent = '  '.repeat(depth);
            if (entry.isDirectory()) {
              structure += `${indent}📁 ${entry.name}/\n`;
              structure += await getDirectoryStructure(path.join(dir, entry.name), depth + 1);
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name);
              const icon = 
                ext === '.ts' || ext === '.tsx' ? '📄' : 
                ext === '.js' || ext === '.jsx' ? '📜' :
                ext === '.css' || ext === '.scss' ? '🎨' :
                ext === '.json' ? '📋' :
                ext === '.md' ? '📝' :
                ext === '.env' ? '🔐' : '📄';
              structure += `${indent}${icon} ${entry.name}\n`;
            }
          }
          
          return structure;
        }
        
        try {
          const structure = await getDirectoryStructure(baseDir);
          return {
            content: [{ 
              type: 'text', 
              text: `Project structure for ${directory}:\n\n${structure}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error reading directory: ${error}` 
            }],
          };
        }
      },
    );

    // Read file content
    server.tool(
      'read_file',
      'Reads the content of a specific file',
      { 
        filePath: z.string(),
        lineStart: z.number().optional(),
        lineEnd: z.number().optional()
      },
      async ({ filePath, lineStart, lineEnd }) => {
        try {
          const fullPath = path.join(process.cwd(), filePath);
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');
          
          let result = content;
          if (lineStart !== undefined || lineEnd !== undefined) {
            const start = (lineStart || 1) - 1;
            const end = lineEnd || lines.length;
            result = lines.slice(start, end).join('\n');
          }
          
          // Truncate if too long
          if (result.length > 10000) {
            result = result.substring(0, 10000) + '\n\n... (truncated)';
          }
          
          return {
            content: [{ 
              type: 'text', 
              text: `File content for ${filePath}:\n\`\`\`\n${result}\n\`\`\`` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error reading file: ${error}` 
            }],
          };
        }
      },
    );

    // ========== ENVIRONMENT & SYSTEM TOOLS ==========
    
    // Get environment variables (safe ones only)
    server.tool(
      'get_env_info',
      'Gets safe environment information',
      {},
      async () => {
        const safeEnvVars = {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          VERCEL_ENV: process.env.VERCEL_ENV,
          VERCEL_URL: process.env.VERCEL_URL,
          VERCEL_REGION: process.env.VERCEL_REGION,
          NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
          // Show which env vars are set (but not their values)
          AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY ? '✅ Set' : '❌ Not set',
          VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN ? '✅ Set' : '❌ Not set',
        };
        
        const envInfo = Object.entries(safeEnvVars)
          .map(([key, value]) => `${key}: ${value || 'Not set'}`)
          .join('\n');
        
        return {
          content: [{ 
            type: 'text', 
            text: `Environment Information:\n${envInfo}` 
          }],
        };
      },
    );

    // Get system information
    server.tool(
      'get_system_info',
      'Gets system and runtime information',
      {},
      async () => {
        const systemInfo = {
          'Platform': os.platform(),
          'Architecture': os.arch(),
          'Node Version': process.version,
          'CPU Count': os.cpus().length,
          'Total Memory': `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
          'Free Memory': `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
          'Uptime': `${Math.round(os.uptime() / 60 / 60)} hours`,
          'Current Directory': process.cwd(),
          'Process ID': process.pid,
        };
        
        const info = Object.entries(systemInfo)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        
        return {
          content: [{ 
            type: 'text', 
            text: `System Information:\n${info}` 
          }],
        };
      },
    );

    // ========== PACKAGE & DEPENDENCY TOOLS ==========
    
    // Get package.json info
    server.tool(
      'get_package_info',
      'Gets detailed information from package.json',
      {},
      async () => {
        try {
          const packageJson = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8');
          const pkg = JSON.parse(packageJson);
          
          const info = {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
            scripts: pkg.scripts,
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
            engines: pkg.engines,
          };
          
          return {
            content: [{ 
              type: 'text', 
              text: `Package Info:\n${JSON.stringify(info, null, 2)}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error reading package.json: ${error}` 
            }],
          };
        }
      },
    );

    // Check for outdated packages
    server.tool(
      'check_outdated_packages',
      'Checks for outdated npm packages',
      {},
      async () => {
        try {
          const { exec } = require('child_process');
          const { promisify } = require('util');
          const execAsync = promisify(exec);
          
          const { stdout } = await execAsync('npm outdated --json || true');
          const outdated = stdout ? JSON.parse(stdout) : {};
          
          if (Object.keys(outdated).length === 0) {
            return {
              content: [{ 
                type: 'text', 
                text: 'All packages are up to date!' 
              }],
            };
          }
          
          const outdatedList = Object.entries(outdated)
            .map(([name, info]: [string, any]) => 
              `- ${name}: ${info.current} → ${info.wanted} (latest: ${info.latest})`
            )
            .join('\n');
          
          return {
            content: [{ 
              type: 'text', 
              text: `Outdated packages:\n${outdatedList}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error checking outdated packages: ${error}` 
            }],
          };
        }
      },
    );

    // ========== PAGE CONTENT & API TOOLS ==========
    
    // Get page content/HTML
    server.tool(
      'get_page_content',
      'Fetches the HTML content of a specific route',
      { 
        route: z.string().default('/'),
        selector: z.string().optional()
      },
      async ({ route, selector }) => {
        try {
          const headersList = await headers();
          const host = headersList.get('host') || 'localhost:3000';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const url = `${protocol}://${host}${route}`;
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'MCP-Handler/1.0',
            },
          });
          
          if (!response.ok) {
            return {
              content: [{ 
                type: 'text', 
                text: `Error fetching ${route}: ${response.status} ${response.statusText}` 
              }],
            };
          }
          
          const html = await response.text();
          
          // If selector provided, try to extract specific content
          if (selector) {
            // Simple extraction for common selectors
            const match = html.match(new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i'));
            if (match) {
              return {
                content: [{ 
                  type: 'text', 
                  text: `Content for ${selector} in ${route}:\n\n${match[1]}` 
                }],
              };
            }
          }
          
          // Extract just the body content for brevity
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          const content = bodyMatch ? bodyMatch[1] : html;
          
          // Truncate if too long
          const truncated = content.length > 5000 ? content.substring(0, 5000) + '\n\n... (truncated)' : content;
          
          return {
            content: [{ 
              type: 'text', 
              text: `Page content for ${route}:\n\n${truncated}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error fetching page: ${error}` 
            }],
          };
        }
      },
    );

    // Test API endpoint
    server.tool(
      'test_api_endpoint',
      'Tests an API endpoint with various HTTP methods',
      { 
        endpoint: z.string(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
        body: z.any().optional(),
        headers: z.record(z.string()).optional()
      },
      async ({ endpoint, method, body, headers: customHeaders }) => {
        try {
          const headersList = await headers();
          const host = headersList.get('host') || 'localhost:3000';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const url = `${protocol}://${host}${endpoint}`;
          
          const options: RequestInit = {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...customHeaders,
            },
          };
          
          if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
          }
          
          const response = await fetch(url, options);
          const responseText = await response.text();
          
          let responseBody;
          try {
            responseBody = JSON.parse(responseText);
          } catch {
            responseBody = responseText;
          }
          
          return {
            content: [{ 
              type: 'text', 
              text: `API Test Result:\n` +
                `Endpoint: ${method} ${url}\n` +
                `Status: ${response.status} ${response.statusText}\n` +
                `Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}\n` +
                `Response: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody, null, 2)}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error testing API: ${error}` 
            }],
          };
        }
      },
    );

    // ========== ERROR & LOG TOOLS ==========
    
    // Get recent logs
    server.tool(
      'get_recent_logs',
      'Gets recent console logs from the application',
      { 
        logType: z.enum(['all', 'error', 'warn', 'info']).default('all'),
        limit: z.number().default(50)
      },
      async ({ logType, limit }) => {
        // Note: This would need to be implemented with a logging service
        // For now, we'll return a message about setting up logging
        return {
          content: [{ 
            type: 'text', 
            text: `To enable log collection, consider implementing:\n` +
              `1. Winston or Pino for structured logging\n` +
              `2. Sentry for error tracking\n` +
              `3. Custom middleware to capture console output\n` +
              `4. Integration with Vercel logs API` 
          }],
        };
      },
    );

    // ========== PERFORMANCE TOOLS ==========
    
    // Get performance metrics
    server.tool(
      'get_performance_metrics',
      'Gets basic performance metrics',
      {},
      async () => {
        const metrics = {
          'Memory Usage': `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          'Memory Total': `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          'External Memory': `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
          'Process Uptime': `${Math.round(process.uptime())} seconds`,
          'CPU Usage': process.cpuUsage(),
        };
        
        return {
          content: [{ 
            type: 'text', 
            text: `Performance Metrics:\n${JSON.stringify(metrics, null, 2)}` 
          }],
        };
      },
    );

    // ========== DATABASE TOOLS ==========
    
    // Get database schema info
    server.tool(
      'get_database_info',
      'Gets information about database connections and schema',
      {},
      async () => {
        // This would need to be customized based on your database
        return {
          content: [{ 
            type: 'text', 
            text: `Database tools can be configured for:\n` +
              `- Prisma: prisma.schema inspection\n` +
              `- Mongoose: Model inspection\n` +
              `- Direct SQL: Connection status\n` +
              `- Appwrite: Collection schemas\n` +
              `Configure based on your database choice.` 
          }],
        };
      },
    );

    // ========== SEARCH TOOLS ==========
    
    // Search for text in project files
    server.tool(
      'search_in_files',
      'Searches for text across project files',
      { 
        searchTerm: z.string(),
        filePattern: z.string().optional().default('**/*.{ts,tsx,js,jsx}'),
        caseSensitive: z.boolean().optional().default(false)
      },
      async ({ searchTerm, filePattern, caseSensitive }) => {
        try {
          const { exec } = require('child_process');
          const { promisify } = require('util');
          const execAsync = promisify(exec);
          
          const grepCommand = caseSensitive 
            ? `grep -r "${searchTerm}" --include="${filePattern}" .`
            : `grep -ri "${searchTerm}" --include="${filePattern}" .`;
          
          try {
            const { stdout } = await execAsync(grepCommand, { cwd: process.cwd() });
            const matches = stdout.split('\n').filter(Boolean).slice(0, 20);
            
            return {
              content: [{ 
                type: 'text', 
                text: `Search results for "${searchTerm}":\n${matches.join('\n')}\n\n${matches.length >= 20 ? '... (limited to 20 results)' : ''}` 
              }],
            };
          } catch (error: any) {
            if (error.code === 1) {
              return {
                content: [{ 
                  type: 'text', 
                  text: `No matches found for "${searchTerm}"` 
                }],
              };
            }
            throw error;
          }
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error searching files: ${error}` 
            }],
          };
        }
      },
    );

    // ========== GIT TOOLS ==========
    
    // Get git status
    server.tool(
      'get_git_status',
      'Gets current git status and recent commits',
      {},
      async () => {
        try {
          const { exec } = require('child_process');
          const { promisify } = require('util');
          const execAsync = promisify(exec);
          
          const [status, log] = await Promise.all([
            execAsync('git status --short'),
            execAsync('git log --oneline -10')
          ]);
          
          return {
            content: [{ 
              type: 'text', 
              text: `Git Status:\n${status.stdout || 'Working tree clean'}\n\nRecent Commits:\n${log.stdout}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error getting git status: ${error}` 
            }],
          };
        }
      },
    );

    // ========== COMPONENT ANALYSIS TOOLS ==========
    
    // Analyze React components
    server.tool(
      'analyze_components',
      'Analyzes React components in a directory',
      { 
        directory: z.string().default('app')
      },
      async ({ directory }) => {
        try {
          const componentsDir = path.join(process.cwd(), directory);
          const components: any[] = [];
          
          async function findComponents(dir: string): Promise<void> {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
              if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
                const content = await fs.readFile(path.join(dir, entry.name), 'utf-8');
                
                // Simple component detection
                const exportMatch = content.match(/export\s+(default\s+)?(?:function|const)\s+(\w+)/);
                if (exportMatch) {
                  components.push({
                    name: exportMatch[2],
                    file: path.relative(process.cwd(), path.join(dir, entry.name)),
                    isDefault: !!exportMatch[1],
                    hasProps: content.includes('Props'),
                    hasState: content.includes('useState'),
                    hasEffect: content.includes('useEffect'),
                  });
                }
              } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                await findComponents(path.join(dir, entry.name));
              }
            }
          }
          
          await findComponents(componentsDir);
          
          return {
            content: [{ 
              type: 'text', 
              text: `React Components Analysis:\n${JSON.stringify(components, null, 2)}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error analyzing components: ${error}` 
            }],
          };
        }
      },
    );
  },
  {},
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE };