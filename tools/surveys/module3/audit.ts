#!/usr/bin/env tsx

/**
 * Module 3 - Draft UI Audit
 * Checks for draft UI components and projection integration
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface Module3Report {
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

async function findComponents(): Promise<Module3Report['components']> {
  const components: Module3Report['components'] = {
    DraftBoard: null,
    PlayerRow: null,
    TeamRoster: null,
    Timer: null
  };

  // Search patterns for each component
  const patterns = [
    { name: 'DraftBoard', patterns: ['**/DraftBoard*.tsx', '**/draft-board*.tsx', '**/draft/board*.tsx'] },
    { name: 'PlayerRow', patterns: ['**/PlayerRow*.tsx', '**/player-row*.tsx', '**/PlayerCard*.tsx'] },
    { name: 'TeamRoster', patterns: ['**/TeamRoster*.tsx', '**/team-roster*.tsx', '**/Roster*.tsx'] },
    { name: 'Timer', patterns: ['**/Timer*.tsx', '**/DraftTimer*.tsx', '**/CountdownTimer*.tsx'] }
  ];

  for (const component of patterns) {
    for (const pattern of component.patterns) {
      const files = await glob(pattern, { ignore: ['node_modules/**', '.next/**'] });
      if (files.length > 0) {
        components[component.name as keyof typeof components] = files[0];
        break;
      }
    }
  }

  // Check specific known locations
  if (!components.DraftBoard) {
    const draftPages = await glob('app/**/draft/**/page.tsx', { ignore: ['node_modules/**'] });
    if (draftPages.length > 0) {
      components.DraftBoard = draftPages[0];
    }
  }

  return components;
}

async function checkControls(): Promise<Module3Report['controls']> {
  const controls: Module3Report['controls'] = {
    search: false,
    filter: false,
    sort: false,
    queue: false,
    timer: false
  };

  // Search for control implementations
  const files = await glob('**/*.{ts,tsx}', { 
    ignore: ['node_modules/**', '.next/**', 'vendor/**'] 
  });

  for (const file of files) {
    if (controls.search && controls.filter && controls.sort && controls.queue && controls.timer) {
      break; // All found
    }

    const content = fs.readFileSync(file, 'utf8');
    
    // Check for search functionality
    if (!controls.search && (
      content.includes('searchTerm') || 
      content.includes('searchPlayers') ||
      content.includes('onSearch') ||
      content.includes('playerSearch')
    )) {
      controls.search = true;
    }

    // Check for filter functionality
    if (!controls.filter && (
      content.includes('filterBy') ||
      content.includes('positionFilter') ||
      content.includes('conferenceFilter') ||
      content.includes('onFilter')
    )) {
      controls.filter = true;
    }

    // Check for sort functionality
    if (!controls.sort && (
      content.includes('sortBy') ||
      content.includes('orderBy') ||
      content.includes('onSort') ||
      content.includes('sortPlayers')
    )) {
      controls.sort = true;
    }

    // Check for queue functionality
    if (!controls.queue && (
      content.includes('draftQueue') ||
      content.includes('playerQueue') ||
      content.includes('queuedPlayers') ||
      content.includes('addToQueue')
    )) {
      controls.queue = true;
    }

    // Check for timer functionality
    if (!controls.timer && (
      content.includes('timeRemaining') ||
      content.includes('draftTimer') ||
      content.includes('countdown') ||
      content.includes('pickTimer')
    )) {
      controls.timer = true;
    }
  }

  return controls;
}

async function checkProjectionIntegration(): Promise<Module3Report['projection_integration']> {
  const integration: Module3Report['projection_integration'] = {
    found: false,
    paths: []
  };

  const files = await glob('**/*.{ts,tsx}', { 
    ignore: ['node_modules/**', '.next/**', 'vendor/**'] 
  });

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for API calls to projections endpoints
    if (content.includes('/api/projections') || 
        content.includes('/api/draft/players') ||
        content.includes('projectedPoints') ||
        content.includes('fantasyPoints')) {
      
      if (file.includes('draft') || file.includes('player')) {
        integration.found = true;
        if (!integration.paths.includes(file)) {
          integration.paths.push(file);
        }
      }
    }

    // Stop after finding 5 integration points
    if (integration.paths.length >= 5) break;
  }

  return integration;
}

async function checkPlayerRowProps(): Promise<boolean> {
  // Find PlayerRow or similar component
  const playerComponents = await glob('**/Player*.tsx', { 
    ignore: ['node_modules/**', '.next/**'] 
  });

  for (const file of playerComponents) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('projectedPoints') || 
        content.includes('fantasyPoints') ||
        content.includes('projection')) {
      return true;
    }
  }

  return false;
}

async function main() {
  console.log('🔍 Auditing Module 3 - Draft UI...');
  
  const components = await findComponents();
  const controls = await checkControls();
  const projection_integration = await checkProjectionIntegration();
  const hasProjectionProps = await checkPlayerRowProps();
  
  const notes: string[] = [];
  
  // Add notes based on findings
  if (!components.DraftBoard) notes.push('DraftBoard component not found');
  if (!components.PlayerRow) notes.push('PlayerRow component not found');
  if (!components.TeamRoster) notes.push('TeamRoster component not found');
  if (!components.Timer) notes.push('Timer component not found');
  
  if (!controls.sort) notes.push('Sort functionality not implemented');
  if (!controls.queue) notes.push('Queue feature not found');
  
  if (hasProjectionProps) notes.push('Player components have projection props');
  if (projection_integration.found) {
    notes.push(`Found ${projection_integration.paths.length} projection integration points`);
  }
  
  // Determine status
  const componentCount = Object.values(components).filter(c => c !== null).length;
  const controlCount = Object.values(controls).filter(c => c === true).length;
  
  let status: 'ok' | 'incomplete' | 'missing' = 'missing';
  if (componentCount >= 3 && controlCount >= 4 && projection_integration.found) {
    status = 'ok';
  } else if (componentCount >= 2 && controlCount >= 3) {
    status = 'incomplete';
  }
  
  const report: Module3Report = {
    components,
    controls,
    projection_integration,
    status,
    notes
  };
  
  // Write report
  const outputPath = '/tmp/draft_ui_report.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log('📊 Module 3 Report:');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${outputPath}`);
}

if (require.main === module) {
  main();
}
