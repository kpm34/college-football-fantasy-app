/**
 * Comprehensive Data Flow Mapping System
 * 
 * This system maps the complete data pipeline from external APIs 
 * through Appwrite to frontend components, with comprehensive monitoring,
 * testing infrastructure, and deployment automation.
 * 
 * Enhanced Data Flow Architecture (August 17, 2025 - ALIGNED):
 * External APIs → Pipeline Scripts → Appwrite Database (Single Source) → API Routes (Passthrough) → 
 * Frontend UI → User Actions → Repository Validation → Appwrite → 
 * Synthetic Monitoring → Contract Testing → Vercel Deployment → 
 * Smoke Tests → Health Monitoring → Alert System
 *
 * PROJECTION FLOW (Aligned August 17, 2025):
 * functions/project-yearly-simple/ → college_players.fantasy_points → /api/draft/players → UI
 */

import { APPWRITE_SCHEMA, type CollectionConfig } from '../schema/appwrite-schema-map';

export interface DataSource {
  id: string;
  name: string;
  type: 'external_api' | 'manual_input' | 'calculated' | 'user_generated';
  endpoint?: string;
  apiKey?: string;
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  reliability: 'high' | 'medium' | 'low';
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'seasonal';
}

export interface DataTransform {
  id: string;
  name: string;
  sourceFormat: string;
  targetFormat: string;
  transformationRules: {
    field: string;
    sourceField: string;
    transform?: string; // JavaScript transformation function
    default?: any;
    required: boolean;
  }[];
  validationRules: {
    field: string;
    type: string;
    constraints?: any;
  }[];
}

export interface SyncJob {
  id: string;
  name: string;
  description: string;
  source: string; // DataSource ID
  target: string; // Collection ID
  transform: string; // DataTransform ID
  schedule: {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
    time?: string; // For daily/weekly
    dependencies?: string[]; // Other sync jobs that must complete first
  };
  errorHandling: {
    retries: number;
    backoffStrategy: 'linear' | 'exponential';
    failureNotification: boolean;
  };
  performance: {
    batchSize?: number;
    parallelization?: boolean;
    timeout: number; // seconds
  };
}

export interface FrontendDataFlow {
  page: string;
  component: string;
  dataRequirements: {
    collections: string[];
    realtime: boolean;
    caching: {
      enabled: boolean;
      ttl?: number; // seconds
      strategy: 'browser' | 'server' | 'cdn';
    };
  };
  userActions: {
    action: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    affectedCollections: string[];
    revalidationNeeded: string[]; // Pages that need cache revalidation
  }[];
}

export interface DeploymentSync {
  trigger: 'code_push' | 'schema_change' | 'env_var_change' | 'manual';
  preDeployTasks: string[];
  postDeployTasks: string[];
  rollbackStrategy: string;
  environmentSync: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
}

/**
 * Data Sources Configuration
 */
export const DATA_SOURCES: Record<string, DataSource> = {
  cfbd: {
    id: 'cfbd',
    name: 'College Football Data API',
    type: 'external_api',
    endpoint: 'https://api.collegefootballdata.com',
    apiKey: 'YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz',
    rateLimit: {
      requests: 1000,
      period: 'hour'
    },
    reliability: 'high',
    updateFrequency: 'daily'
  },
  
  espn: {
    id: 'espn',
    name: 'ESPN API',
    type: 'external_api',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
    rateLimit: {
      requests: 500,
      period: 'hour'
    },
    reliability: 'medium',
    updateFrequency: 'hourly'
  },
  
  rotowire: {
    id: 'rotowire',
    name: 'Rotowire Player News',
    type: 'external_api',
    endpoint: 'https://www.rotowire.com/api',
    rateLimit: {
      requests: 100,
      period: 'hour'
    },
    reliability: 'medium',
    updateFrequency: 'hourly'
  },
  
  manual_admin: {
    id: 'manual_admin',
    name: 'Manual Admin Input',
    type: 'manual_input',
    reliability: 'high',
    updateFrequency: 'manual'
  },
  
  user_input: {
    id: 'user_input',
    name: 'User Generated Content',
    type: 'user_generated',
    reliability: 'medium',
    updateFrequency: 'realtime'
  },
  
  comprehensive_projection_pipeline: {
    id: 'comprehensive_projection_pipeline',
    name: 'Comprehensive Projection Pipeline (Single Source)',
    type: 'calculated',
    endpoint: '/functions/project-yearly-simple/',
    reliability: 'high',
    updateFrequency: 'daily'
  },

  projection_evaluation: {
    id: 'projection_evaluation',
    name: 'Projection Model Evaluation System',
    type: 'calculated',
    endpoint: '/evaluation/eval_proj.ts',
    reliability: 'high',
    updateFrequency: 'manual'
  },

  synthetic_monitoring: {
    id: 'synthetic_monitoring', 
    name: 'Synthetic Monitoring System',
    type: 'calculated',
    endpoint: '/api/cron/synthetic-monitoring',
    reliability: 'high',
    updateFrequency: 'realtime'
  },

  contract_testing: {
    id: 'contract_testing',
    name: 'Schema Contract Testing',
    type: 'calculated',
    reliability: 'high',
    updateFrequency: 'realtime'
  },

  smoke_testing: {
    id: 'smoke_testing',
    name: 'Playwright Smoke Tests',
    type: 'calculated',
    reliability: 'high', 
    updateFrequency: 'realtime'
  },

  health_monitoring: {
    id: 'health_monitoring',
    name: 'System Health Monitoring',
    type: 'calculated',
    endpoint: '/api/health',
    reliability: 'high',
    updateFrequency: 'realtime'
  },

  cfbd_enhanced_pipeline: {
    id: 'cfbd_enhanced_pipeline',
    name: 'Enhanced CFBD Pipeline with API Integration',
    type: 'external_api',
    endpoint: 'https://api.collegefootballdata.com',
    apiKey: 'YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz',
    rateLimit: {
      requests: 1000,
      period: 'hour'
    },
    reliability: 'high',
    updateFrequency: 'daily'
  },

  data_ingestion_orchestrator: {
    id: 'data_ingestion_orchestrator',
    name: 'Comprehensive Data Ingestion System',
    type: 'calculated',
    endpoint: '/core/data-ingestion/orchestrator',
    reliability: 'high',
    updateFrequency: 'daily'
  }
};

