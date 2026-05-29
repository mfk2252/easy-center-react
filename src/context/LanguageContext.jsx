import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, RETURN_GREETINGS } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('scs_lang') || 'ar');

  const setLang = useCallback((next) => {
    setLangState(next);
    localStorage.setItem('scs_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useCallback((key) => {
    const parts = key.split('.');
    let val = translations[lang];
    for (const p of parts) {
      val = val?.[p];
    }
    if (val !== undefined) return val;
    let fallback = translations.ar;
    for (const p of parts) {
      fallback = fallback?.[p];
    }
    return fallback ?? key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}

export function getWelcomeMessage(userName, centerId, lang = 'ar') {
  const key = centerId ? `scs_welcome_seen_${centerId}` : 'scs_welcome_seen';
  const seen = localStorage.getItem(key);
  const first = translations[lang]?.welcomeFirst || translations.ar.welcomeFirst;
  if (!seen) {
    localStorage.setItem(key, '1');
    return `${first} ${userName || ''}`.trim();
  }
  const list = RETURN_GREETINGS[lang] || RETURN_GREETINGS.ar;
  const phrase = list[Math.floor(Math.random() * list.length)];
  return `${phrase} ${userName || ''}`.trim();
}
