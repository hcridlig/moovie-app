// src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    console.log('Rechercher :', searchQuery);
    // Rediriger vers la page de résultats ou traiter la recherche ici
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo du site */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            MovieFlix
          </Link>
        </div>

        {/* Barre de recherche avec bouton */}
        <div className="relative flex-1 mx-4 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
          {/* Bouton de recherche discret */}
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
        </div>

        {/* Boutons Se Connecter et S'inscrire */}
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-gray-600 hover:text-indigo-600 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Se Connecter
          </Link>
          <Link
            to="/register"
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition"
          >
            S'inscrire
          </Link>

          {/* Bouton Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
            >
              <svg
                className="w-6 h-6 text-gray-600 hover:text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
              </svg>
            </button>

            {/* Menu déroulant avec un style plus moderne */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                <ul className="py-2">
                  <li>
                    <Link
                      to="/classement"
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Classement
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/films"
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Films
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/series"
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Séries
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/plateformes"
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Par Plateformes
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