/**
 * Data Transformations
 */
export const DATA_TRANSFORMS: Record<string, DataTransform> = {
  cfbd_to_players: {
    id: 'cfbd_to_players',
    name: 'CFBD Players to College Players',
    sourceFormat: 'cfbd_player_api',
    targetFormat: 'college_players_collection',
    transformationRules: [
      { field: 'name', sourceField: 'name', required: true },
      { field: 'position', sourceField: 'position', required: true },
      { field: 'team', sourceField: 'team', required: true },
      { field: 'conference', sourceField: 'conference', required: true },
      { field: 'jerseyNumber', sourceField: 'jersey', required: false },
      { field: 'height', sourceField: 'height', required: false },
      { field: 'weight', sourceField: 'weight', required: false, transform: 'parseInt' },
      { field: 'year', sourceField: 'year', required: false },
      { field: 'external_id', sourceField: 'id', required: false },
      { field: 'image_url', sourceField: 'headshot_url', required: false },
      { field: 'eligible', sourceField: null, default: false, required: true },
      { field: 'fantasy_points', sourceField: null, default: 0, required: true }
    ],
    validationRules: [
      { field: 'name', type: 'string', constraints: { minLength: 2, maxLength: 100 } },
      { field: 'position', type: 'string', constraints: { enum: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] } },
      { field: 'weight', type: 'integer', constraints: { min: 150, max: 400 } }
    ]
  },
  
  cfbd_to_games: {
    id: 'cfbd_to_games',
    name: 'CFBD Games to Games Collection',
    sourceFormat: 'cfbd_game_api',
    targetFormat: 'games_collection',
    transformationRules: [
      { field: 'week', sourceField: 'week', required: true, transform: 'parseInt' },
      { field: 'season', sourceField: 'season', required: true, transform: 'parseInt' },
      { field: 'season_type', sourceField: 'season_type', required: true },
      { field: 'home_team', sourceField: 'home_team', required: true },
      { field: 'away_team', sourceField: 'away_team', required: true },
      { field: 'home_score', sourceField: 'home_points', required: false, transform: 'parseInt' },
      { field: 'away_score', sourceField: 'away_points', required: false, transform: 'parseInt' },
      { field: 'start_date', sourceField: 'start_date', required: true, transform: 'parseDateTime' },
      { field: 'completed', sourceField: 'completed', required: true, default: false },
      { field: 'venue', sourceField: 'venue', required: false },
      { field: 'external_id', sourceField: 'id', required: false }
    ],
    validationRules: [
      { field: 'week', type: 'integer', constraints: { min: 1, max: 20 } },
      { field: 'season', type: 'integer', constraints: { min: 2020, max: 2030 } }
    ]
  },
  
  cfbd_to_rankings: {
    id: 'cfbd_to_rankings',
    name: 'CFBD Rankings to Rankings Collection',
    sourceFormat: 'cfbd_rankings_api',
    targetFormat: 'rankings_collection',
    transformationRules: [
      { field: 'week', sourceField: 'week', required: true, transform: 'parseInt' },
      { field: 'season', sourceField: 'season', required: true, transform: 'parseInt' },
      { field: 'poll_type', sourceField: 'poll', required: true },
      { field: 'team', sourceField: 'school', required: true },
      { field: 'rank', sourceField: 'rank', required: true, transform: 'parseInt' },
      { field: 'points', sourceField: 'points', required: false, transform: 'parseInt' },
      { field: 'first_place_votes', sourceField: 'firstPlaceVotes', required: false, transform: 'parseInt' }
    ],
    validationRules: [
      { field: 'rank', type: 'integer', constraints: { min: 1, max: 25 } },
      { field: 'poll_type', type: 'string', constraints: { enum: ['AP Top 25', 'Coaches Poll'] } }
    ]
  },
  
  comprehensive_algorithm_to_projections: {
    id: 'comprehensive_algorithm_to_projections',
    name: 'Comprehensive Algorithm to Fantasy Projections (Single Source)',
    sourceFormat: 'comprehensive_pipeline_calculation',
    targetFormat: 'college_players_projections',
    transformationRules: [
      { field: 'fantasy_points', sourceField: 'yearly_projection', required: true, transform: 'roundToInteger' },
      { field: 'projection', sourceField: 'yearly_projection', required: true, transform: 'roundToInteger' },
      { field: 'pace_adj', sourceField: 'team_pace_adjusted', required: false, transform: 'roundToTwo' },
      { field: 'usage_rate', sourceField: 'position_usage_rate', required: false, transform: 'roundToThree' },
      { field: 'depth_rank', sourceField: 'depth_chart_rank', required: false, transform: 'parseInt' },
      { field: 'efficiency_multiplier', sourceField: 'team_efficiency_scalar', required: false, transform: 'roundToThree' },
      { field: 'injury_adjustment', sourceField: 'injury_risk_factor', required: false, transform: 'roundToThree' },
      { field: 'draft_capital_boost', sourceField: 'nfl_draft_boost', required: false, transform: 'roundToThree' }
    ],
    validationRules: [
      { field: 'fantasy_points', type: 'integer', constraints: { min: 0, max: 500 } },
      { field: 'depth_rank', type: 'integer', constraints: { min: 1, max: 10 } },
      { field: 'usage_rate', type: 'float', constraints: { min: 0.0, max: 1.0 } }
    ]
  }
};

