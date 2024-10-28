// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

function NotFoundPage() {
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext);

  return (
    <div className={`container mx-auto px-4 py-16 text-center mt-10 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">{t('pageNotFound')}</p>
      <Link to="/" className="text-indigo-600 hover:underline text-lg">
        {t('goHome')}
      </Link>
    </div>
  );
}

export default NotFoundPage;