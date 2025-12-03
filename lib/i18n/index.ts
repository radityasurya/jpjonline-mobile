import { en } from './translations.en';
import { ms } from './translations.ms';
import { Language, TranslationKeys } from './types';

export const DEFAULT_LANGUAGE: Language = 'ms'; // Malaysian as default

export const translations = {
  en,
  ms,
};

/**
 * Get translation for a nested key path
 * @param keyPath - Dot-separated path (e.g., 'nav.notes', 'auth.login.title')
 * @param language - 'en' or 'ms'
 */
export function t(
  keyPath: string,
  language: Language = DEFAULT_LANGUAGE,
): string {
  const keys = keyPath.split('.');
  let value: any = translations[language];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Fallback to English if translation not found
      let fallbackValue: any = translations.en;
      for (const fallbackKey of keys) {
        if (
          fallbackValue &&
          typeof fallbackValue === 'object' &&
          fallbackKey in fallbackValue
        ) {
          fallbackValue = fallbackValue[fallbackKey];
        } else {
          return keyPath; // Return key if not found in both languages
        }
      }
      return typeof fallbackValue === 'string' ? fallbackValue : keyPath;
    }
  }

  return typeof value === 'string' ? value : keyPath;
}

export type { Language, TranslationKeys };
