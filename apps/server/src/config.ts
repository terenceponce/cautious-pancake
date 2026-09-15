import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SALE_START: z.coerce.date(),
  SALE_END: z.coerce.date(),
  STOCK: z.coerce.number().int().positive(),
  STORE: z.enum(['memory', 'redis']).default('memory'),
  REDIS_URL: z.string().min(1).optional(),
})

export type Config = z.infer<typeof schema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = schema.safeParse(env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new Error(`Invalid configuration — ${issues}`)
  }
  const config = result.data
  if (config.SALE_START >= config.SALE_END) {
    throw new Error('Invalid configuration — SALE_START must be before SALE_END')
  }
  if (config.STORE === 'redis' && !config.REDIS_URL) {
    throw new Error('Invalid configuration — REDIS_URL is required when STORE=redis')
  }
  return config
}
