// src/components/Footer.js
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';

function Footer() {
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext);

  return (
    <footer className={`shadow-inner mt-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
      <div className="container mx-auto text-center p-4">
        <p>{t('footerText')}</p>
      </div>
    </footer>
  );
}

export default Footer;