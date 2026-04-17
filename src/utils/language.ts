import _app from '@/app/configs/_app'
import langpacks from '@/app/langpacks'
import type { LanguagePackSchema } from '@/app/langpacks/types.ts'

export function translate(key: keyof LanguagePackSchema, locale: keyof typeof langpacks = _app.company as keyof typeof langpacks) {
  return langpacks[locale]?.[key] || 'ERROR: LANGUAGE PACK MISSING'
}
