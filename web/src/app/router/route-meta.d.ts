import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    /** i18n key for the menu and the browser tab, e.g. 'nav.overview'. */
    title?: string
    /** i18n key for the page heading when it differs from the menu title. */
    heading?: string
    /** Lucide icon name for the menu, e.g. 'i-lucide-layout-dashboard'. */
    icon?: string
    /** Needed to open the page. UI only: the server checks every request itself. */
    permissions?: string[]
    /** Reachable without signing in. */
    public?: boolean
    /** Only for signed-out users (the sign-in page). */
    guestOnly?: boolean
    /** Which portal the route belongs to; picks the sign-in page to send people to. */
    portal?: 'admin' | 'garage'
    /** Route name of the list page above this one, shown as "Garages /" before the heading. */
    parent?: string
    hideInMenu?: boolean
    menuOrder?: number
  }
}
