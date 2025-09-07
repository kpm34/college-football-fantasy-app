import { z } from 'zod'

const lucidEnvSchema = z.object({
  LUCID_CLIENT_ID: z.string().min(1, 'LUCID_CLIENT_ID required'),
  LUCID_CLIENT_SECRET: z.string().min(1, 'LUCID_CLIENT_SECRET required'),
  LUCID_REDIRECT_URI: z.string().url('LUCID_REDIRECT_URI must be a valid URL'),
})

export function getLucidConfig() {
  const parsed = lucidEnvSchema.safeParse({
    LUCID_CLIENT_ID: process.env.LUCID_CLIENT_ID,
    LUCID_CLIENT_SECRET: process.env.LUCID_CLIENT_SECRET,
    LUCID_REDIRECT_URI: process.env.LUCID_REDIRECT_URI,
  })
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    throw new Error(`Lucid config error: ${first?.message || 'invalid env'}`)
  }
  return parsed.data
}


