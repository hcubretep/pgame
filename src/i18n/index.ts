/**
 * Bloom Now - I18n Setup
 *
 * Aktuell nur Deutsch, aber vorbereitet für weitere Sprachen.
 */

import { de, type Translations } from './de'

export type Locale = 'de-DE' | 'en-US'

const translations: Record<Locale, Translations> = {
  'de-DE': de,
  'en-US': de, // Fallback zu Deutsch bis EN verfügbar
}

// Aktuelle Locale (später aus Settings/Browser)
let currentLocale: Locale = 'de-DE'

export function setLocale(locale: Locale): void {
  currentLocale = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t(key: string): string {
  const keys = key.split('.')
  let value: unknown = translations[currentLocale]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      console.warn(`Translation missing: ${key}`)
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

// Hook für React-Komponenten
export function useTranslation() {
  return { t, locale: currentLocale, setLocale }
}

// Export für direkten Zugriff auf Übersetzungen
export { de }
