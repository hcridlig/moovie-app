// src/components/Navbar.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, username, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearch = () => {
    console.log('Rechercher :', searchQuery);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-indigo-600'}`}>
            CinéScope
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="relative flex-1 mx-4 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className={`w-full p-2 pr-10 border rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'border-gray-300'} focus:outline-none`}
          />
          <button
            onClick={handleSearch}
            className={`absolute right-2 top-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>

        {/* Liens de navigation */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} hover:text-indigo-600`}>
                {t('hello')}, {username}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${theme === 'dark' ? 'text-white border-gray-700' : 'text-gray-600 border-gray-300'} px-4 py-2 border rounded-md hover:bg-gray-100 transition`}
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className={`px-4 py-2 rounded-md transition ${theme === 'dark' ? 'bg-indigo-700 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {t('register')}
              </Link>
            </>
          )}

          {/* Menu Hamburger */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
              <svg
                className={`w-6 h-6 ${theme === 'dark' ? 'text-white hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
              </svg>
            </button>

            {/* Menu déroulant */}
            <div className={`${menuOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-56 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-700 border-gray-200'} rounded-lg shadow-xl z-10`}>
              <ul className="py-2">
                <li>
                  <Link to="/classement" className="block px-4 py-2 hover:bg-indigo-100 transition" onClick={() => setMenuOpen(false)}>
                    {t('ranking')}
                  </Link>
                </li>
                <li>
                  <Link to="/moviespage" className="block px-4 py-2 hover:bg-indigo-100 transition" onClick={() => setMenuOpen(false)}>
                    {t('movies')}
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="block px-4 py-2 hover:bg-indigo-100 transition" onClick={() => setMenuOpen(false)}>
                    {t('series')}
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="block px-4 py-2 hover:bg-indigo-100 transition" onClick={() => setMenuOpen(false)}>
                    {t('settings')}
                  </Link>
                </li>
                {isAuthenticated && (
                  <>
                    <li>
                      <Link to="/watched" className="block px-4 py-2 hover:bg-indigo-100 transition" onClick={() => setMenuOpen(false)}>
                        {t('watched')}
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition">
                        {t('logout')}
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
