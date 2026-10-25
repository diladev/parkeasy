/**
 * Tells every open tab (this one included) that the session ended, so a sign
 * out in one tab signs out the others, and an expired session in any tab sends
 * the user back to the sign-in page.
 */
export type LogoutReason = 'signed-out' | 'expired'

interface LoggedOutMessage {
  type: 'logged-out'
  reason: LogoutReason
}

type Listener = (reason: LogoutReason) => void

const listeners = new Set<Listener>()

// BroadcastChannel never delivers a message to the tab that sent it, so local
// listeners are called directly as well.
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('auth')

function isLoggedOutMessage(data: unknown): data is LoggedOutMessage {
  if (typeof data !== 'object' || data === null) return false
  const { type, reason } = data as Record<string, unknown>
  return type === 'logged-out' && (reason === 'signed-out' || reason === 'expired')
}

if (channel) {
  channel.onmessage = (event: MessageEvent<unknown>) => {
    const { data } = event
    if (isLoggedOutMessage(data)) listeners.forEach((listener) => listener(data.reason))
  }
}

export function notifyLoggedOut(reason: LogoutReason): void {
  const message: LoggedOutMessage = { type: 'logged-out', reason }
  channel?.postMessage(message)
  listeners.forEach((listener) => listener(reason))
}

/** Returns a function that removes the listener. */
export function onLoggedOut(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
