import type { NuxtUIOptions } from '@nuxt/ui/vite'

/**
 * Nuxt UI theme overrides, read at build time by the Vite plugin.
 * Colours themselves live in app/styles/main.css (CSS variables).
 */
export const uiTheme: NuxtUIOptions['ui'] = {
  colors: {
    // `brand` is the admin purple palette defined in main.css.
    primary: 'brand',
    neutral: 'zinc',
  },
  button: {
    compoundVariants: [
      {
        // Figma uses white on #7f77dd, which is only 3.8:1. One step darker
        // (#6a61d3) keeps the look and reaches 4.9:1 (WCAG AA).
        color: 'primary',
        variant: 'solid',
        class:
          'text-white bg-(--ui-color-primary-600) hover:bg-(--ui-color-primary-700) active:bg-(--ui-color-primary-700) disabled:bg-(--ui-color-primary-600) aria-disabled:bg-(--ui-color-primary-600)',
      },
    ],
  },
  input: {
    // Figma inputs: raised surface with a hairline border.
    defaultVariants: { variant: 'subtle' },
  },
}
