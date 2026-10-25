import { fileURLToPath, URL } from 'node:url'

import ui from '@nuxt/ui/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import { uiTheme } from './src/app/theme/ui-theme.ts'

export default defineConfig(({ mode }) => {
  // DEV_API_TARGET has no VITE_ prefix, so it is only read here and never
  // reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.DEV_API_TARGET || 'http://localhost:3001'

  return {
    plugins: [
      vue(),
      ui({
        ui: uiTheme,
        // The portals are designed dark-only (see the Figma file).
        colorMode: false,
        // Components are auto-imported (tree-shaken); composables are imported
        // explicitly so every file shows where its functions come from.
        autoImport: false,
        // Bundle the icons we use instead of fetching them from api.iconify.design
        // at runtime: works offline and keeps a third party out of connect-src.
        // .ts is scanned too, because menu icons are named in routes.ts files.
        icon: { clientBundle: { scan: { globInclude: ['src/**/*.{vue,ts}'] } } },
      }),
      // Dev-only inspector; kept out of unit tests to keep them fast.
      mode !== 'test' && vueDevTools(),
    ],
    define: {
      // vue-i18n build flags: Composition API only, no devtools hooks in production.
      __VUE_I18N_LEGACY_API__: false,
      __VUE_I18N_FULL_INSTALL__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // Same origin in dev as in production (nginx does the same job there):
        // the browser talks to /api, the proxy strips the prefix.
        '/api': {
          target: apiTarget,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // The backend scopes the refresh cookie to /user/local; seen from the
          // browser that path is /api/user/local.
          cookiePathRewrite: { '/user/local': '/api/user/local' },
        },
      },
    },
    build: {
      // Don't publish source maps (05-security §7). Turn on `hidden` when an
      // error tracker that uploads them privately is added.
      sourcemap: false,
    },
  }
})
