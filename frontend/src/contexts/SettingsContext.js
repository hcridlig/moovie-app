// src/contexts/SettingsContext.js
import React, { createContext, useState, useEffect } from 'react';
import i18n from '../i18n';  // Importez la configuration i18n

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');
  const [notificationsEnabled, setNotificationsEnabled] = useState(JSON.parse(localStorage.getItem('notificationsEnabled')) || true);
  
  // Ajout du state pour le pays (par défaut 'FR' pour la France)
  const [country, setCountry] = useState(localStorage.getItem('country') || 'FR');

  // Fonction pour appliquer le thème en fonction des préférences
  const applyTheme = (currentTheme) => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (currentTheme === 'dark' || (currentTheme === 'system' && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Appliquer le thème et sauvegarder dans le localStorage
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Ecoute des changements du système si le thème est "system"
  useEffect(() => {
    const systemThemeListener = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      if (theme === 'system') applyTheme('system');
    };
    systemThemeListener.addEventListener('change', handleSystemThemeChange);

    return () => systemThemeListener.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Changer la langue globalement et la sauvegarder dans le localStorage
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language]);

  // Sauvegarder le pays dans le localStorage dès qu'il change
  useEffect(() => {
    localStorage.setItem('country', country);
  }, [country]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        notificationsEnabled,
        setNotificationsEnabled,
        country,
        setCountry
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
