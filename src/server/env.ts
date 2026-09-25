import { env } from 'cloudflare:workers'
import { z } from 'zod'

const schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(10).optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  PUBLIC_SITE_URL: z.string().url().default('https://dinotoys.hu'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  DINOTOYS_FEED_URL: z.string().url().optional(),
  DINOTOYS_FEED_USERNAME: z.string().optional(),
  DINOTOYS_FEED_PASSWORD: z.string().optional(),
})

export type ServerEnv = z.infer<typeof schema>

export function getServerEnv(): ServerEnv {
  const runtime = env as unknown as Record<string, string | undefined>
  return schema.parse(runtime)
}

export function getOptionalServerEnv() {
  const runtime = env as unknown as Record<string, string | undefined>
  return {
    supabaseUrl: runtime.SUPABASE_URL,
    serviceRoleKey: runtime.SUPABASE_SERVICE_ROLE_KEY,
    publishableKey: runtime.SUPABASE_PUBLISHABLE_KEY,
    bootstrapEmail: runtime.ADMIN_BOOTSTRAP_EMAIL,
  }
}
