import { z } from 'zod'

/**
 * The only place that reads import.meta.env. Everything with a VITE_ prefix is
 * public (it is built into the JavaScript bundle), so nothing secret goes here.
 */
const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .regex(/^(\/|https?:\/\/)/, 'must be a path such as /api or an http(s) URL')
    .default('/api'),
  VITE_APP_NAME: z.string().min(1).default('ParkEasy'),
})

export interface AppEnv {
  readonly API_URL: string
  readonly APP_NAME: string
  readonly IS_DEV: boolean
}

export function parseEnv(raw: Record<string, unknown>): AppEnv {
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) {
    // Fail at startup, not later with requests to "undefined/user/local/login".
    throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`)
  }
  return Object.freeze({
    API_URL: parsed.data.VITE_API_URL.replace(/\/+$/, ''),
    APP_NAME: parsed.data.VITE_APP_NAME,
    IS_DEV: raw.DEV === true,
  })
}

export const env = parseEnv(import.meta.env)