/**
 * Sync Jobs Configuration
 */
export const SYNC_JOBS: Record<string, SyncJob> = {
  sync_cfbd_players: {
    id: 'sync_cfbd_players',
    name: 'CFBD Player Data Sync',
    description: 'Sync player rosters and stats from CFBD API',
    source: 'cfbd',
    target: 'college_players',
    transform: 'cfbd_to_players',
    schedule: {
      frequency: 'daily',
      time: '02:00', // 2 AM UTC
      dependencies: ['sync_cfbd_teams']
    },
    errorHandling: {
      retries: 3,
      backoffStrategy: 'exponential',
      failureNotification: true
    },
    performance: {
      batchSize: 100,
      parallelization: true,
      timeout: 300
    }
  },
  
  sync_cfbd_games: {
    id: 'sync_cfbd_games',
    name: 'CFBD Game Schedule Sync',
    description: 'Sync game schedules and scores from CFBD',
    source: 'cfbd',
    target: 'games',
    transform: 'cfbd_to_games',
    schedule: {
      frequency: 'hourly',
      dependencies: []
    },
    errorHandling: {
      retries: 2,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 50,
      parallelization: false,
      timeout: 180
    }
  },
  
  sync_cfbd_rankings: {
    id: 'sync_cfbd_rankings',
    name: 'AP Rankings Sync',
    description: 'Sync weekly AP Top 25 rankings for eligibility',
    source: 'cfbd',
    target: 'rankings',
    transform: 'cfbd_to_rankings',
    schedule: {
      frequency: 'weekly',
      time: 'Tuesday 12:00'
    },
    errorHandling: {
      retries: 2,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 25,
      parallelization: false,
      timeout: 60
    }
  },
  
  comprehensive_projection_calculation: {
    id: 'comprehensive_projection_calculation',
    name: 'Comprehensive Projection Pipeline (Single Source of Truth)',
    description: 'Calculate fantasy projections using comprehensive algorithm: pace, efficiency, depth charts, usage priors, injury risk, NFL draft capital',
    source: 'comprehensive_projection_pipeline',
    target: 'college_players',
    transform: 'comprehensive_algorithm_to_projections',
    schedule: {
      frequency: 'daily',
      time: '04:00',
      dependencies: ['sync_cfbd_players', 'sync_cfbd_games']
    },
    errorHandling: {
      retries: 2,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 1000,
      parallelization: true,
      timeout: 600
    }
  },

  evaluate_projection_models: {
    id: 'evaluate_projection_models',
    name: 'Projection Model Evaluation',
    description: 'Evaluate projection accuracy using MAE, sMAPE, R², calibration metrics',
    source: 'projection_evaluation',
    target: 'evaluation_reports',
    transform: 'projections_to_metrics',
    schedule: {
      frequency: 'manual',
      dependencies: ['calculate_projections']
    },
    errorHandling: {
      retries: 1,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 1000,
      parallelization: false,
      timeout: 300
    }
  },

  synthetic_health_checks: {
    id: 'synthetic_health_checks',
    name: 'Synthetic Health Monitoring',
    description: 'Automated health checks and system monitoring via Vercel Cron',
    source: 'synthetic_monitoring',
    target: 'monitoring_kv_store',
    transform: 'health_to_metrics',
    schedule: {
      frequency: 'realtime',
      dependencies: []
    },
    errorHandling: {
      retries: 1,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 1,
      parallelization: false,
      timeout: 30
    }
  },

  schema_compliance_validation: {
    id: 'schema_compliance_validation',
    name: 'Schema Contract Testing',
    description: 'Automated schema compliance validation and drift detection',
    source: 'contract_testing',
    target: 'schema_validation_logs',
    transform: 'contract_to_compliance',
    schedule: {
      frequency: 'realtime',
      dependencies: []
    },
    errorHandling: {
      retries: 0,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 1,
      parallelization: false,
      timeout: 10
    }
  },

  post_deploy_smoke_tests: {
    id: 'post_deploy_smoke_tests',
    name: 'Post-Deploy Smoke Testing',
    description: '30-second regression detection via Playwright after deployments',
    source: 'smoke_testing',
    target: 'test_results_storage',
    transform: 'smoke_to_results',
    schedule: {
      frequency: 'manual',
      dependencies: []
    },
    errorHandling: {
      retries: 2,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 1,
      parallelization: true,
      timeout: 60
    }
  },

  pipeline_activation_enhanced: {
    id: 'pipeline_activation_enhanced',
    name: 'Enhanced Pipeline Activation with API Integration',
    description: 'Comprehensive 4-module pipeline with CFBD and Appwrite API integration',
    source: 'cfbd_enhanced_pipeline',
    target: 'projections_collections',
    transform: 'ingestion_to_projections',
    schedule: {
      frequency: 'daily',
      time: '03:00',
      dependencies: ['data_ingestion_orchestrator']
    },
    errorHandling: {
      retries: 3,
      backoffStrategy: 'exponential',
      failureNotification: true
    },
    performance: {
      batchSize: 500,
      parallelization: true,
      timeout: 600
    }
  },

  simplified_pipeline_activation: {
    id: 'simplified_pipeline_activation',
    name: 'Simplified Pipeline for Existing Data',
    description: 'Streamlined activation using existing depth chart and player data',
    source: 'data_ingestion_orchestrator',
    target: 'projections_collections',
    transform: 'depth_to_projections',
    schedule: {
      frequency: 'manual',
      dependencies: ['pipeline_activation_enhanced']
    },
    errorHandling: {
      retries: 2,
      backoffStrategy: 'linear',
      failureNotification: true
    },
    performance: {
      batchSize: 1000,
      parallelization: true,
      timeout: 300
    }
  }
};

