// src/pages/LoginPage.js
import React, { useState } from 'react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gérer la connexion
    console.log('Connexion avec', email, password);
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Adresse Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Mot de Passe</label>
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
            Se Connecter
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Pas de compte ?{' '}
          <a href="/register" className="text-indigo-600 hover:underline">
            Inscrivez-vous
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;