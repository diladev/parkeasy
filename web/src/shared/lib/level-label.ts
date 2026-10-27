import { parseLevel } from './levels'

type Translate = (key: string, named?: Record<string, unknown>) => string

/** "G" -> "Ground floor", "B1" -> "Basement 1", "F2" -> "Floor 2", in the current language. */
export function levelLabel(level: string, t: Translate): string {
  const parsed = parseLevel(level)
  switch (parsed.kind) {
    case 'ground':
      return t('levels.ground')
    case 'basement':
      return t('levels.basement', { number: parsed.number })
    case 'floor':
      return t('levels.floor', { number: parsed.number })
    case 'other':
      return parsed.name
  }
}
