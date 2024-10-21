// src/pages/RegisterPage.js
import React, { useState } from 'react';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gérer l'inscription
    console.log('Inscription avec', username, email, password);
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Inscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre nom d'utilisateur"
              required
            />
          </div>
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
            S'inscrire
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Vous avez déjà un compte ?{' '}
          <a href="/login" className="text-indigo-600 hover:underline">
            Connectez-vous
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;