/**
 * Frontend Data Flow Configuration
 */
export const FRONTEND_DATA_FLOWS: Record<string, FrontendDataFlow> = {
  league_create: {
    page: '/league/create',
    component: 'CreateLeaguePage',
    dataRequirements: {
      collections: [],
      realtime: false,
      caching: {
        enabled: false,
        strategy: 'browser'
      }
    },
    userActions: [
      {
        action: 'create_league',
        method: 'POST',
        endpoint: '/api/leagues/create',
        affectedCollections: ['leagues', 'rosters'],
        revalidationNeeded: ['/dashboard', '/leagues/my-leagues']
      }
    ]
  },
  
  draft_room: {
    page: '/draft/[leagueId]/realtime',
    component: 'RealtimeDraftRoom',
    dataRequirements: {
      collections: ['college_players'],
      realtime: true,
      caching: {
        enabled: true,
        ttl: 30,
        strategy: 'server'
      }
    },
    userActions: [
      {
        action: 'load_all_players',
        method: 'GET',
        endpoint: '/api/draft/players?limit=10000&orderBy=projection',
        affectedCollections: [],
        revalidationNeeded: []
      },
      {
        action: 'make_pick',
        method: 'POST',
        endpoint: '/api/draft/[leagueId]/pick',
        affectedCollections: ['rosters'],
        revalidationNeeded: ['draft/[leagueId]/realtime', 'league/[leagueId]/standings']
      }
    ]
  },
  
  auction_room: {
    page: '/auction/[leagueId]',
    component: 'AuctionDraftRoom',
    dataRequirements: {
      collections: ['college_players', 'auctions', 'bids', 'rosters'],
      realtime: true,
      caching: {
        enabled: true,
        ttl: 10,
        strategy: 'server'
      }
    },
    userActions: [
      {
        action: 'place_bid',
        method: 'POST',
        endpoint: '/api/auction/[leagueId]/bid',
        affectedCollections: ['bids', 'auctions'],
        revalidationNeeded: ['auction/[leagueId]']
      }
    ]
  },
  
  league_dashboard: {
    page: '/league/[leagueId]',
    component: 'LeagueDashboard',
    dataRequirements: {
      collections: ['leagues', 'rosters', 'games', 'lineups'],
      realtime: false,
      caching: {
        enabled: true,
        ttl: 300,
        strategy: 'server'
      }
    },
    userActions: [
      {
        action: 'update_lineup',
        method: 'PUT',
        endpoint: '/api/lineups/set',
        affectedCollections: ['lineups'],
        revalidationNeeded: ['league/[leagueId]/locker-room', 'league/[leagueId]/scoreboard']
      }
    ]
  },
  
  scoreboard: {
    page: '/league/[leagueId]/scoreboard',
    component: 'LeagueScoreboard',
    dataRequirements: {
      collections: ['lineups', 'player_stats', 'games'],
      realtime: true,
      caching: {
        enabled: true,
        ttl: 60,
        strategy: 'server'
      }
    },
    userActions: []
  },

  health_monitoring: {
    page: '/api/health',
    component: 'HealthEndpoint',
    dataRequirements: {
      collections: ['leagues', 'rosters', 'college_players'], // for connectivity tests
      realtime: false,
      caching: {
        enabled: false,
        strategy: 'server'
      }
    },
    userActions: []
  },

  synthetic_monitoring: {
    page: '/api/cron/synthetic-monitoring',
    component: 'SyntheticMonitoringCron',
    dataRequirements: {
      collections: ['leagues', 'college_players', 'games'], // for comprehensive testing
      realtime: false,
      caching: {
        enabled: false,
        strategy: 'server'
      }
    },
    userActions: []
  },

  monitoring_dashboard: {
    page: '/api/monitoring/dashboard',
    component: 'MonitoringDashboard',
    dataRequirements: {
      collections: [], // reads from KV store
      realtime: true,
      caching: {
        enabled: true,
        ttl: 60,
        strategy: 'server'
      }
    },
    userActions: []
  },

  projection_evaluation_cli: {
    page: '/evaluation/eval_proj.ts',
    component: 'ProjectionEvaluationCLI',
    dataRequirements: {
      collections: ['projections_weekly', 'projections_yearly', 'scoring', 'player_stats', 'leagues'],
      realtime: false,
      caching: {
        enabled: false,
        strategy: 'server'
      }
    },
    userActions: [
      {
        action: 'run_evaluation',
        method: 'GET',
        endpoint: 'CLI: eval_proj --weeks RANGE --out PATH',
        affectedCollections: [], // read-only operation
        revalidationNeeded: []
      }
    ]
  },

  pipeline_activation_scripts: {
    page: '/scripts/activate-pipeline.ts',
    component: 'EnhancedPipelineActivation',
    dataRequirements: {
      collections: ['college_players', 'projections_yearly', 'projections_weekly', 'model_inputs', 'player_depth_charts'],
      realtime: false,
      caching: {
        enabled: false,
        strategy: 'server'
      }
    },
    userActions: [
      {
        action: 'activate_full_pipeline',
        method: 'POST',
        endpoint: 'CLI: npx tsx scripts/activate-pipeline.ts',
        affectedCollections: ['projections_yearly', 'projections_weekly', 'player_depth_charts', 'team_context'],
        revalidationNeeded: ['/api/draft/players', '/draft/[leagueId]/realtime']
      },
      {
        action: 'activate_simple_pipeline',
        method: 'POST', 
        endpoint: 'CLI: npx tsx scripts/activate-pipeline-simple.ts',
        affectedCollections: ['projections_yearly', 'projections_weekly'],
        revalidationNeeded: ['/api/draft/players']
      }
    ]
  }
};

