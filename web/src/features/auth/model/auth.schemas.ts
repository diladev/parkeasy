import { z } from 'zod'

/*
 * Hand-written to match backend/src/auth/types/auth.types.ts (OpenAPI code
 * generation is postponed). Parsing at runtime means a backend change shows up
 * as a clear error instead of `undefined` deep in a component.
 */

/** POST /user/local/login and /refresh. The refresh token itself is in the httpOnly cookie. */
export const sessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresIn: z.number(),
})
export type SessionResponse = z.infer<typeof sessionResponseSchema>

/** GET /user/local/me: the server's word on who is signed in and what they may do. */
export const meResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  role: z.string(),
  permissions: z.array(z.string()),
})
export type MeResponse = z.infer<typeof meResponseSchema>

export const messageResponseSchema = z.object({ message: z.string() })

/** The sign-in form. Messages are passed in so they follow the current language. */
export function createLoginFormSchema(messages: {
  emailInvalid: string
  passwordRequired: string
}) {
  return z.object({
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: messages.emailInvalid })),
    password: z.string().min(1, { error: messages.passwordRequired }),
  })
}
export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>
