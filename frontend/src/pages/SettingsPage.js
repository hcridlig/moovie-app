// src/pages/SettingsPage.js
import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function SettingsPage() {
  const { theme, setTheme, language, setLanguage, notificationsEnabled, setNotificationsEnabled, country, setCountry } = useContext(SettingsContext);
  const { t } = useTranslation();

  return (
    <div className="container mx-auto mt-12 px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{t('settings')}</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('theme')}</h3>
        <div className="flex items-center space-x-4">
          <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>{t('lightMode')}</button>
          <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>{t('darkMode')}</button>
          <button onClick={() => setTheme('system')} className={`px-4 py-2 rounded ${theme === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>{t('systemMode')}</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('language')}</h3>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-3/4 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
          <option value="fr">Français - (France)</option>
          <option value="en">English - (USA)</option>
        </select>
      </div>

      {/* Nouveau sélecteur de pays */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('country')}</h3>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-3/4 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
          <option value="FR">France</option>
          <option value="US">USA</option>
          {/* Vous pouvez ajouter d'autres options ici */}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('notifications')}</h3>
        <label className="flex items-center space-x-4">
          <span className="text-gray-700 dark:text-gray-300">{t('notifications')}</span>
          <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} className="w-6 h-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />
        </label>
      </div>
    </div>
  );
}

export default SettingsPage;
