import pluginVitest from '@vitest/eslint-plugin'
import { vueTsConfigs, withVueTs } from '@vue/eslint-config-typescript'
import skipFormatting from 'eslint-config-prettier/flat'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import { globalIgnores } from 'eslint/config'

export default withVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/coverage/**', 'components.d.ts']),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  ...pluginVueA11y.configs['flat/recommended'],

  {
    name: 'app/vue-rules',
    rules: {
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/define-macros-order': 'error',
      'vue/require-typed-ref': 'error',
      'vue/prefer-use-template-ref': 'error',
      'vue/no-unused-refs': 'error',
      'vue/no-unused-properties': 'warn',
      'vue/require-explicit-slots': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-boolean-default': ['error', 'default-false'],
      'vue/no-v-html': 'error',
    },
  },

  {
    // Import boundaries (01-architecture §6). The full boundaries plugin is
    // postponed; these two rules cover the important cases.
    name: 'app/boundaries',
    files: ['src/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Import a feature through its public index: "@/features/<name>".',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/boundaries-shared',
    files: ['src/shared/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*', '@/app/*'], message: 'shared/ must stay domain-agnostic.' },
          ],
        },
      ],
    },
  },
  {
    name: 'app/boundaries-features',
    files: ['src/features/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Import a feature through its public index: "@/features/<name>".',
            },
            { group: ['@/app/*'], message: 'Features must not import from app/.' },
          ],
        },
      ],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/*.test.ts', 'src/test/**/*.ts'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