/**
 * Deployment Sync Configuration
 */
export const DEPLOYMENT_SYNC: Record<string, DeploymentSync> = {
  schema_update: {
    trigger: 'schema_change',
    preDeployTasks: [
      'backup_production_db',
      'validate_schema_changes',
      'run_migration_scripts'
    ],
    postDeployTasks: [
      'verify_schema_sync',
      'run_data_validation',
      'clear_application_cache'
    ],
    rollbackStrategy: 'restore_from_backup',
    environmentSync: {
      development: true,
      staging: true,
      production: false // Manual approval required
    }
  },
  
  code_deployment: {
    trigger: 'code_push',
    preDeployTasks: [
      'run_tests',
      'build_application',
      'validate_environment_vars'
    ],
    postDeployTasks: [
      'warm_cache',
      'run_smoke_tests',
      'notify_team'
    ],
    rollbackStrategy: 'previous_deployment',
    environmentSync: {
      development: true,
      staging: true,
      production: true
    }
  },
  
  env_var_sync: {
    trigger: 'env_var_change',
    preDeployTasks: [
      'validate_env_vars',
      'backup_current_config'
    ],
    postDeployTasks: [
      'restart_functions',
      'verify_connections',
      'run_health_checks'
    ],
    rollbackStrategy: 'restore_previous_config',
    environmentSync: {
      development: true,
      staging: true,
      production: false // Manual approval required
    }
  },

  monitoring_infrastructure_sync: {
    trigger: 'code_push',
    preDeployTasks: [
      'validate_monitoring_config',
      'test_health_endpoints',
      'validate_cron_schedules'
    ],
    postDeployTasks: [
      'activate_synthetic_monitoring',
      'verify_contract_tests',
      'run_smoke_tests',
      'initialize_monitoring_dashboard',
      'setup_alert_thresholds'
    ],
    rollbackStrategy: 'revert_monitoring_config',
    environmentSync: {
      development: true,
      staging: true,
      production: true
    }
  },

  test_infrastructure_sync: {
    trigger: 'code_push',
    preDeployTasks: [
      'validate_test_config',
      'setup_msw_handlers',
      'prepare_mock_data'
    ],
    postDeployTasks: [
      'run_contract_tests',
      'execute_playwright_smoke_tests',
      'validate_test_isolation',
      'store_test_results'
    ],
    rollbackStrategy: 'restore_test_config',
    environmentSync: {
      development: true,
      staging: true,
      production: false // Tests run but don't affect production
    }
  }
};

