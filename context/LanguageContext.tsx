import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const [allTranslations, setAllTranslations] = useState<{ [key in Language]?: { [key: string]: string } } | null>(null);

  useEffect(() => {
    const fetchAllTranslations = async () => {
      try {
        const [enResponse, arResponse] = await Promise.all([
          fetch('./locales/en.json'), // Use fetch relative to the root index.html
          fetch('./locales/ar.json')
        ]);

        if (!enResponse.ok || !arResponse.ok) {
          throw new Error(`Failed to fetch translation files. Status: ${enResponse.status}, ${arResponse.status}`);
        }

        const enData = await enResponse.json();
        const arData = await arResponse.json();
        
        setAllTranslations({ en: enData, ar: arData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
      }
    };
    fetchAllTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: { [key: string]: string }) => {
    if (!allTranslations) {
      return key; // Return key as fallback while loading
    }
    
    const langTranslations = allTranslations[language];
    const fallbackTranslations = allTranslations['en'];
    
    let translation = (langTranslations && langTranslations[key]) || (fallbackTranslations && fallbackTranslations[key]) || key;
    
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
      });
    }
    return translation;
  };

  // Do not render the rest of the app until translations are loaded
  // This prevents showing untranslated text.
  if (!allTranslations) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};