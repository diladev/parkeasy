import type { Router } from 'vue-router'

/**
 * Where to go after signing in. `raw` comes from the URL (?redirect=...), so an
 * attacker controls it: only same-origin paths that match a real, non-guest
 * route are accepted. `//evil.com`, `/\evil.com`, `https://evil.com` and
 * `javascript:` all fall back.
 */
export function safeRedirect(router: Router, raw: unknown, fallback: string): string {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return fallback
  // Browsers drop tabs and newlines in URLs, so "/\n/evil.com" would become "//evil.com".
  const hasControlCharacters = [...raw].some((char) => char.charCodeAt(0) < 0x20)
  if (raw.startsWith('/\\') || hasControlCharacters) return fallback

  try {
    const url = new URL(raw, window.location.origin)
    if (url.origin !== window.location.origin) return fallback
    const resolved = router.resolve(url.pathname + url.search + url.hash)
    const isUsable =
      resolved.matched.length > 0 &&
      resolved.name !== 'not-found' &&
      // Never "redirect" back to the sign-in page itself.
      !resolved.matched.some((record) => record.meta.guestOnly)
    return isUsable ? resolved.fullPath : fallback
  } catch {
    return fallback
  }
}