/**
 * Complete Data Pipeline Visualization
 */
export class DataPipelineVisualizer {
  static generateFlowDiagram(): string {
    return `
# College Football Fantasy App - Data Flow Architecture

## External Data Sources → Appwrite Collections
${Object.entries(DATA_SOURCES).map(([id, source]) => 
  `- **${source.name}** (${source.reliability} reliability, ${source.updateFrequency})
   └── Used by: ${Object.values(SYNC_JOBS).filter(job => job.source === id).map(job => job.target).join(', ')}`
).join('\n')}

## Sync Jobs Pipeline
${Object.entries(SYNC_JOBS).map(([id, job]) => 
  `- **${job.name}** (${job.schedule.frequency})
   └── ${job.source} → ${job.target} via ${job.transform}
   └── Dependencies: ${job.schedule.dependencies?.join(', ') || 'None'}`
).join('\n')}

## Frontend Data Consumption
${Object.entries(FRONTEND_DATA_FLOWS).map(([id, flow]) => 
  `- **${flow.page}**
   └── Reads: ${flow.dataRequirements.collections.join(', ')}
   └── Realtime: ${flow.dataRequirements.realtime}
   └── User Actions: ${flow.userActions.map(action => action.action).join(', ')}`
).join('\n')}

## Deployment & Sync Triggers
${Object.entries(DEPLOYMENT_SYNC).map(([id, sync]) => 
  `- **${sync.trigger}**
   └── Pre-Deploy: ${sync.preDeployTasks.join(', ')}
   └── Post-Deploy: ${sync.postDeployTasks.join(', ')}
   └── Environments: ${Object.entries(sync.environmentSync).filter(([_, enabled]) => enabled).map(([env]) => env).join(', ')}`
).join('\n')}
    `;
  }

  static getCollectionDependencies(collectionId: string): string[] {
    const dependencies: string[] = [];
    const config = APPWRITE_SCHEMA[collectionId];
    
    if (config) {
      config.relationships.forEach(rel => {
        dependencies.push(rel.collection);
      });
    }
    
    return dependencies;
  }

  static getSyncChain(): string[] {
    // Build dependency graph for sync jobs
    const jobs = Object.values(SYNC_JOBS);
    const sorted: string[] = [];
    const visited = new Set<string>();
    
    const visit = (jobId: string) => {
      if (visited.has(jobId)) return;
      visited.add(jobId);
      
      const job = jobs.find(j => j.id === jobId);
      if (job && job.schedule.dependencies) {
        job.schedule.dependencies.forEach(dep => visit(dep));
      }
      
      sorted.push(jobId);
    };
    
    jobs.forEach(job => visit(job.id));
    return sorted;
  }

