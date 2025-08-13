import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { 
  registerAppwriteTools, 
  registerVercelTools, 
  registerThirdEyeCapitalTools,
  registerLovableTools,
  registerGoHighLevelTools
} from './platform-tools';
import { Client, Databases, Teams } from 'appwrite';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = createMcpHandler(
  (server) => {
    // Register platform-specific tools
    registerAppwriteTools(server);
    registerVercelTools(server);
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

    // ========== COLLEGE FOOTBALL FANTASY TOOLS ==========
    
    // Get fantasy app status
    server.tool(
      'fantasy_app_status',
      'Gets comprehensive status of the College Football Fantasy app',
      {},
      async () => {
        const headersList = await headers();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        
        const status = {
          app: {
            name: 'College Football Fantasy',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            url: `${protocol}://${host}`,
            deployment: process.env.VERCEL_URL ? 'Vercel' : 'Local',
          },
          features: {
            conferences: ['Big Ten', 'SEC', 'Big 12', 'ACC'],
            eligibility: 'AP Top-25 opponents OR conference games only',
            season: '12-week regular season',
            draftSystem: 'Real-time drafting with Appwrite',
            auctionSystem: 'Live bidding with budget management',
            teamColors: 'Individual team colors for all Power 4 teams',
            dataSources: ['ESPN API', 'CollegeFootballData API', 'Appwrite'],
          },
          integrations: {
            appwrite: !!process.env.APPWRITE_PROJECT_ID,
            vercel: !!process.env.VERCEL_URL,
            spline: 'removed',
            aiGateway: !!process.env.AI_GATEWAY_API_KEY,
          },
          pages: [
            '/',
            '/conference-showcase',
            '/conference-showcase-2',
            '/league/create',
            '/league/join',
            '/draft/[leagueId]',
            '/auction/[leagueId]',
            '/team/[teamId]',
            '/scoreboard',
            '/standings',
          ]
        };
        
        return {
          content: [{ 
            type: 'text', 
            text: `College Football Fantasy App Status:\n${JSON.stringify(status, null, 2)}` 
          }],
        };
      },
    );

    // Test team colors functionality
    server.tool(
      'test_team_colors',
      'Tests the team colors system for Power 4 conferences',
      { 
        teamName: z.string().optional().default('Michigan Wolverines')
      },
      async ({ teamName }) => {
        try {
          // Import the team colors function
          const { getTeamColors } = await import('../../../lib/team-colors');
          const colors = getTeamColors(teamName);
          
          return {
            content: [{ 
              type: 'text', 
              text: `Team Colors Test:\nTeam: ${teamName}\nPrimary: ${colors.primary}\nSecondary: ${colors.secondary}\n\nColor Preview:\n🟦 Primary: ${colors.primary}\n🟨 Secondary: ${colors.secondary}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error testing team colors: ${error}` 
            }],
          };
        }
      },
    );

    // Get conference data
    server.tool(
      'get_conference_data',
      'Gets data for a specific Power 4 conference',
      { 
        conference: z.enum(['bigten', 'sec', 'big12', 'acc']),
        dataType: z.enum(['teams', 'players', 'games']).default('teams')
      },
      async ({ conference, dataType }) => {
        try {
          const headersList = await headers();
          const host = headersList.get('host') || 'localhost:3000';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          
          const response = await fetch(`${protocol}://${host}/api/${conference}?type=${dataType}`);
          
          if (!response.ok) {
            return {
              content: [{ 
                type: 'text', 
                text: `Error fetching ${conference} ${dataType}: ${response.status} ${response.statusText}` 
              }],
            };
          }
          
          const data = await response.json();
          
          return {
            content: [{ 
              type: 'text', 
              text: `${conference.toUpperCase()} ${dataType}:\n${JSON.stringify(data, null, 2)}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error getting conference data: ${error}` 
            }],
          };
        }
      },
    );

    // Check draft system status
    server.tool(
      'check_draft_system',
      'Checks the status of the draft system and components',
      {},
      async () => {
        try {
          const draftComponents = [
            'app/draft/[leagueId]/page.tsx',
            'components/draft/DraftBoard.tsx',
            'components/draft/PickPlayerModal.tsx',
            'components/draft/DraftTimer.tsx',
            'components/draft/DraftOrder.tsx',
            'types/draft.ts'
          ];
          
          const auctionComponents = [
            'app/auction/[leagueId]/page.tsx',
            'components/auction/AuctionBoard.tsx',
            'components/auction/AuctionModal.tsx',
            'components/auction/AuctionTimer.tsx',
            'components/auction/TeamBudgets.tsx',
            'types/auction.ts'
          ];
          
          const results = await Promise.all([
            ...draftComponents.map(async (comp) => {
              try {
                await fs.access(path.join(process.cwd(), comp));
                return { component: comp, exists: true };
              } catch {
                return { component: comp, exists: false };
              }
            }),
            ...auctionComponents.map(async (comp) => {
              try {
                await fs.access(path.join(process.cwd(), comp));
                return { component: comp, exists: true };
              } catch {
                return { component: comp, exists: false };
              }
            })
          ]);
          
          const draftStatus = results.slice(0, draftComponents.length);
          const auctionStatus = results.slice(draftComponents.length);
          
          return {
            content: [{ 
              type: 'text', 
              text: `Draft System Status:\n${draftStatus.map(r => `${r.exists ? '✅' : '❌'} ${r.component}`).join('\n')}\n\nAuction System Status:\n${auctionStatus.map(r => `${r.exists ? '✅' : '❌'} ${r.component}`).join('\n')}` 
            }],
          };
        } catch (error) {
          return {
            content: [{ 
              type: 'text', 
              text: `Error checking draft system: ${error}` 
            }],
          };
        }
      },
    );

    // ========== GIT & DEVELOPMENT TOOLS ==========
    
    // Get git status
    server.tool(
      'get_git_status',
      'Gets current git status and recent commits',
      {},
      async () => {
        try {
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
  },
  {
    name: 'College Football Fantasy MCP',
    version: '1.0.0',
    description: 'MCP tools for College Football Fantasy app management',
  }
);

export const GET = handler.GET;
export const POST = handler.POST;