// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          MovieFlix
        </Link>
        <nav className="flex space-x-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">
            Accueil
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-indigo-600">
            Profil
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-indigo-600">
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;