  static generateMermaidDiagram(): string {
    return `
graph TD
    %% External Data Sources
    CFBD[College Football Data API]
    ESPN[ESPN API]
    ROTOWIRE[Rotowire API]
    MANUAL[Manual Admin Input]
    USER[User Input]
    
    %% ALIGNED PROJECTION PIPELINE (Single Source of Truth)
    PIPELINE[functions/project-yearly-simple/]
    MODEL_INPUTS[(model_inputs)]
    DEPTH_CHARTS[Depth Charts]
    USAGE_PRIORS[Usage Priors]
    TEAM_EFF[Team Efficiency]
    PACE_EST[Pace Estimates]
    INJURY_DATA[Injury Risk]
    DRAFT_CAPITAL[NFL Draft Capital]
    
    %% Core Collections (Single Source)
    PLAYERS[(college_players.fantasy_points)]
    GAMES[(games)]
    TEAMS[(teams)]
    RANKINGS[(rankings)]
    LEAGUES[(leagues)]
    ROSTERS[(rosters)]
    
    %% ALIGNED API LAYER (Passthrough Only)
    API_DRAFT[/api/draft/players]
    API_LEAGUES[/api/leagues]
    
    %% Schema & Validation Layer
    SCHEMA[Schema Enforcer]
    CONTRACT[Contract Tests]
    MSW[MSW Test Isolation]
    VERIFY[Data Flow Verifier]
    
    %% Frontend Pages (Aligned)
    CREATE[League Create]
    DRAFT[Draft Room - 10K Players]
    AUCTION[Auction Room]
    DASHBOARD[League Dashboard]
    SCOREBOARD[Scoreboard]
    SHOWCASE[Projection Showcase]
    
    %% Monitoring & Testing Infrastructure
    HEALTH[Health Endpoint]
    SYNTHETIC[Synthetic Monitoring]
    SMOKE[Playwright Smoke Tests]
    MONITOR_DASH[Monitoring Dashboard]
    KV[KV Storage]
    
    %% ALIGNED DATA FLOW (Single Source of Truth)
    CFBD -->|Daily Sync| MODEL_INPUTS
    DEPTH_CHARTS --> MODEL_INPUTS
    USAGE_PRIORS --> MODEL_INPUTS
    TEAM_EFF --> MODEL_INPUTS
    PACE_EST --> MODEL_INPUTS
    INJURY_DATA --> MODEL_INPUTS
    DRAFT_CAPITAL --> MODEL_INPUTS
    
    %% COMPREHENSIVE PROJECTION PIPELINE
    MODEL_INPUTS -->|Complete Algorithm| PIPELINE
    PIPELINE -->|fantasy_points| PLAYERS
    
    %% ALIGNED API PASSTHROUGH (No Calculations)
    PLAYERS -->|Direct Read| API_DRAFT
    LEAGUES -->|Direct Read| API_LEAGUES
    
    %% User Interactions with Validation
    USER -->|Create League| SCHEMA
    USER -->|Join League| SCHEMA
    USER -->|Draft Pick| SCHEMA
    USER -->|Auction Bid| SCHEMA
    SCHEMA -->|Validated Actions| LEAGUES
    SCHEMA -->|Validated Actions| ROSTERS
    
    %% ALIGNED FRONTEND DATA FLOW
    API_DRAFT -->|10,000 Players| DRAFT
    API_DRAFT -->|Ordered Projections| AUCTION
    API_DRAFT -->|Algorithm Demo| SHOWCASE
    API_LEAGUES --> CREATE
    API_LEAGUES --> DASHBOARD
    ROSTERS --> DASHBOARD
    GAMES --> SCOREBOARD
    
    %% DATA FLOW VERIFICATION
    VERIFY -->|100% Alignment Check| PLAYERS
    VERIFY -->|100% Alignment Check| API_DRAFT
    VERIFY -->|100% Alignment Check| DRAFT
    
    %% Monitoring & Testing Flow
    HEALTH -->|Every 5min| SYNTHETIC
    SYNTHETIC -->|Comprehensive Checks| KV
    KV -->|Metrics Storage| MONITOR_DASH
    CONTRACT -->|Schema Validation| SCHEMA
    MSW -->|Test Isolation| CONTRACT
    SMOKE -->|Post-Deploy| HEALTH
    
    %% Realtime Updates (Aligned)
    ROSTERS -.->|Realtime| DRAFT
    PLAYERS -.->|Single Source| AUCTION
    GAMES -.->|Realtime| SCOREBOARD
    KV -.->|Realtime Metrics| MONITOR_DASH
    
    %% GitHub Actions Integration
    GHA[GitHub Actions]
    VERCEL[Vercel Deployment]
    GHA -->|Post-Deploy| SMOKE
    VERCEL -->|Deployment Status| GHA
    SMOKE -->|Test Results| HEALTH
    
    %% STYLING
    style CFBD fill:#e1f5fe
    style PIPELINE fill:#4caf50,color:#fff
    style PLAYERS fill:#2e7d32,color:#fff
    style API_DRAFT fill:#1976d2,color:#fff
    style DRAFT fill:#ff9800,color:#fff
    style AUCTION fill:#ff9800,color:#fff
    style SCHEMA fill:#e8f5e8
    style HEALTH fill:#fff8e1
    style SYNTHETIC fill:#f3e5f5
    style CONTRACT fill:#e0f2f1
    style MSW fill:#fce4ec
    style VERIFY fill:#c8e6c9
    style SHOWCASE fill:#fff3e0
    `;
  }
}

/**
 * Utility Functions
 */
export function validateDataFlow(collectionId: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const config = APPWRITE_SCHEMA[collectionId];
  
  if (!config) {
    return { valid: false, issues: ['Collection not found in schema'] };
  }
  
  // Check if collection has sync jobs
  const syncJobs = Object.values(SYNC_JOBS).filter(job => job.target === collectionId);
  if (syncJobs.length === 0 && config.dataSources.primary !== 'Manual') {
    issues.push('No sync jobs defined for external data source');
  }
  
  // Check if collection is used by frontend
  const frontendUsage = Object.values(FRONTEND_DATA_FLOWS).some(flow => 
    flow.dataRequirements.collections.includes(collectionId)
  );
  if (!frontendUsage) {
    issues.push('Collection not used by any frontend components');
  }
  
  // Check relationships
  config.relationships.forEach(rel => {
    if (!APPWRITE_SCHEMA[rel.collection]) {
      issues.push(`Related collection '${rel.collection}' not found in schema`);
    }
  });
  
  return { valid: issues.length === 0, issues };
}

