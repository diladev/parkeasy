import { hasPermission, type Permission } from '../model/permissions'
import { useSessionStore } from '../store/session.store'

/**
 * The one permission check used by guards, menus and buttons. Reading the store
 * inside can() makes any computed or template that calls it reactive.
 */
export function useCan() {
  const session = useSessionStore()
  const can = (required?: Permission | readonly Permission[], mode: 'all' | 'any' = 'all') =>
    hasPermission(session.permissions, required, mode)
  return { can }
}
