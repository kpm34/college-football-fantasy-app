import { z } from 'zod';
import { Client, Databases, Teams, Functions, Storage, Users } from 'appwrite';

// ========== APPWRITE TOOLS ==========
export function registerAppwriteTools(server: any) {
  // Initialize Appwrite client
  const getAppwriteClient = () => {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');
    
    if (process.env.APPWRITE_API_KEY) {
      client.setKey(process.env.APPWRITE_API_KEY);
    }
    
    return client;
  };

  // List Appwrite databases
  server.tool(
    'appwrite_list_databases',
    'Lists all Appwrite databases',
    {},
    async () => {
      try {
        const client = getAppwriteClient();
        const databases = new Databases(client);
        const response = await databases.list();
        
        return {
          content: [{
            type: 'text',
            text: `Appwrite Databases:\n${JSON.stringify(response.databases, null, 2)}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error listing databases: ${error}`
          }],
        };
      }
    },
  );

  // List collections in a database
  server.tool(
    'appwrite_list_collections',
    'Lists all collections in an Appwrite database',
    { databaseId: z.string() },
    async ({ databaseId }) => {
      try {
        const client = getAppwriteClient();
        const databases = new Databases(client);
        const response = await databases.listCollections(databaseId);
        
        const collections = response.collections.map(col => ({
          id: col.$id,
          name: col.name,
          attributes: col.attributes,
          indexes: col.indexes,
        }));
        
        return {
          content: [{
            type: 'text',
            text: `Collections in ${databaseId}:\n${JSON.stringify(collections, null, 2)}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error listing collections: ${error}`
          }],
        };
      }
    },
  );

  // Query documents
  server.tool(
    'appwrite_query_documents',
    'Queries documents from an Appwrite collection',
    { 
      databaseId: z.string(),
      collectionId: z.string(),
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0)
    },
    async ({ databaseId, collectionId, limit, offset }) => {
      try {
        const client = getAppwriteClient();
        const databases = new Databases(client);
        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          []
        );
        
        return {
          content: [{
            type: 'text',
            text: `Documents in ${collectionId}:\nTotal: ${response.total}\n\n${JSON.stringify(response.documents.slice(0, limit), null, 2)}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error querying documents: ${error}`
          }],
        };
      }
    },
  );

  // List Appwrite functions
  server.tool(
    'appwrite_list_functions',
    'Lists all Appwrite functions',
    {},
    async () => {
      try {
        const client = getAppwriteClient();
        const functions = new Functions(client);
        const response = await functions.list();
        
        return {
          content: [{
            type: 'text',
            text: `Appwrite Functions:\n${JSON.stringify(response.functions, null, 2)}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error listing functions: ${error}`
          }],
        };
      }
    },
  );

  // Get Appwrite project info
  server.tool(
    'appwrite_project_info',
    'Gets Appwrite project configuration and status',
    {},
    async () => {
      const info = {
        endpoint: process.env.APPWRITE_ENDPOINT || 'Not set',
        projectId: process.env.APPWRITE_PROJECT_ID || 'Not set',
        apiKeySet: !!process.env.APPWRITE_API_KEY,
        databaseId: process.env.APPWRITE_DATABASE_ID || 'Not set',
      };
      
      return {
        content: [{
          type: 'text',
          text: `Appwrite Configuration:\n${JSON.stringify(info, null, 2)}`
        }],
      };
    },
  );
}

// ========== VERCEL TOOLS ==========
export function registerVercelTools(server: any) {
  // Get Vercel deployment info
  server.tool(
    'vercel_deployment_info',
    'Gets current Vercel deployment information',
    {},
    async () => {
      const vercelInfo = {
        environment: process.env.VERCEL_ENV || 'development',
        url: process.env.VERCEL_URL || 'localhost',
        region: process.env.VERCEL_REGION || 'local',
        gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        gitBranch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
        gitRepoOwner: process.env.VERCEL_GIT_REPO_OWNER || 'local',
        gitRepoSlug: process.env.VERCEL_GIT_REPO_SLUG || 'local',
      };
      
      return {
        content: [{
          type: 'text',
          text: `Vercel Deployment Info:\n${JSON.stringify(vercelInfo, null, 2)}`
        }],
      };
    },
  );

  // Check Vercel analytics
  server.tool(
    'vercel_analytics_status',
    'Checks if Vercel Analytics is configured',
    {},
    async () => {
      const analyticsInfo = {
        analyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || 'Not configured',
        webVitalsEndpoint: '/_vercel/insights/vitals',
        customEventsEndpoint: '/_vercel/insights/event',
      };
      
      return {
        content: [{
          type: 'text',
          text: `Vercel Analytics Status:\n${JSON.stringify(analyticsInfo, null, 2)}`
        }],
      };
    },
  );
}

