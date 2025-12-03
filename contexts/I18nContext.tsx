import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, DEFAULT_LANGUAGE, t as translate } from '@/lib/i18n';
import { logger } from '@/utils/logger';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LANGUAGE_STORAGE_KEY = 'app_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage === 'en' || savedLanguage === 'ms') {
        logger.debug('I18nContext', 'Loaded language preference', {
          language: savedLanguage,
        });
        setLanguageState(savedLanguage);
      } else {
        logger.debug('I18nContext', 'No saved language, using default', {
          language: DEFAULT_LANGUAGE,
        });
      }
    } catch (error) {
      logger.error('I18nContext', 'Failed to load language preference', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
      logger.info('I18nContext', 'Language changed', { language: lang });
    } catch (error) {
      logger.error('I18nContext', 'Failed to save language preference', error);
    }
  };

  const t = (keyPath: string): string => translate(keyPath, language);

  if (isLoading) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
