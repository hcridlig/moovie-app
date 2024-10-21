// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oups ! La page que vous recherchez n'existe pas.</p>
      <Link to="/" className="text-indigo-600 hover:underline text-lg">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default NotFoundPage;