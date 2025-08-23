import { z } from 'zod';

export const modelRunsSchema = z.object({
  id: z.string(),
  run_id: z.string().uuid(),
  model_version: z.string(),
  season: z.number().int(),
  week: z.number().int().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  
  // Embedded data from old tables
  inputs_json: z.string(), // JSON string of model inputs
  metrics_json: z.string().optional(), // JSON string of run metrics
  
  started_at: z.string().datetime(),
  finished_at: z.string().datetime().optional(),
  error_message: z.string().optional(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type ModelRun = z.infer<typeof modelRunsSchema>;
