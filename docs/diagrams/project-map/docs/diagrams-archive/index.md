# Project Map — docs/diagrams-archive

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  docs_diagrams_archive["docs/diagrams-archive/" ]
  class docs_diagrams_archive folder
  docs_diagrams_archive_admin_tools["admin-tools/"]
  class docs_diagrams_archive_admin_tools folder
  docs_diagrams_archive --> docs_diagrams_archive_admin_tools
  click docs_diagrams_archive_admin_tools "/admin/project-map/docs/diagrams-archive/admin-tools" "Open admin-tools"
  docs_diagrams_archive_app_admin_cache_status_md["app.admin.cache-status.md"]
  class docs_diagrams_archive_app_admin_cache_status_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_admin_cache_status_md
  docs_diagrams_archive_app_admin_md["app.admin.md"]
  class docs_diagrams_archive_app_admin_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_admin_md
  docs_diagrams_archive_app_admin_project_map_md["app.admin.project-map.md"]
  class docs_diagrams_archive_app_admin_project_map_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_admin_project_map_md
  docs_diagrams_archive_app_admin_sec_survey_md["app.admin.sec-survey.md"]
  class docs_diagrams_archive_app_admin_sec_survey_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_admin_sec_survey_md
  docs_diagrams_archive_app_admin_sync_status_md["app.admin.sync-status.md"]
  class docs_diagrams_archive_app_admin_sync_status_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_admin_sync_status_md
  docs_diagrams_archive_app_api_admin_md["app.api.admin.md"]
  class docs_diagrams_archive_app_api_admin_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_admin_md
  docs_diagrams_archive_app_api_auctions_md["app.api.auctions.md"]
  class docs_diagrams_archive_app_api_auctions_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_auctions_md
  docs_diagrams_archive_app_api_auth_md["app.api.auth.md"]
  class docs_diagrams_archive_app_api_auth_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_auth_md
  docs_diagrams_archive_app_api_bids_md["app.api.bids.md"]
  class docs_diagrams_archive_app_api_bids_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_bids_md
  docs_diagrams_archive_app_api_blender_md["app.api.blender.md"]
  class docs_diagrams_archive_app_api_blender_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_blender_md
  docs_diagrams_archive_app_api_cache_md["app.api.cache.md"]
  class docs_diagrams_archive_app_api_cache_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_cache_md
  docs_diagrams_archive_app_api_cfbd_md["app.api.cfbd.md"]
  class docs_diagrams_archive_app_api_cfbd_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_cfbd_md
  docs_diagrams_archive_app_api_claude_md["app.api.claude.md"]
  class docs_diagrams_archive_app_api_claude_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_claude_md
  docs_diagrams_archive_app_api_conferences_md["app.api.conferences.md"]
  class docs_diagrams_archive_app_api_conferences_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_conferences_md
  docs_diagrams_archive_app_api_cron_md["app.api.cron.md"]
  class docs_diagrams_archive_app_api_cron_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_cron_md
  docs_diagrams_archive_app_api_cursor_report_md["app.api.cursor-report.md"]
  class docs_diagrams_archive_app_api_cursor_report_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_cursor_report_md
  docs_diagrams_archive_app_api_docs_md["app.api.docs.md"]
  class docs_diagrams_archive_app_api_docs_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_docs_md
  docs_diagrams_archive_app_api_draft_md["app.api.draft.md"]
  class docs_diagrams_archive_app_api_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_draft_md
  docs_diagrams_archive_app_api_drafts_md["app.api.drafts.md"]
  class docs_diagrams_archive_app_api_drafts_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_drafts_md
  docs_diagrams_archive_app_api_games_md["app.api.games.md"]
  class docs_diagrams_archive_app_api_games_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_games_md
  docs_diagrams_archive_app_api_health_md["app.api.health.md"]
  class docs_diagrams_archive_app_api_health_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_health_md
  docs_diagrams_archive_app_api_launch_md["app.api.launch.md"]
  class docs_diagrams_archive_app_api_launch_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_launch_md
  docs_diagrams_archive_app_api_leagues_md["app.api.leagues.md"]
  class docs_diagrams_archive_app_api_leagues_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_leagues_md
  docs_diagrams_archive_app_api_mascot_md["app.api.mascot.md"]
  class docs_diagrams_archive_app_api_mascot_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_mascot_md
  docs_diagrams_archive_app_api_mcp_md["app.api.mcp.md"]
  class docs_diagrams_archive_app_api_mcp_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_mcp_md
  docs_diagrams_archive_app_api_md["app.api.md"]
  class docs_diagrams_archive_app_api_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_md
  docs_diagrams_archive_app_api_meshy_md["app.api.meshy.md"]
  class docs_diagrams_archive_app_api_meshy_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_meshy_md
  docs_diagrams_archive_app_api_migrations_md["app.api.migrations.md"]
  class docs_diagrams_archive_app_api_migrations_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_migrations_md
  docs_diagrams_archive_app_api_mock_draft_md["app.api.mock-draft.md"]
  class docs_diagrams_archive_app_api_mock_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_mock_draft_md
  docs_diagrams_archive_app_api_monitoring_md["app.api.monitoring.md"]
  class docs_diagrams_archive_app_api_monitoring_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_monitoring_md
  docs_diagrams_archive_app_api_og_md["app.api.og.md"]
  class docs_diagrams_archive_app_api_og_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_og_md
  docs_diagrams_archive_app_api_players_md["app.api.players.md"]
  class docs_diagrams_archive_app_api_players_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_players_md
  docs_diagrams_archive_app_api_projections_md["app.api.projections.md"]
  class docs_diagrams_archive_app_api_projections_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_projections_md
  docs_diagrams_archive_app_api_rankings_md["app.api.rankings.md"]
  class docs_diagrams_archive_app_api_rankings_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_rankings_md
  docs_diagrams_archive_app_api_rosters_md["app.api.rosters.md"]
  class docs_diagrams_archive_app_api_rosters_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_rosters_md
  docs_diagrams_archive_app_api_rotowire_md["app.api.rotowire.md"]
  class docs_diagrams_archive_app_api_rotowire_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_rotowire_md
  docs_diagrams_archive_app_api_runway_md["app.api.runway.md"]
  class docs_diagrams_archive_app_api_runway_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_runway_md
  docs_diagrams_archive_app_api_schedule_md["app.api.schedule.md"]
  class docs_diagrams_archive_app_api_schedule_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_schedule_md
  docs_diagrams_archive_app_api_scraper_md["app.api.scraper.md"]
  class docs_diagrams_archive_app_api_scraper_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_scraper_md
  docs_diagrams_archive_app_api_search_md["app.api.search.md"]
  class docs_diagrams_archive_app_api_search_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_search_md
  docs_diagrams_archive_app_api_security_md["app.api.security.md"]
  class docs_diagrams_archive_app_api_security_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_security_md
  docs_diagrams_archive_app_api_static_md["app.api.static.md"]
  class docs_diagrams_archive_app_api_static_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_static_md
  docs_diagrams_archive_app_api_sync_md["app.api.sync.md"]
  class docs_diagrams_archive_app_api_sync_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_sync_md
  docs_diagrams_archive_app_api_users_md["app.api.users.md"]
  class docs_diagrams_archive_app_api_users_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_users_md
  docs_diagrams_archive_app_api_webhooks_md["app.api.webhooks.md"]
  class docs_diagrams_archive_app_api_webhooks_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_api_webhooks_md
  docs_diagrams_archive_app_dashboard_account_md["app.dashboard.account.md"]
  class docs_diagrams_archive_app_dashboard_account_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_account_md
  docs_diagrams_archive_app_dashboard_admin_md["app.dashboard.admin.md"]
  class docs_diagrams_archive_app_dashboard_admin_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_admin_md
  docs_diagrams_archive_app_dashboard_dashboard_md["app.dashboard.dashboard.md"]
  class docs_diagrams_archive_app_dashboard_dashboard_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_dashboard_md
  docs_diagrams_archive_app_dashboard_league_md["app.dashboard.league.md"]
  class docs_diagrams_archive_app_dashboard_league_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_league_md
  docs_diagrams_archive_app_dashboard_md["app.dashboard.md"]
  class docs_diagrams_archive_app_dashboard_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_md
  docs_diagrams_archive_app_dashboard_scoreboard_md["app.dashboard.scoreboard.md"]
  class docs_diagrams_archive_app_dashboard_scoreboard_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_scoreboard_md
  docs_diagrams_archive_app_dashboard_standings_md["app.dashboard.standings.md"]
  class docs_diagrams_archive_app_dashboard_standings_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_dashboard_standings_md
  docs_diagrams_archive_app_draft_draft_md["app.draft.draft.md"]
  class docs_diagrams_archive_app_draft_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_draft_draft_md
  docs_diagrams_archive_app_draft_md["app.draft.md"]
  class docs_diagrams_archive_app_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_draft_md
  docs_diagrams_archive_app_draft_mock_draft_md["app.draft.mock-draft.md"]
  class docs_diagrams_archive_app_draft_mock_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_draft_mock_draft_md
  docs_diagrams_archive_app_marketing_conference_showcase_md["app.marketing.conference-showcase.md"]
  class docs_diagrams_archive_app_marketing_conference_showcase_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_conference_showcase_md
  docs_diagrams_archive_app_marketing_invite_md["app.marketing.invite.md"]
  class docs_diagrams_archive_app_marketing_invite_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_invite_md
  docs_diagrams_archive_app_marketing_launch_md["app.marketing.launch.md"]
  class docs_diagrams_archive_app_marketing_launch_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_launch_md
  docs_diagrams_archive_app_marketing_login_md["app.marketing.login.md"]
  class docs_diagrams_archive_app_marketing_login_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_login_md
  docs_diagrams_archive_app_marketing_md["app.marketing.md"]
  class docs_diagrams_archive_app_marketing_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_md
  docs_diagrams_archive_app_marketing_offline_md["app.marketing.offline.md"]
  class docs_diagrams_archive_app_marketing_offline_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_offline_md
  docs_diagrams_archive_app_marketing_projection_showcase_md["app.marketing.projection-showcase.md"]
  class docs_diagrams_archive_app_marketing_projection_showcase_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_projection_showcase_md
  docs_diagrams_archive_app_marketing_signup_md["app.marketing.signup.md"]
  class docs_diagrams_archive_app_marketing_signup_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_signup_md
  docs_diagrams_archive_app_marketing_videos_md["app.marketing.videos.md"]
  class docs_diagrams_archive_app_marketing_videos_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_marketing_videos_md
  docs_diagrams_archive_app_md["app.md"]
  class docs_diagrams_archive_app_md file
  docs_diagrams_archive --> docs_diagrams_archive_app_md
  docs_diagrams_archive_components_charts_md["components.charts.md"]
  class docs_diagrams_archive_components_charts_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_charts_md
  docs_diagrams_archive_components_dev_md["components.dev.md"]
  class docs_diagrams_archive_components_dev_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_dev_md
  docs_diagrams_archive_components_docs_md["components.docs.md"]
  class docs_diagrams_archive_components_docs_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_docs_md
  docs_diagrams_archive_components_draft_md["components.draft.md"]
  class docs_diagrams_archive_components_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_draft_md
  docs_diagrams_archive_components_features_conferences_md["components.features.conferences.md"]
  class docs_diagrams_archive_components_features_conferences_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_features_conferences_md
  docs_diagrams_archive_components_features_draft_md["components.features.draft.md"]
  class docs_diagrams_archive_components_features_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_features_draft_md
  docs_diagrams_archive_components_features_games_md["components.features.games.md"]
  class docs_diagrams_archive_components_features_games_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_features_games_md
  docs_diagrams_archive_components_features_leagues_md["components.features.leagues.md"]
  class docs_diagrams_archive_components_features_leagues_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_features_leagues_md
  docs_diagrams_archive_components_features_md["components.features.md"]
  class docs_diagrams_archive_components_features_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_features_md
  docs_diagrams_archive_components_features_players_md["components.features.players.md"]
  class docs_diagrams_archive_components_features_players_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_features_players_md
  docs_diagrams_archive_components_forms_md["components.forms.md"]
  class docs_diagrams_archive_components_forms_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_forms_md
  docs_diagrams_archive_components_hooks_md["components.hooks.md"]
  class docs_diagrams_archive_components_hooks_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_hooks_md
  docs_diagrams_archive_components_layout_md["components.layout.md"]
  class docs_diagrams_archive_components_layout_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_layout_md
  docs_diagrams_archive_components_md["components.md"]
  class docs_diagrams_archive_components_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_md
  docs_diagrams_archive_components_tables_md["components.tables.md"]
  class docs_diagrams_archive_components_tables_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_tables_md
  docs_diagrams_archive_components_ui_md["components.ui.md"]
  class docs_diagrams_archive_components_ui_md file
  docs_diagrams_archive --> docs_diagrams_archive_components_ui_md
  docs_diagrams_archive_data_conference_rosters_ACC_md["data.conference rosters.ACC.md"]
  class docs_diagrams_archive_data_conference_rosters_ACC_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_conference_rosters_ACC_md
  docs_diagrams_archive_data_conference_rosters_Big_12_2025_md["data.conference rosters.Big_12_2025.md"]
  class docs_diagrams_archive_data_conference_rosters_Big_12_2025_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_conference_rosters_Big_12_2025_md
  docs_diagrams_archive_data_conference_rosters_SEC_College_Football_md["data.conference rosters.SEC_College_Football.md"]
  class docs_diagrams_archive_data_conference_rosters_SEC_College_Football_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_conference_rosters_SEC_College_Football_md
  docs_diagrams_archive_data_conference_rosters_big_ten_rosters_md["data.conference rosters.big ten rosters.md"]
  class docs_diagrams_archive_data_conference_rosters_big_ten_rosters_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_conference_rosters_big_ten_rosters_md
  docs_diagrams_archive_data_conference_rosters_md["data.conference rosters.md"]
  class docs_diagrams_archive_data_conference_rosters_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_conference_rosters_md
  docs_diagrams_archive_data_market_efficiency_md["data.market.efficiency.md"]
  class docs_diagrams_archive_data_market_efficiency_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_market_efficiency_md
  docs_diagrams_archive_data_market_md["data.market.md"]
  class docs_diagrams_archive_data_market_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_market_md
  docs_diagrams_archive_data_market_mockdraft_md["data.market.mockdraft.md"]
  class docs_diagrams_archive_data_market_mockdraft_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_market_mockdraft_md
  docs_diagrams_archive_data_md["data.md"]
  class docs_diagrams_archive_data_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_md
  docs_diagrams_archive_data_player_depth_md["data.player.depth.md"]
  class docs_diagrams_archive_data_player_depth_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_player_depth_md
  docs_diagrams_archive_data_player_ea_md["data.player.ea.md"]
  class docs_diagrams_archive_data_player_ea_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_player_ea_md
  docs_diagrams_archive_data_player_md["data.player.md"]
  class docs_diagrams_archive_data_player_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_player_md
  docs_diagrams_archive_data_player_processed_md["data.player.processed.md"]
  class docs_diagrams_archive_data_player_processed_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_player_processed_md
  docs_diagrams_archive_data_player_raw_md["data.player.raw.md"]
  class docs_diagrams_archive_data_player_raw_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_player_raw_md
  docs_diagrams_archive_data_scripts_imports_md["data.scripts.imports.md"]
  class docs_diagrams_archive_data_scripts_imports_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_scripts_imports_md
  docs_diagrams_archive_data_scripts_ingestion_md["data.scripts.ingestion.md"]
  class docs_diagrams_archive_data_scripts_ingestion_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_scripts_ingestion_md
  docs_diagrams_archive_data_scripts_md["data.scripts.md"]
  class docs_diagrams_archive_data_scripts_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_scripts_md
  docs_diagrams_archive_data_scripts_testing_md["data.scripts.testing.md"]
  class docs_diagrams_archive_data_scripts_testing_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_scripts_testing_md
  docs_diagrams_archive_data_user_md["data.user.md"]
  class docs_diagrams_archive_data_user_md file
  docs_diagrams_archive --> docs_diagrams_archive_data_user_md
  docs_diagrams_archive_docs_adr_md["docs.adr.md"]
  class docs_diagrams_archive_docs_adr_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_adr_md
  docs_diagrams_archive_docs_diagrams_admin_tools_md["docs.diagrams.admin-tools.md"]
  class docs_diagrams_archive_docs_diagrams_admin_tools_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_diagrams_admin_tools_md
  docs_diagrams_archive_docs_diagrams_league_draft_md["docs.diagrams.league-draft.md"]
  class docs_diagrams_archive_docs_diagrams_league_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_diagrams_league_draft_md
  docs_diagrams_archive_docs_diagrams_md["docs.diagrams.md"]
  class docs_diagrams_archive_docs_diagrams_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_diagrams_md
  docs_diagrams_archive_docs_diagrams_projections_md["docs.diagrams.projections.md"]
  class docs_diagrams_archive_docs_diagrams_projections_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_diagrams_projections_md
  docs_diagrams_archive_docs_diagrams_system_architecture_md["docs.diagrams.system-architecture.md"]
  class docs_diagrams_archive_docs_diagrams_system_architecture_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_diagrams_system_architecture_md
  docs_diagrams_archive_docs_draft_md["docs.draft.md"]
  class docs_diagrams_archive_docs_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_draft_md
  docs_diagrams_archive_docs_guardrails_data_feeds_md["docs.guardrails.data-feeds.md"]
  class docs_diagrams_archive_docs_guardrails_data_feeds_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_guardrails_data_feeds_md
  docs_diagrams_archive_docs_guardrails_md["docs.guardrails.md"]
  class docs_diagrams_archive_docs_guardrails_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_guardrails_md
  docs_diagrams_archive_docs_guides_md["docs.guides.md"]
  class docs_diagrams_archive_docs_guides_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_guides_md
  docs_diagrams_archive_docs_md["docs.md"]
  class docs_diagrams_archive_docs_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_md
  docs_diagrams_archive_docs_reference_md["docs.reference.md"]
  class docs_diagrams_archive_docs_reference_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_reference_md
  docs_diagrams_archive_docs_runbooks_md["docs.runbooks.md"]
  class docs_diagrams_archive_docs_runbooks_md file
  docs_diagrams_archive --> docs_diagrams_archive_docs_runbooks_md
  docs_diagrams_archive_functions_appwrite_import_players_md["functions.appwrite.import-players.md"]
  class docs_diagrams_archive_functions_appwrite_import_players_md file
  docs_diagrams_archive --> docs_diagrams_archive_functions_appwrite_import_players_md
  docs_diagrams_archive_functions_appwrite_md["functions.appwrite.md"]
  class docs_diagrams_archive_functions_appwrite_md file
  docs_diagrams_archive --> docs_diagrams_archive_functions_appwrite_md
  docs_diagrams_archive_functions_appwrite_on_auction_close_md["functions.appwrite.on-auction-close.md"]
  class docs_diagrams_archive_functions_appwrite_on_auction_close_md file
  docs_diagrams_archive --> docs_diagrams_archive_functions_appwrite_on_auction_close_md
  docs_diagrams_archive_functions_cron_md["functions.cron.md"]
  class docs_diagrams_archive_functions_cron_md file
  docs_diagrams_archive --> docs_diagrams_archive_functions_cron_md
  docs_diagrams_archive_functions_md["functions.md"]
  class docs_diagrams_archive_functions_md file
  docs_diagrams_archive --> docs_diagrams_archive_functions_md
  docs_diagrams_archive_functions_workers_md["functions.workers.md"]
  class docs_diagrams_archive_functions_workers_md file
  docs_diagrams_archive --> docs_diagrams_archive_functions_workers_md
  docs_diagrams_archive_future_auction_drafts_md["future.auction-drafts.md"]
  class docs_diagrams_archive_future_auction_drafts_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_auction_drafts_md
  docs_diagrams_archive_future_compliance_md["future.compliance.md"]
  class docs_diagrams_archive_future_compliance_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_compliance_md
  docs_diagrams_archive_future_ideas_md["future.ideas.md"]
  class docs_diagrams_archive_future_ideas_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_ideas_md
  docs_diagrams_archive_future_marketing_md["future.marketing.md"]
  class docs_diagrams_archive_future_marketing_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_marketing_md
  docs_diagrams_archive_future_md["future.md"]
  class docs_diagrams_archive_future_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_md
  docs_diagrams_archive_future_scoring_api_cron_md["future.scoring.api-cron.md"]
  class docs_diagrams_archive_future_scoring_api_cron_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_scoring_api_cron_md
  docs_diagrams_archive_future_scoring_live_scoring_mechanics_md["future.scoring.live-scoring-mechanics.md"]
  class docs_diagrams_archive_future_scoring_live_scoring_mechanics_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_scoring_live_scoring_mechanics_md
  docs_diagrams_archive_future_scoring_md["future.scoring.md"]
  class docs_diagrams_archive_future_scoring_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_scoring_md
  docs_diagrams_archive_future_scoring_weekly_scoring_md["future.scoring.weekly-scoring.md"]
  class docs_diagrams_archive_future_scoring_weekly_scoring_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_scoring_weekly_scoring_md
  docs_diagrams_archive_future_trading_md["future.trading.md"]
  class docs_diagrams_archive_future_trading_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_trading_md
  docs_diagrams_archive_future_trading_trade_processor_md["future.trading.trade-processor.md"]
  class docs_diagrams_archive_future_trading_trade_processor_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_trading_trade_processor_md
  docs_diagrams_archive_future_waiver_md["future.waiver.md"]
  class docs_diagrams_archive_future_waiver_md file
  docs_diagrams_archive --> docs_diagrams_archive_future_waiver_md
  docs_diagrams_archive_league_draft["league-draft/"]
  class docs_diagrams_archive_league_draft folder
  docs_diagrams_archive --> docs_diagrams_archive_league_draft
  click docs_diagrams_archive_league_draft "/admin/project-map/docs/diagrams-archive/league-draft" "Open league-draft"
  docs_diagrams_archive_lib_api_md["lib.api.md"]
  class docs_diagrams_archive_lib_api_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_api_md
  docs_diagrams_archive_lib_clients_md["lib.clients.md"]
  class docs_diagrams_archive_lib_clients_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_clients_md
  docs_diagrams_archive_lib_config_config_md["lib.config.config.md"]
  class docs_diagrams_archive_lib_config_config_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_config_config_md
  docs_diagrams_archive_lib_config_md["lib.config.md"]
  class docs_diagrams_archive_lib_config_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_config_md
  docs_diagrams_archive_lib_data_sync_md["lib.data-sync.md"]
  class docs_diagrams_archive_lib_data_sync_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_data_sync_md
  docs_diagrams_archive_lib_db_md["lib.db.md"]
  class docs_diagrams_archive_lib_db_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_db_md
  docs_diagrams_archive_lib_domain_errors_md["lib.domain.errors.md"]
  class docs_diagrams_archive_lib_domain_errors_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_domain_errors_md
  docs_diagrams_archive_lib_domain_md["lib.domain.md"]
  class docs_diagrams_archive_lib_domain_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_domain_md
  docs_diagrams_archive_lib_domain_repositories_md["lib.domain.repositories.md"]
  class docs_diagrams_archive_lib_domain_repositories_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_domain_repositories_md
  docs_diagrams_archive_lib_domain_services_md["lib.domain.services.md"]
  class docs_diagrams_archive_lib_domain_services_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_domain_services_md
  docs_diagrams_archive_lib_domain_validation_md["lib.domain.validation.md"]
  class docs_diagrams_archive_lib_domain_validation_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_domain_validation_md
  docs_diagrams_archive_lib_draft_md["lib.draft.md"]
  class docs_diagrams_archive_lib_draft_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_draft_md
  docs_diagrams_archive_lib_generated_md["lib.generated.md"]
  class docs_diagrams_archive_lib_generated_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_generated_md
  docs_diagrams_archive_lib_hooks_md["lib.hooks.md"]
  class docs_diagrams_archive_lib_hooks_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_hooks_md
  docs_diagrams_archive_lib_md["lib.md"]
  class docs_diagrams_archive_lib_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_md
  docs_diagrams_archive_lib_middleware_md["lib.middleware.md"]
  class docs_diagrams_archive_lib_middleware_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_middleware_md
  docs_diagrams_archive_lib_realtime_md["lib.realtime.md"]
  class docs_diagrams_archive_lib_realtime_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_realtime_md
  docs_diagrams_archive_lib_repos_md["lib.repos.md"]
  class docs_diagrams_archive_lib_repos_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_repos_md
  docs_diagrams_archive_lib_repos_repositories_md["lib.repos.repositories.md"]
  class docs_diagrams_archive_lib_repos_repositories_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_repos_repositories_md
  docs_diagrams_archive_lib_rotowire_md["lib.rotowire.md"]
  class docs_diagrams_archive_lib_rotowire_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_rotowire_md
  docs_diagrams_archive_lib_services_md["lib.services.md"]
  class docs_diagrams_archive_lib_services_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_services_md
  docs_diagrams_archive_lib_theme_md["lib.theme.md"]
  class docs_diagrams_archive_lib_theme_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_theme_md
  docs_diagrams_archive_lib_types_md["lib.types.md"]
  class docs_diagrams_archive_lib_types_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_types_md
  docs_diagrams_archive_lib_utils_md["lib.utils.md"]
  class docs_diagrams_archive_lib_utils_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_utils_md
  docs_diagrams_archive_lib_utils_utils_md["lib.utils.utils.md"]
  class docs_diagrams_archive_lib_utils_utils_md file
  docs_diagrams_archive --> docs_diagrams_archive_lib_utils_utils_md
  docs_diagrams_archive_ops__archive_md["ops._archive.md"]
  class docs_diagrams_archive_ops__archive_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops__archive_md
  docs_diagrams_archive_ops_attic_core_remaining_md["ops.attic.core-remaining.md"]
  class docs_diagrams_archive_ops_attic_core_remaining_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_core_remaining_md
  docs_diagrams_archive_ops_attic_docs_archive_md["ops.attic.docs-archive.md"]
  class docs_diagrams_archive_ops_attic_docs_archive_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_docs_archive_md
  docs_diagrams_archive_ops_attic_evaluation_md["ops.attic.evaluation.md"]
  class docs_diagrams_archive_ops_attic_evaluation_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_evaluation_md
  docs_diagrams_archive_ops_attic_exports_md["ops.attic.exports.md"]
  class docs_diagrams_archive_ops_attic_exports_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_exports_md
  docs_diagrams_archive_ops_attic_md["ops.attic.md"]
  class docs_diagrams_archive_ops_attic_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_md
  docs_diagrams_archive_ops_attic_migration_scripts_md["ops.attic.migration-scripts.md"]
  class docs_diagrams_archive_ops_attic_migration_scripts_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_migration_scripts_md
  docs_diagrams_archive_ops_attic_old_schemas_md["ops.attic.old-schemas.md"]
  class docs_diagrams_archive_ops_attic_old_schemas_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_old_schemas_md
  docs_diagrams_archive_ops_attic_testing_and_release_md["ops.attic.testing-and-release.md"]
  class docs_diagrams_archive_ops_attic_testing_and_release_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_testing_and_release_md
  docs_diagrams_archive_ops_attic_tests_md["ops.attic.tests.md"]
  class docs_diagrams_archive_ops_attic_tests_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_tests_md
  docs_diagrams_archive_ops_attic_toolbox_md["ops.attic.toolbox.md"]
  class docs_diagrams_archive_ops_attic_toolbox_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_toolbox_md
  docs_diagrams_archive_ops_attic_types_md["ops.attic.types.md"]
  class docs_diagrams_archive_ops_attic_types_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_attic_types_md
  docs_diagrams_archive_ops_chatgpt_ops_appwrite_update_md["ops.chatgpt-ops.appwrite-update.md"]
  class docs_diagrams_archive_ops_chatgpt_ops_appwrite_update_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_ops_appwrite_update_md
  docs_diagrams_archive_ops_chatgpt_ops_edit_md["ops.chatgpt-ops.edit.md"]
  class docs_diagrams_archive_ops_chatgpt_ops_edit_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_ops_edit_md
  docs_diagrams_archive_ops_chatgpt_ops_md["ops.chatgpt-ops.md"]
  class docs_diagrams_archive_ops_chatgpt_ops_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_ops_md
  docs_diagrams_archive_ops_chatgpt_ops_review_md["ops.chatgpt-ops.review.md"]
  class docs_diagrams_archive_ops_chatgpt_ops_review_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_ops_review_md
  docs_diagrams_archive_ops_chatgpt_ops_sync_md["ops.chatgpt-ops.sync.md"]
  class docs_diagrams_archive_ops_chatgpt_ops_sync_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_ops_sync_md
  docs_diagrams_archive_ops_chatgpt_ops_test_md["ops.chatgpt-ops.test.md"]
  class docs_diagrams_archive_ops_chatgpt_ops_test_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_ops_test_md
  docs_diagrams_archive_ops_chatgpt_md["ops.chatgpt.md"]
  class docs_diagrams_archive_ops_chatgpt_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_chatgpt_md
  docs_diagrams_archive_ops_claude_ops_appwrite_update_md["ops.claude-ops.appwrite-update.md"]
  class docs_diagrams_archive_ops_claude_ops_appwrite_update_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_ops_appwrite_update_md
  docs_diagrams_archive_ops_claude_ops_edit_md["ops.claude-ops.edit.md"]
  class docs_diagrams_archive_ops_claude_ops_edit_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_ops_edit_md
  docs_diagrams_archive_ops_claude_ops_md["ops.claude-ops.md"]
  class docs_diagrams_archive_ops_claude_ops_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_ops_md
  docs_diagrams_archive_ops_claude_ops_review_md["ops.claude-ops.review.md"]
  class docs_diagrams_archive_ops_claude_ops_review_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_ops_review_md
  docs_diagrams_archive_ops_claude_ops_sync_md["ops.claude-ops.sync.md"]
  class docs_diagrams_archive_ops_claude_ops_sync_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_ops_sync_md
  docs_diagrams_archive_ops_claude_ops_test_md["ops.claude-ops.test.md"]
  class docs_diagrams_archive_ops_claude_ops_test_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_ops_test_md
  docs_diagrams_archive_ops_claude_md["ops.claude.md"]
  class docs_diagrams_archive_ops_claude_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_claude_md
  docs_diagrams_archive_ops_common_appwrite_update_md["ops.common.appwrite-update.md"]
  class docs_diagrams_archive_ops_common_appwrite_update_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_appwrite_update_md
  docs_diagrams_archive_ops_common_codemods_md["ops.common.codemods.md"]
  class docs_diagrams_archive_ops_common_codemods_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_codemods_md
  docs_diagrams_archive_ops_common_functions_md["ops.common.functions.md"]
  class docs_diagrams_archive_ops_common_functions_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_functions_md
  docs_diagrams_archive_ops_common_guards_md["ops.common.guards.md"]
  class docs_diagrams_archive_ops_common_guards_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_guards_md
  docs_diagrams_archive_ops_common_md["ops.common.md"]
  class docs_diagrams_archive_ops_common_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_md
  docs_diagrams_archive_ops_common_prompts_md["ops.common.prompts.md"]
  class docs_diagrams_archive_ops_common_prompts_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_prompts_md
  docs_diagrams_archive_ops_common_public_md["ops.common.public.md"]
  class docs_diagrams_archive_ops_common_public_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_public_md
  docs_diagrams_archive_ops_common_python_md["ops.common.python.md"]
  class docs_diagrams_archive_ops_common_python_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_python_md
  docs_diagrams_archive_ops_common_scripts_md["ops.common.scripts.md"]
  class docs_diagrams_archive_ops_common_scripts_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_scripts_md
  docs_diagrams_archive_ops_common_test_md["ops.common.test.md"]
  class docs_diagrams_archive_ops_common_test_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_common_test_md
  docs_diagrams_archive_ops_config_md["ops.config.md"]
  class docs_diagrams_archive_ops_config_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_config_md
  docs_diagrams_archive_ops_cursor_ops_appwrite_update_md["ops.cursor-ops.appwrite-update.md"]
  class docs_diagrams_archive_ops_cursor_ops_appwrite_update_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_ops_appwrite_update_md
  docs_diagrams_archive_ops_cursor_ops_md["ops.cursor-ops.md"]
  class docs_diagrams_archive_ops_cursor_ops_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_ops_md
  docs_diagrams_archive_ops_cursor_ops_review_md["ops.cursor-ops.review.md"]
  class docs_diagrams_archive_ops_cursor_ops_review_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_ops_review_md
  docs_diagrams_archive_ops_cursor_ops_sync_md["ops.cursor-ops.sync.md"]
  class docs_diagrams_archive_ops_cursor_ops_sync_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_ops_sync_md
  docs_diagrams_archive_ops_cursor_ops_test_md["ops.cursor-ops.test.md"]
  class docs_diagrams_archive_ops_cursor_ops_test_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_ops_test_md
  docs_diagrams_archive_ops_cursor_context_packs_md["ops.cursor.context-packs.md"]
  class docs_diagrams_archive_ops_cursor_context_packs_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_context_packs_md
  docs_diagrams_archive_ops_cursor_md["ops.cursor.md"]
  class docs_diagrams_archive_ops_cursor_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_md
  docs_diagrams_archive_ops_cursor_screenshot_md["ops.cursor.screenshot.md"]
  class docs_diagrams_archive_ops_cursor_screenshot_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_cursor_screenshot_md
  docs_diagrams_archive_ops_db_md["ops.db.md"]
  class docs_diagrams_archive_ops_db_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_db_md
  docs_diagrams_archive_ops_md["ops.md"]
  class docs_diagrams_archive_ops_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_md
  docs_diagrams_archive_ops_out_md["ops.out.md"]
  class docs_diagrams_archive_ops_out_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_out_md
  docs_diagrams_archive_ops_out_snapshots_md["ops.out.snapshots.md"]
  class docs_diagrams_archive_ops_out_snapshots_md file
  docs_diagrams_archive --> docs_diagrams_archive_ops_out_snapshots_md
  docs_diagrams_archive_projections["projections/"]
  class docs_diagrams_archive_projections folder
  docs_diagrams_archive --> docs_diagrams_archive_projections
  click docs_diagrams_archive_projections "/admin/project-map/docs/diagrams-archive/projections" "Open projections"
  docs_diagrams_archive_public_md["public.md"]
  class docs_diagrams_archive_public_md file
  docs_diagrams_archive --> docs_diagrams_archive_public_md
  docs_diagrams_archive_schema_generators_md["schema.generators.md"]
  class docs_diagrams_archive_schema_generators_md file
  docs_diagrams_archive --> docs_diagrams_archive_schema_generators_md
  docs_diagrams_archive_schema_md["schema.md"]
  class docs_diagrams_archive_schema_md file
  docs_diagrams_archive --> docs_diagrams_archive_schema_md
  docs_diagrams_archive_schema_sites_college_football_fantasy_app_md["schema.sites.college-football-fantasy-app.md"]
  class docs_diagrams_archive_schema_sites_college_football_fantasy_app_md file
  docs_diagrams_archive --> docs_diagrams_archive_schema_sites_college_football_fantasy_app_md
  docs_diagrams_archive_schema_sites_md["schema.sites.md"]
  class docs_diagrams_archive_schema_sites_md file
  docs_diagrams_archive --> docs_diagrams_archive_schema_sites_md
  docs_diagrams_archive_schema_snapshots_md["schema.snapshots.md"]
  class docs_diagrams_archive_schema_snapshots_md file
  docs_diagrams_archive --> docs_diagrams_archive_schema_snapshots_md
  docs_diagrams_archive_schema_zod_md["schema.zod.md"]
  class docs_diagrams_archive_schema_zod_md file
  docs_diagrams_archive --> docs_diagrams_archive_schema_zod_md
```
