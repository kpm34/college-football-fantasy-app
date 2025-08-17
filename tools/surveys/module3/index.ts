#!/usr/bin/env tsx

/**
 * Module 3 - Draft UI Audit
 * Confirms draft UI components and projections integration
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface DraftUIReport {
  components: {
    DraftBoard: string | null;
    PlayerRow: string | null;
    TeamRoster: string | null;
    Timer: string | null;
  };
  controls: {
    search: boolean;
    filter: boolean;
    sort: boolean;
    queue: boolean;
    timer: boolean;
  };
  projection_integration: {
    found: boolean;
    paths: string[];
  };
  status: 'ok' | 'incomplete' | 'missing';
  notes: string[];
}

async function findComponents() {
  const components: DraftUIReport['components'] = {
    DraftBoard: null,
    PlayerRow: null,
    TeamRoster: null,
    Timer: null
  };

  // Search for React/Next.js components
  const componentFiles = await glob('**/*.{tsx,jsx}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**'] 
  });

  for (const file of componentFiles) {
    const fileName = path.basename(file, path.extname(file));
    const content = fs.readFileSync(file, 'utf8');

    // Check for DraftBoard
    if ((fileName.toLowerCase().includes('draft') && fileName.toLowerCase().includes('board')) ||
        fileName.toLowerCase() === 'draftboard' ||
        content.includes('DraftBoard') ||
        (content.includes('draft') && content.includes('board'))) {
      components.DraftBoard = file;
    }

    // Check for PlayerRow
    if (fileName.toLowerCase().includes('playerrow') ||
        fileName.toLowerCase() === 'playerrow' ||
        (fileName.toLowerCase().includes('player') && fileName.toLowerCase().includes('row')) ||
        content.includes('PlayerRow')) {
      components.PlayerRow = file;
    }

    // Check for TeamRoster
    if ((fileName.toLowerCase().includes('team') && fileName.toLowerCase().includes('roster')) ||
        fileName.toLowerCase() === 'teamroster' ||
        content.includes('TeamRoster') ||
        (content.includes('roster') && content.includes('team'))) {
      components.TeamRoster = file;
    }

    // Check for Timer
    if (fileName.toLowerCase().includes('timer') ||
        fileName.toLowerCase() === 'timer' ||
        content.includes('Timer') ||
        (content.includes('timer') && content.includes('draft'))) {
      components.Timer = file;
    }
  }

  return components;
}

async function findControls() {
  const controls: DraftUIReport['controls'] = {
    search: false,
    filter: false,
    sort: false,
    queue: false,
    timer: false
  };

  // Search through all component files
  const allFiles = await glob('**/*.{tsx,jsx,ts}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**'] 
  });

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8').toLowerCase();

    // Search functionality
    if (content.includes('search') && (content.includes('input') || content.includes('filter') || content.includes('query'))) {
      controls.search = true;
    }

    // Filter functionality
    if (content.includes('filter') && (content.includes('position') || content.includes('team') || content.includes('conference'))) {
      controls.filter = true;
    }

    // Sort functionality
    if (content.includes('sort') || content.includes('orderby') || content.includes('sortby')) {
      controls.sort = true;
    }

    // Queue functionality
    if (content.includes('queue') || content.includes('watchlist') || content.includes('favorites')) {
      controls.queue = true;
    }

    // Timer functionality
    if (content.includes('timer') || content.includes('countdown') || content.includes('picktime')) {
      controls.timer = true;
    }
  }

  return controls;
}

async function findProjectionIntegration() {
  const paths: string[] = [];
  let found = false;

  // Search for projection integration
  const allFiles = await glob('**/*.{tsx,jsx,ts}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**'] 
  });

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // Check for API calls to projections
    if (content.includes('/api/projections') || 
        content.includes('/api/draft/players') ||
        content.includes('getProjections') ||
        content.includes('projections') && content.includes('fetch')) {
      paths.push(file);
      found = true;
    }

    // Check for projection-related props/state
    if (content.includes('fantasyPoints') || 
        content.includes('projectedPoints') ||
        content.includes('projection') && (content.includes('props') || content.includes('state'))) {
      if (!paths.includes(file)) {
        paths.push(file);
      }
      found = true;
    }
  }

  return { found, paths };
}

async function main() {
  try {
    console.log('🔍 Auditing Module 3 - Draft UI...');
    
    const components = await findComponents();
    const controls = await findControls();
    const projection_integration = await findProjectionIntegration();
    
    const notes: string[] = [];
    
    // Component status
    const foundComponents = Object.values(components).filter(c => c !== null).length;
    const totalComponents = Object.keys(components).length;
    notes.push(`${foundComponents}/${totalComponents} expected components found`);

    // Missing components
    for (const [name, path] of Object.entries(components)) {
      if (!path) {
        notes.push(`${name} component missing`);
      }
    }

    // Controls status
    const foundControls = Object.values(controls).filter(c => c === true).length;
    const totalControls = Object.keys(controls).length;
    notes.push(`${foundControls}/${totalControls} expected controls found`);

    // Missing controls
    for (const [name, present] of Object.entries(controls)) {
      if (!present) {
        notes.push(`${name} control not implemented`);
      }
    }

    // Projection integration
    if (projection_integration.found) {
      notes.push(`Projection integration found in ${projection_integration.paths.length} files`);
    } else {
      notes.push('No projection integration detected');
    }

    // Determine status
    let status: 'ok' | 'incomplete' | 'missing' = 'ok';
    if (foundComponents === 0 || !projection_integration.found) status = 'missing';
    else if (foundComponents < totalComponents || foundControls < totalControls) status = 'incomplete';

    const report: DraftUIReport = {
      components,
      controls,
      projection_integration,
      status,
      notes
    };

    // Write to temp file
    const outputPath = '/tmp/draft_ui_report.json';
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Module 3 Report:');
    console.log(JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error auditing Module 3:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
