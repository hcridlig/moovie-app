// src/pages/RegisterPage.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../contexts/SettingsContext'; // Contexte pour le thème
import { useTranslation } from 'react-i18next';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { theme } = useContext(SettingsContext); // Utiliser le thème
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setErrorMessage(data.message || 'Une erreur est survenue.');
      }
    } catch (error) {
      setErrorMessage('Erreur de réseau. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-10">
      <div className={`max-w-md mx-auto p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <h2 className="text-2xl font-semibold text-center mb-6">{t('register')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('username')}</label>
            <input
              type="text"
              className={`w-full p-2 border rounded mt-1 focus:outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('username')}
              required
            />
          </div>
          <div className="mb-4">
            <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('emailAddress')}</label>
            <input
              type="email"
              className={`w-full p-2 border rounded mt-1 focus:outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailAddress')}
              required
            />
          </div>
          <div className="mb-4">
            <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('password')}</label>
            <input
              type="password"
              className={`w-full p-2 border rounded mt-1 focus:outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          <div className="mb-6">
            <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('confirmPassword')}</label>
            <input
              type="password"
              className={`w-full p-2 border rounded mt-1 focus:outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <button className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
            {t('register')}
          </button>
        </form>
        <p className={`text-center mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('alreadyHaveAccount')}{' '}
          <a href="/login" className="text-indigo-600 hover:underline">
            {t('goToLogin')}
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
