# Project Map — ops/common/scripts

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_common_scripts["ops/common/scripts/" ]
  class ops_common_scripts folder
  ops_common_scripts_activate_pipeline_simple_ts["activate-pipeline-simple.ts"]
  class ops_common_scripts_activate_pipeline_simple_ts file
  ops_common_scripts --> ops_common_scripts_activate_pipeline_simple_ts
  ops_common_scripts_activate_pipeline_ts["activate-pipeline.ts"]
  class ops_common_scripts_activate_pipeline_ts file
  ops_common_scripts --> ops_common_scripts_activate_pipeline_ts
  ops_common_scripts_add_notre_dame_complete_ts["add-notre-dame-complete.ts"]
  class ops_common_scripts_add_notre_dame_complete_ts file
  ops_common_scripts --> ops_common_scripts_add_notre_dame_complete_ts
  ops_common_scripts_add_vercel_env_sh["add-vercel-env.sh"]
  class ops_common_scripts_add_vercel_env_sh file
  ops_common_scripts --> ops_common_scripts_add_vercel_env_sh
  ops_common_scripts_align_env_variables_ts["align-env-variables.ts"]
  class ops_common_scripts_align_env_variables_ts file
  ops_common_scripts --> ops_common_scripts_align_env_variables_ts
  ops_common_scripts_appwrite["appwrite/"]
  class ops_common_scripts_appwrite folder
  ops_common_scripts --> ops_common_scripts_appwrite
  ops_common_scripts_appwrite_enhancements_ts["appwrite-enhancements.ts"]
  class ops_common_scripts_appwrite_enhancements_ts file
  ops_common_scripts --> ops_common_scripts_appwrite_enhancements_ts
  ops_common_scripts_appwrite_user_enhancements_ts["appwrite-user-enhancements.ts"]
  class ops_common_scripts_appwrite_user_enhancements_ts file
  ops_common_scripts --> ops_common_scripts_appwrite_user_enhancements_ts
  ops_common_scripts_audit_projection_errors_ts["audit-projection-errors.ts"]
  class ops_common_scripts_audit_projection_errors_ts file
  ops_common_scripts --> ops_common_scripts_audit_projection_errors_ts
  ops_common_scripts_build_skill_positions_csv_py["build_skill_positions_csv.py"]
  class ops_common_scripts_build_skill_positions_csv_py file
  ops_common_scripts --> ops_common_scripts_build_skill_positions_csv_py
  ops_common_scripts_bulk_update_all_projections_ts["bulk-update-all-projections.ts"]
  class ops_common_scripts_bulk_update_all_projections_ts file
  ops_common_scripts --> ops_common_scripts_bulk_update_all_projections_ts
  ops_common_scripts_check_actual_schema_ts["check-actual-schema.ts"]
  class ops_common_scripts_check_actual_schema_ts file
  ops_common_scripts --> ops_common_scripts_check_actual_schema_ts
  ops_common_scripts_check_collections_structure_ts["check-collections-structure.ts"]
  class ops_common_scripts_check_collections_structure_ts file
  ops_common_scripts --> ops_common_scripts_check_collections_structure_ts
  ops_common_scripts_check_file_versions_ts["check-file-versions.ts"]
  class ops_common_scripts_check_file_versions_ts file
  ops_common_scripts --> ops_common_scripts_check_file_versions_ts
  ops_common_scripts_check_league_details_ts["check-league-details.ts"]
  class ops_common_scripts_check_league_details_ts file
  ops_common_scripts --> ops_common_scripts_check_league_details_ts
  ops_common_scripts_check_league_schema_ts["check-league-schema.ts"]
  class ops_common_scripts_check_league_schema_ts file
  ops_common_scripts --> ops_common_scripts_check_league_schema_ts
  ops_common_scripts_check_player_projections_ts["check-player-projections.ts"]
  class ops_common_scripts_check_player_projections_ts file
  ops_common_scripts --> ops_common_scripts_check_player_projections_ts
  ops_common_scripts_check_user_roster_ts["check-user-roster.ts"]
  class ops_common_scripts_check_user_roster_ts file
  ops_common_scripts --> ops_common_scripts_check_user_roster_ts
  ops_common_scripts_cleanup_draft_pool_ts["cleanup-draft-pool.ts"]
  class ops_common_scripts_cleanup_draft_pool_ts file
  ops_common_scripts --> ops_common_scripts_cleanup_draft_pool_ts
  ops_common_scripts_cleanup_redundant_attributes_ts["cleanup-redundant-attributes.ts"]
  class ops_common_scripts_cleanup_redundant_attributes_ts file
  ops_common_scripts --> ops_common_scripts_cleanup_redundant_attributes_ts
  ops_common_scripts_compress_players_for_prompt_ts["compress-players-for-prompt.ts"]
  class ops_common_scripts_compress_players_for_prompt_ts file
  ops_common_scripts --> ops_common_scripts_compress_players_for_prompt_ts
  ops_common_scripts_configure_oauth_providers_ts["configure-oauth-providers.ts"]
  class ops_common_scripts_configure_oauth_providers_ts file
  ops_common_scripts --> ops_common_scripts_configure_oauth_providers_ts
  ops_common_scripts_consolidate_commissioner_fields_ts["consolidate-commissioner-fields.ts"]
  class ops_common_scripts_consolidate_commissioner_fields_ts file
  ops_common_scripts --> ops_common_scripts_consolidate_commissioner_fields_ts
  ops_common_scripts_convert_pdfs_sh["convert_pdfs.sh"]
  class ops_common_scripts_convert_pdfs_sh file
  ops_common_scripts --> ops_common_scripts_convert_pdfs_sh
  ops_common_scripts_copy_docs_js["copy-docs.js"]
  class ops_common_scripts_copy_docs_js file
  ops_common_scripts --> ops_common_scripts_copy_docs_js
  ops_common_scripts_count_all_players_ts["count-all-players.ts"]
  class ops_common_scripts_count_all_players_ts file
  ops_common_scripts --> ops_common_scripts_count_all_players_ts
  ops_common_scripts_data_sourcing["data-sourcing/"]
  class ops_common_scripts_data_sourcing folder
  ops_common_scripts --> ops_common_scripts_data_sourcing
  ops_common_scripts_ensure_new_appwrite_collections_ts["ensure-new-appwrite-collections.ts"]
  class ops_common_scripts_ensure_new_appwrite_collections_ts file
  ops_common_scripts --> ops_common_scripts_ensure_new_appwrite_collections_ts
  ops_common_scripts_eval_proj_ts["eval_proj.ts"]
  class ops_common_scripts_eval_proj_ts file
  ops_common_scripts --> ops_common_scripts_eval_proj_ts
  ops_common_scripts_export_college_players_json_ts["export-college-players-json.ts"]
  class ops_common_scripts_export_college_players_json_ts file
  ops_common_scripts --> ops_common_scripts_export_college_players_json_ts
  ops_common_scripts_export_college_players_ts["export-college-players.ts"]
  class ops_common_scripts_export_college_players_ts file
  ops_common_scripts --> ops_common_scripts_export_college_players_ts
  ops_common_scripts_export_complete_database_ts["export-complete-database.ts"]
  class ops_common_scripts_export_complete_database_ts file
  ops_common_scripts --> ops_common_scripts_export_complete_database_ts
  ops_common_scripts_extract_active_rosters_py["extract-active-rosters.py"]
  class ops_common_scripts_extract_active_rosters_py file
  ops_common_scripts --> ops_common_scripts_extract_active_rosters_py
  ops_common_scripts_ffmpeg_helpers_js["ffmpeg-helpers.js"]
  class ops_common_scripts_ffmpeg_helpers_js file
  ops_common_scripts --> ops_common_scripts_ffmpeg_helpers_js
  ops_common_scripts_figma_sync_js["figma-sync.js"]
  class ops_common_scripts_figma_sync_js file
  ops_common_scripts --> ops_common_scripts_figma_sync_js
  ops_common_scripts_find_user_teams_ts["find-user-teams.ts"]
  class ops_common_scripts_find_user_teams_ts file
  ops_common_scripts --> ops_common_scripts_find_user_teams_ts
  ops_common_scripts_fix_depth_chart_projections_ts["fix-depth-chart-projections.ts"]
  class ops_common_scripts_fix_depth_chart_projections_ts file
  ops_common_scripts --> ops_common_scripts_fix_depth_chart_projections_ts
  ops_common_scripts_fix_draftable_players_ts["fix-draftable-players.ts"]
  class ops_common_scripts_fix_draftable_players_ts file
  ops_common_scripts --> ops_common_scripts_fix_draftable_players_ts
  ops_common_scripts_fix_model_inputs_attributes_ts["fix-model-inputs-attributes.ts"]
  class ops_common_scripts_fix_model_inputs_attributes_ts file
  ops_common_scripts --> ops_common_scripts_fix_model_inputs_attributes_ts
  ops_common_scripts_generate_icons_js["generate-icons.js"]
  class ops_common_scripts_generate_icons_js file
  ops_common_scripts --> ops_common_scripts_generate_icons_js
  ops_common_scripts_generate_project_map_diagrams_ts["generate-project-map-diagrams.ts"]
  class ops_common_scripts_generate_project_map_diagrams_ts file
  ops_common_scripts --> ops_common_scripts_generate_project_map_diagrams_ts
  ops_common_scripts_generate_pwa_icons_js["generate-pwa-icons.js"]
  class ops_common_scripts_generate_pwa_icons_js file
  ops_common_scripts --> ops_common_scripts_generate_pwa_icons_js
  ops_common_scripts_generate_schema_docs_ts["generate-schema-docs.ts"]
  class ops_common_scripts_generate_schema_docs_ts file
  ops_common_scripts --> ops_common_scripts_generate_schema_docs_ts
  ops_common_scripts_guardrails["guardrails/"]
  class ops_common_scripts_guardrails folder
  ops_common_scripts --> ops_common_scripts_guardrails
  ops_common_scripts_ingestDepthChart_ts["ingestDepthChart.ts"]
  class ops_common_scripts_ingestDepthChart_ts file
  ops_common_scripts --> ops_common_scripts_ingestDepthChart_ts
  ops_common_scripts_ingestDepthCharts_ts["ingestDepthCharts.ts"]
  class ops_common_scripts_ingestDepthCharts_ts file
  ops_common_scripts --> ops_common_scripts_ingestDepthCharts_ts
  ops_common_scripts_ingestEA_ts["ingestEA.ts"]
  class ops_common_scripts_ingestEA_ts file
  ops_common_scripts --> ops_common_scripts_ingestEA_ts
  ops_common_scripts_ingestMockDraft_ts["ingestMockDraft.ts"]
  class ops_common_scripts_ingestMockDraft_ts file
  ops_common_scripts --> ops_common_scripts_ingestMockDraft_ts
  ops_common_scripts_ingestTeamEfficiency_ts["ingestTeamEfficiency.ts"]
  class ops_common_scripts_ingestTeamEfficiency_ts file
  ops_common_scripts --> ops_common_scripts_ingestTeamEfficiency_ts
  ops_common_scripts_list_all_collections_ts["list-all-collections.ts"]
  class ops_common_scripts_list_all_collections_ts file
  ops_common_scripts --> ops_common_scripts_list_all_collections_ts
  ops_common_scripts_list_appwrite_collections_ts["list-appwrite-collections.ts"]
  class ops_common_scripts_list_appwrite_collections_ts file
  ops_common_scripts --> ops_common_scripts_list_appwrite_collections_ts
  ops_common_scripts_migrate_v2_ts["migrate-v2.ts"]
  class ops_common_scripts_migrate_v2_ts file
  ops_common_scripts --> ops_common_scripts_migrate_v2_ts
  ops_common_scripts_migrations["migrations/"]
  class ops_common_scripts_migrations folder
  ops_common_scripts --> ops_common_scripts_migrations
  ops_common_scripts_mock_draft["mock-draft/"]
  class ops_common_scripts_mock_draft folder
  ops_common_scripts --> ops_common_scripts_mock_draft
  ops_common_scripts_normalize_depth_charts_ts["normalize-depth-charts.ts"]
  class ops_common_scripts_normalize_depth_charts_ts file
  ops_common_scripts --> ops_common_scripts_normalize_depth_charts_ts
  ops_common_scripts_normalize_ea_ratings_ts["normalize-ea-ratings.ts"]
  class ops_common_scripts_normalize_ea_ratings_ts file
  ops_common_scripts --> ops_common_scripts_normalize_ea_ratings_ts
  ops_common_scripts_open_latest_context_ts["open-latest-context.ts"]
  class ops_common_scripts_open_latest_context_ts file
  ops_common_scripts --> ops_common_scripts_open_latest_context_ts
  ops_common_scripts_populate_model_inputs_ts["populate-model-inputs.ts"]
  class ops_common_scripts_populate_model_inputs_ts file
  ops_common_scripts --> ops_common_scripts_populate_model_inputs_ts
  ops_common_scripts_purge_college_players_ts["purge-college-players.ts"]
  class ops_common_scripts_purge_college_players_ts file
  ops_common_scripts --> ops_common_scripts_purge_college_players_ts
  ops_common_scripts_quick_start_sh["quick-start.sh"]
  class ops_common_scripts_quick_start_sh file
  ops_common_scripts --> ops_common_scripts_quick_start_sh
  ops_common_scripts_remove_unused_attributes_ts["remove-unused-attributes.ts"]
  class ops_common_scripts_remove_unused_attributes_ts file
  ops_common_scripts --> ops_common_scripts_remove_unused_attributes_ts
  ops_common_scripts_run_data_ingestion_ts["run-data-ingestion.ts"]
  class ops_common_scripts_run_data_ingestion_ts file
  ops_common_scripts --> ops_common_scripts_run_data_ingestion_ts
  ops_common_scripts_run_migrations_ts["run-migrations.ts"]
  class ops_common_scripts_run_migrations_ts file
  ops_common_scripts --> ops_common_scripts_run_migrations_ts
  ops_common_scripts_seed_meshy_templates_ts["seed-meshy-templates.ts"]
  class ops_common_scripts_seed_meshy_templates_ts file
  ops_common_scripts --> ops_common_scripts_seed_meshy_templates_ts
  ops_common_scripts_seed_ts["seed.ts"]
  class ops_common_scripts_seed_ts file
  ops_common_scripts --> ops_common_scripts_seed_ts
  ops_common_scripts_setup_appwrite_webhook_js["setup-appwrite-webhook.js"]
  class ops_common_scripts_setup_appwrite_webhook_js file
  ops_common_scripts --> ops_common_scripts_setup_appwrite_webhook_js
  ops_common_scripts_setup_vercel_env_sh["setup-vercel-env.sh"]
  class ops_common_scripts_setup_vercel_env_sh file
  ops_common_scripts --> ops_common_scripts_setup_vercel_env_sh
  ops_common_scripts_sync_appwrite_simple_ts["sync-appwrite-simple.ts"]
  class ops_common_scripts_sync_appwrite_simple_ts file
  ops_common_scripts --> ops_common_scripts_sync_appwrite_simple_ts
  ops_common_scripts_sync_college_players_from_csv_ts["sync-college-players-from-csv.ts"]
  class ops_common_scripts_sync_college_players_from_csv_ts file
  ops_common_scripts --> ops_common_scripts_sync_college_players_from_csv_ts
  ops_common_scripts_sync_enhanced_projections_ts["sync-enhanced-projections.ts"]
  class ops_common_scripts_sync_enhanced_projections_ts file
  ops_common_scripts --> ops_common_scripts_sync_enhanced_projections_ts
  ops_common_scripts_test_data["test-data/"]
  class ops_common_scripts_test_data folder
  ops_common_scripts --> ops_common_scripts_test_data
  ops_common_scripts_test_draft_button_window_ts["test-draft-button-window.ts"]
  class ops_common_scripts_test_draft_button_window_ts file
  ops_common_scripts --> ops_common_scripts_test_draft_button_window_ts
  ops_common_scripts_test_e2e_js["test-e2e.js"]
  class ops_common_scripts_test_e2e_js file
  ops_common_scripts --> ops_common_scripts_test_e2e_js
  ops_common_scripts_test_evaluation_system_ts["test-evaluation-system.ts"]
  class ops_common_scripts_test_evaluation_system_ts file
  ops_common_scripts --> ops_common_scripts_test_evaluation_system_ts
  ops_common_scripts_test_oauth_config_ts["test-oauth-config.ts"]
  class ops_common_scripts_test_oauth_config_ts file
  ops_common_scripts --> ops_common_scripts_test_oauth_config_ts
  ops_common_scripts_test_variable_teams_ts["test-variable-teams.ts"]
  class ops_common_scripts_test_variable_teams_ts file
  ops_common_scripts --> ops_common_scripts_test_variable_teams_ts
  ops_common_scripts_toolbox_cli_src["toolbox-cli-src/"]
  class ops_common_scripts_toolbox_cli_src folder
  ops_common_scripts --> ops_common_scripts_toolbox_cli_src
  ops_common_scripts_toolbox_clients_src["toolbox-clients-src/"]
  class ops_common_scripts_toolbox_clients_src folder
  ops_common_scripts --> ops_common_scripts_toolbox_clients_src
  ops_common_scripts_validate_current_schema_ts["validate-current-schema.ts"]
  class ops_common_scripts_validate_current_schema_ts file
  ops_common_scripts --> ops_common_scripts_validate_current_schema_ts
  ops_common_scripts_validate_schema_compliance_ts["validate-schema-compliance.ts"]
  class ops_common_scripts_validate_schema_compliance_ts file
  ops_common_scripts --> ops_common_scripts_validate_schema_compliance_ts
  ops_common_scripts_verify_current_data_ts["verify-current-data.ts"]
  class ops_common_scripts_verify_current_data_ts file
  ops_common_scripts --> ops_common_scripts_verify_current_data_ts
  ops_common_scripts_verify_data_flow_alignment_ts["verify-data-flow-alignment.ts"]
  class ops_common_scripts_verify_data_flow_alignment_ts file
  ops_common_scripts --> ops_common_scripts_verify_data_flow_alignment_ts
  ops_common_scripts_verify_saved_settings_ts["verify-saved-settings.ts"]
  class ops_common_scripts_verify_saved_settings_ts file
  ops_common_scripts --> ops_common_scripts_verify_saved_settings_ts
  ops_common_scripts_verify_week3_games_ts["verify-week3-games.ts"]
  class ops_common_scripts_verify_week3_games_ts file
  ops_common_scripts --> ops_common_scripts_verify_week3_games_ts
  ops_common_scripts_verify_week4_games_ts["verify-week4-games.ts"]
  class ops_common_scripts_verify_week4_games_ts file
  ops_common_scripts --> ops_common_scripts_verify_week4_games_ts
  ops_common_scripts_verify_week5_games_ts["verify-week5-games.ts"]
  class ops_common_scripts_verify_week5_games_ts file
  ops_common_scripts --> ops_common_scripts_verify_week5_games_ts
  ops_common_scripts_video_workflow_js["video-workflow.js"]
  class ops_common_scripts_video_workflow_js file
  ops_common_scripts --> ops_common_scripts_video_workflow_js
```