// ========== SPLINE TOOLS ==========
export function registerSplineTools(server: any) {
  // Analyze Spline scenes in project
  server.tool(
    'spline_find_scenes',
    'Finds all Spline scene references in the project',
    {},
    async () => {
      try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        // Search for Spline URLs and imports
        const { stdout } = await execAsync(
          'grep -r "spline" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . || true'
        );
        
        const matches = stdout.split('\n').filter((line: string) => 
          line.includes('spline.design') || 
          line.includes('@splinetool') ||
          line.includes('Spline')
        );
        
        return {
          content: [{
            type: 'text',
            text: `Spline References Found:\n${matches.join('\n') || 'No Spline scenes found'}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error searching for Spline scenes: ${error}`
          }],
        };
      }
    },
  );

  // Get Spline configuration
  server.tool(
    'spline_config_info',
    'Gets Spline package and configuration info',
    {},
    async () => {
      try {
        const fs = require('fs/promises');
        const path = require('path');
        const packageJson = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8');
        const pkg = JSON.parse(packageJson);
        
        const splinePackages = Object.keys({
          ...pkg.dependencies,
          ...pkg.devDependencies
        }).filter(name => name.includes('spline'));
        
        return {
          content: [{
            type: 'text',
            text: `Spline Packages Installed:\n${splinePackages.join('\n') || 'No Spline packages found'}\n\nTo use Spline:\n1. Install: npm install @splinetool/react-spline @splinetool/runtime\n2. Import: import Spline from '@splinetool/react-spline'\n3. Use: <Spline scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" />`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error checking Spline config: ${error}`
          }],
        };
      }
    },
  );
}

// ========== THIRDEYECAPITAL.AI TOOLS ==========
export function registerThirdEyeCapitalTools(server: any) {
  // Get AI Gateway configuration
  server.tool(
    'thirdeyecapital_gateway_info',
    'Gets ThirdEyeCapital.ai gateway configuration',
    {},
    async () => {
      const gatewayInfo = {
        apiKeySet: !!process.env.AI_GATEWAY_API_KEY,
        endpoint: 'https://api.thirdeyecapital.ai/v1',
        supportedModels: [
          'gpt-4-turbo',
          'gpt-3.5-turbo',
          'claude-3-opus',
          'claude-3-sonnet',
          'llama-3',
          'mixtral-8x7b'
        ],
        features: [
          'Multi-model routing',
          'Token optimization',
          'Response caching',
          'Rate limiting',
          'Usage analytics'
        ]
      };
      
      return {
        content: [{
          type: 'text',
          text: `ThirdEyeCapital.ai Gateway Info:\n${JSON.stringify(gatewayInfo, null, 2)}`
        }],
      };
    },
  );

  // Test AI Gateway connection
  server.tool(
    'thirdeyecapital_test_connection',
    'Tests connection to ThirdEyeCapital.ai gateway',
    {},
    async () => {
      if (!process.env.AI_GATEWAY_API_KEY) {
        return {
          content: [{
            type: 'text',
            text: 'AI_GATEWAY_API_KEY not set. Cannot test connection.'
          }],
        };
      }
      
      try {
        const response = await fetch('https://api.thirdeyecapital.ai/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            content: [{
              type: 'text',
              text: `ThirdEyeCapital.ai Connection: ✅ Success\nAvailable Models:\n${JSON.stringify(data, null, 2)}`
            }],
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `ThirdEyeCapital.ai Connection: ❌ Failed\nStatus: ${response.status} ${response.statusText}`
            }],
          };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `ThirdEyeCapital.ai Connection Error: ${error}`
          }],
        };
      }
    },
  );
}

// ========== LOVABLE TOOLS ==========
export function registerLovableTools(server: any) {
  // Get Lovable project info
  server.tool(
    'lovable_project_info',
    'Gets information about Lovable AI integration',
    {},
    async () => {
      const lovableInfo = {
        purpose: 'AI-powered development platform',
        features: [
          'Component generation',
          'Code completion',
          'Design-to-code',
          'Real-time collaboration',
          'Version control integration'
        ],
        bestPractices: [
          'Use clear component names',
          'Provide detailed descriptions',
          'Include example usage',
          'Specify design patterns',
          'Document API contracts'
        ]
      };
      
      return {
        content: [{
          type: 'text',
          text: `Lovable AI Platform Info:\n${JSON.stringify(lovableInfo, null, 2)}`
        }],
      };
    },
  );
}

// ========== GOHIGHLEVEL TOOLS ==========
export function registerGoHighLevelTools(server: any) {
  // Get GoHighLevel integration info
  server.tool(
    'gohighlevel_integration_info',
    'Gets GoHighLevel CRM integration information',
    {},
    async () => {
      const ghlInfo = {
        apiEndpoint: 'https://api.gohighlevel.com/v1',
        apiKeySet: !!process.env.GHL_API_KEY,
        features: [
          'Contact management',
          'Pipeline automation',
          'Email campaigns',
          'SMS marketing',
          'Landing pages',
          'Appointment scheduling',
          'Forms and surveys'
        ],
        webhooks: [
          '/api/webhooks/ghl/contact-created',
          '/api/webhooks/ghl/opportunity-updated',
          '/api/webhooks/ghl/appointment-booked'
        ]
      };
      
      return {
        content: [{
          type: 'text',
          text: `GoHighLevel Integration Info:\n${JSON.stringify(ghlInfo, null, 2)}`
        }],
      };
    },
  );

  // Check GoHighLevel webhook endpoints
  server.tool(
    'gohighlevel_check_webhooks',
    'Checks if GoHighLevel webhook endpoints exist',
    {},
    async () => {
      const fs = require('fs/promises');
      const path = require('path');
      
      const webhookPaths = [
        'app/api/webhooks/ghl/route.ts',
        'app/api/webhooks/ghl/contact-created/route.ts',
        'app/api/webhooks/ghl/opportunity-updated/route.ts',
      ];
      
      const results = await Promise.all(
        webhookPaths.map(async (webhookPath) => {
          try {
            await fs.access(path.join(process.cwd(), webhookPath));
            return { path: webhookPath, exists: true };
          } catch {
            return { path: webhookPath, exists: false };
          }
        })
      );
      
      return {
        content: [{
          type: 'text',
          text: `GoHighLevel Webhook Endpoints:\n${results.map(r => `${r.exists ? '✅' : '❌'} ${r.path}`).join('\n')}`
        }],
      };
    },
  );
}