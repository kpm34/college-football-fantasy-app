#!/usr/bin/env node

/**
 * Figma Design Sync Tool
 * 
 * Syncs Figma designs with your codebase
 * Usage: node scripts/figma-sync.js [command] [options]
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchFigmaAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1${endpoint}`,
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function syncColors() {
  log('🎨 Syncing colors from Figma...', 'cyan');
  
  try {
    const file = await fetchFigmaAPI(`/files/${FIGMA_FILE_ID}`);
    const colors = {};
    
    // Extract colors from document
    function extractColors(node) {
      if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const name = node.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const { r, g, b, a = 1 } = fill.color;
            colors[name] = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
          }
        });
      }
      
      if (node.children) {
        node.children.forEach(extractColors);
      }
    }
    
    extractColors(file.document);
    
    // Generate CSS variables
    const cssContent = `:root {\n${Object.entries(colors)
      .map(([name, value]) => `  --color-${name}: ${value};`)
      .join('\n')}\n}\n`;
    
    await fs.writeFile(
      path.join(__dirname, '..', 'styles', 'figma-colors.css'),
      cssContent
    );
    
    log(`✅ Synced ${Object.keys(colors).length} colors`, 'green');
    return colors;
  } catch (error) {
    log(`❌ Failed to sync colors: ${error.message}`, 'red');
    throw error;
  }
}

async function syncTypography() {
  log('📝 Syncing typography from Figma...', 'cyan');
  
  try {
    const styles = await fetchFigmaAPI(`/files/${FIGMA_FILE_ID}/styles`);
    const typography = {};
    
    if (styles.meta && styles.meta.styles) {
      styles.meta.styles.forEach(style => {
        if (style.style_type === 'TEXT') {
          typography[style.name] = style;
        }
      });
    }
    
    // Generate typography tokens
    const typographyCSS = Object.entries(typography)
      .map(([name, style]) => {
        const className = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `.text-${className} {
  /* ${name} */
  font-family: var(--font-family);
  /* Add more properties based on style data */
}`;
      })
      .join('\n\n');
    
    await fs.writeFile(
      path.join(__dirname, '..', 'styles', 'figma-typography.css'),
      typographyCSS
    );
    
    log(`✅ Synced ${Object.keys(typography).length} text styles`, 'green');
    return typography;
  } catch (error) {
    log(`❌ Failed to sync typography: ${error.message}`, 'red');
    throw error;
  }
}

async function syncComponents() {
  log('🔧 Syncing components from Figma...', 'cyan');
  
  try {
    const components = await fetchFigmaAPI(`/files/${FIGMA_FILE_ID}/components`);
    
    if (!components.meta || !components.meta.components) {
      log('No components found in Figma file', 'yellow');
      return;
    }
    
    const outputDir = path.join(__dirname, '..', 'components', 'figma');
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const [id, component] of Object.entries(components.meta.components)) {
      const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `${componentName}.tsx`;
      const filePath = path.join(outputDir, fileName);
      
      const componentCode = `// Auto-generated from Figma
// Component: ${component.name}
// Node ID: ${id}
// Description: ${component.description || 'No description'}
// Last synced: ${new Date().toISOString()}

import React from 'react';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * ${component.description || component.name}
 * 
 * Figma: ${component.name}
 */
export function ${componentName}({ className = '', children, ...props }: ${componentName}Props) {
  return (
    <div 
      className={\`figma-${componentName.toLowerCase()} \${className}\`}
      {...props}
    >
      {children || '${component.name} Component'}
    </div>
  );
}

export default ${componentName};
`;
      
      await fs.writeFile(filePath, componentCode);
      log(`  📦 Generated ${fileName}`, 'green');
    }
    
    // Create index file
    const indexContent = Object.entries(components.meta.components)
      .map(([id, component]) => {
        const name = component.name.replace(/[^a-zA-Z0-9]/g, '');
        return `export { ${name} } from './${name}';`;
      })
      .join('\n');
    
    await fs.writeFile(path.join(outputDir, 'index.ts'), indexContent);
    
    log(`✅ Synced ${Object.keys(components.meta.components).length} components`, 'green');
    return components.meta.components;
  } catch (error) {
    log(`❌ Failed to sync components: ${error.message}`, 'red');
    throw error;
  }
}

async function exportAssets() {
  log('🖼️ Exporting assets from Figma...', 'cyan');
  
  try {
    const file = await fetchFigmaAPI(`/files/${FIGMA_FILE_ID}`);
    const assetNodes = [];
    
    // Find exportable nodes
    function findExportableNodes(node) {
      if (node.exportSettings && node.exportSettings.length > 0) {
        assetNodes.push(node.id);
      }
      if (node.children) {
        node.children.forEach(findExportableNodes);
      }
    }
    
    findExportableNodes(file.document);
    
    if (assetNodes.length === 0) {
      log('No exportable assets found', 'yellow');
      return;
    }
    
    // Get image URLs
    const images = await fetchFigmaAPI(
      `/images/${FIGMA_FILE_ID}?ids=${assetNodes.join(',')}&format=png&scale=2`
    );
    
    log(`✅ Found ${assetNodes.length} exportable assets`, 'green');
    
    // Note: Actual download would require additional implementation
    console.log('Asset URLs:', images.images);
    
    return images.images;
  } catch (error) {
    log(`❌ Failed to export assets: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  const command = process.argv[2] || 'all';
  
  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_ACCESS_TOKEN not found in .env.local', 'red');
    log('Get your token from: https://www.figma.com/developers/api#access-tokens', 'yellow');
    process.exit(1);
  }
  
  if (!FIGMA_FILE_ID) {
    log('❌ FIGMA_FILE_ID not found in .env.local', 'red');
    log('Add your Figma file ID to .env.local', 'yellow');
    process.exit(1);
  }
  
  log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════╗
║        Figma Design Sync Tool            ║
╚══════════════════════════════════════════╝${colors.reset}
`);
  
  try {
    switch (command) {
      case 'colors':
        await syncColors();
        break;
      case 'typography':
        await syncTypography();
        break;
      case 'components':
        await syncComponents();
        break;
      case 'assets':
        await exportAssets();
        break;
      case 'all':
        await syncColors();
        await syncTypography();
        await syncComponents();
        await exportAssets();
        break;
      default:
        log(`Unknown command: ${command}`, 'red');
        log('Available commands: all, colors, typography, components, assets', 'yellow');
        process.exit(1);
    }
    
    log('\n✨ Figma sync complete!', 'green');
  } catch (error) {
    log(`\n❌ Sync failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}