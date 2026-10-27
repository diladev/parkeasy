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

/** POST /user/local/verify-otp: the short-lived token that allows step 3. */
export const verifyOtpResponseSchema = z.object({
  message: z.string(),
  token: z.string().min(1),
})

/**
 * The server's own minimum, unless PASSWORD_MIN_LENGTH changes it there. The
 * other rules (cases, digit, symbol) are left to the server, whose message
 * then says exactly what is missing.
 */
export const PASSWORD_MIN_LENGTH = 8

/** Forgot password, step 1. */
export function createResetEmailSchema(messages: { emailInvalid: string }) {
  return z.object({
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: messages.emailInvalid })),
  })
}
export type ResetEmailValues = z.infer<ReturnType<typeof createResetEmailSchema>>

/** Forgot password, step 2: the 6 digits from the email. */
export function createResetCodeSchema(messages: { code: string }) {
  return z.object({
    // People paste "123 456" from the email: spaces don't count.
    code: z
      .string()
      .transform((value) => value.replace(/\s/g, ''))
      .pipe(z.string().regex(/^\d{6}$/, { error: messages.code })),
  })
}
export type ResetCodeValues = z.infer<ReturnType<typeof createResetCodeSchema>>

/** Forgot password, step 3. */
export function createNewPasswordSchema(messages: { tooShort: string; mismatch: string }) {
  return z
    .object({
      password: z.string().min(PASSWORD_MIN_LENGTH, { error: messages.tooShort }),
      confirm: z.string(),
    })
    .refine((values) => values.password === values.confirm, {
      error: messages.mismatch,
      path: ['confirm'],
    })
}
export type NewPasswordValues = z.infer<ReturnType<typeof createNewPasswordSchema>>
