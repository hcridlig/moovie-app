// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Importer le contexte
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Utiliser le contexte pour gérer l'état de connexion
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la connexion');
      }

      const data = await response.json();

      // Utiliser la fonction login du contexte pour stocker les infos utilisateur
      login(data.token, data.user.username);
      console.log(data.token);
      console.log(data.user);

      // Rediriger après connexion
      navigate('/');

    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">{t('login')}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700">{t('emailAddress')}</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailAddress')}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">{t('password')}</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          <button className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
            {t('login')}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          {t('noAccount')}{' '}
          <a href="/register" className="text-indigo-600 hover:underline">
            {t('signUp')}
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;