const FIRST_STRONG_ISOLATE = '⁨'
const POP_DIRECTIONAL_ISOLATE = '⁩'

/**
 * Wraps user data (a name, an email) placed inside translated text so it keeps
 * its own direction. Without it "Dilan K." shows as ".Dilan K" in a Kurdish
 * (right-to-left) sentence. In markup, prefer <bdi> or dir="auto".
 */
export function isolate(text: string): string {
  return `${FIRST_STRONG_ISOLATE}${text}${POP_DIRECTIONAL_ISOLATE}`
}