export function getOptimalSyncOrder(): string[] {
  return DataPipelineVisualizer.getSyncChain();
}

/**
 * ALIGNED DATA FLOW VERIFICATION (August 17, 2025)
 * 
 * This section documents the completed data flow alignment work that established
 * a single source of truth for all fantasy projections across the application.
 */
export interface AlignedDataFlow {
  pipelineSource: string;
  databaseField: string;
  apiEndpoint: string;
  frontendComponent: string;
  verificationScript: string;
  alignmentStatus: 'aligned' | 'needs_review' | 'deprecated';
}

export const ALIGNED_PROJECTION_FLOW: AlignedDataFlow = {
  pipelineSource: 'functions/project-yearly-simple/index.ts',
  databaseField: 'college_players.fantasy_points',
  apiEndpoint: '/api/draft/players?orderBy=projection&limit=10000',
  frontendComponent: 'RealtimeDraftRoom (/draft/[leagueId]/realtime)',
  verificationScript: '/scripts/verify-data-flow-alignment.ts',
  alignmentStatus: 'aligned'
};

export const REMOVED_REDUNDANCIES: string[] = [
  '/lib/services/enhanced-projections.service.ts',
  '/app/api/projections/route.ts',
  'calculateBaseProjection() in /app/api/draft/players/route.ts',
  'depthMultiplier() in /app/api/draft/players/route.ts',
  '/lib/services/projections.service.ts',
  '/lib/services/weekly-projections-builder.service.ts'
];

export const DOCUMENTATION_CREATED: string[] = [
  '/docs/DATA_FLOW_ALIGNMENT.md',
  '/scripts/verify-data-flow-alignment.ts',
  '/app/projection-showcase/page.tsx',
  'Updated /core/pipeline/data-flow-map.ts (this file)',
  'Updated CLAUDE.md with alignment completion'
];

/**
 * Verify the aligned data flow is functioning correctly
 */
export async function verifyAlignedDataFlow(): Promise<{
  aligned: boolean;
  issues: string[];
  verificationResults: Record<string, boolean>;
}> {
  const results = {
    pipelineScriptExists: false,
    databaseFieldPopulated: false,
    apiEndpointFunctional: false,
    frontendDisplaysCorrectly: false,
    verificationScriptRuns: false
  };
  
  const issues: string[] = [];
  
  // This would be implemented to actually test the data flow
  // For now, we document the expected verification steps
  
  return {
    aligned: Object.values(results).every(v => v),
    issues,
    verificationResults: results
  };
}

/**
 * Generate a summary of the aligned data flow
 */
export function generateAlignedFlowSummary(): string {
  return `
# ALIGNED DATA FLOW SUMMARY (August 17, 2025)

## 🎯 Single Source of Truth Established

**Pipeline**: ${ALIGNED_PROJECTION_FLOW.pipelineSource}
- Comprehensive algorithm with 6+ data inputs
- Team pace, efficiency, depth charts, usage priors, injury risk, NFL draft capital

**Database**: ${ALIGNED_PROJECTION_FLOW.databaseField}  
- Canonical storage for all fantasy projections
- Updated by pipeline scripts only (no API calculations)

**API**: ${ALIGNED_PROJECTION_FLOW.apiEndpoint}
- Direct passthrough of database values
- No projection calculations in API layer
- Supports up to 10,000 players (all available)

**Frontend**: ${ALIGNED_PROJECTION_FLOW.frontendComponent}
- Displays API projection values directly
- Shows proper ordering (highest to lowest)
- Real-time updates for draft interactions

## 🧹 Removed Redundancies
${REMOVED_REDUNDANCIES.map(item => `- ${item}`).join('\n')}

## 📚 Documentation Created  
${DOCUMENTATION_CREATED.map(item => `- ${item}`).join('\n')}

## ✅ Verification
**Status**: ${ALIGNED_PROJECTION_FLOW.alignmentStatus.toUpperCase()}
**Verification Script**: ${ALIGNED_PROJECTION_FLOW.verificationScript}
**Last Verified**: August 17, 2025

## 🚀 Data Flow
\`${ALIGNED_PROJECTION_FLOW.pipelineSource}\` 
→ \`${ALIGNED_PROJECTION_FLOW.databaseField}\` 
→ \`${ALIGNED_PROJECTION_FLOW.apiEndpoint}\` 
→ \`${ALIGNED_PROJECTION_FLOW.frontendComponent}\`
`;
}