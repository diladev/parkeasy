import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts'],
        exclude: [...configDefaults.exclude, 'e2e/**'],
        setupFiles: ['./src/test/setup.ts'],
        root: fileURLToPath(new URL('./', import.meta.url)),
        restoreMocks: true,
        unstubGlobals: true,
      },
    }),
  ),
)
