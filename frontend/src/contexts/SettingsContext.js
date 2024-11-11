// src/contexts/SettingsContext.js
import React, { createContext, useState, useEffect } from 'react';
import i18n from '../i18n';  // Importez la configuration i18n

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');
  const [notificationsEnabled, setNotificationsEnabled] = useState(JSON.parse(localStorage.getItem('notificationsEnabled')) || true);

  // Fonction pour appliquer le thème en fonction des préférences
  const applyTheme = (currentTheme) => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (currentTheme === 'dark' || (currentTheme === 'system' && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Effet pour appliquer le thème lors du chargement et lorsque le thème change
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Ecouteur pour détecter les changements du système si le thème est "system"
  useEffect(() => {
    const systemThemeListener = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      if (theme === 'system') applyTheme('system');
    };
    systemThemeListener.addEventListener('change', handleSystemThemeChange);

    return () => systemThemeListener.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Changer la langue globalement
  useEffect(() => {
    i18n.changeLanguage(language);  // Change la langue dans i18next
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, notificationsEnabled, setNotificationsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};
