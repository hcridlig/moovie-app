// src/pages/SearchResultsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { getSearchedMovies } from '../utils/api';
import MovieCard from '../components/MovieCard';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const query = useQuery();
  const searchQuery = query.get('query') || '';
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setLoading(true);
      getSearchedMovies(searchQuery)
        .then(data => {
          setMovies(data.results);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erreur lors de la recherche de films:", err);
          setLoading(false);
        });
    }
  }, [searchQuery]);

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{t('searchResults')}</h1>
      {loading ? (
        <p>{t('loading')}</p>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {movies.map(movie => (
            <MovieCard key={movie.id} item={movie} />
          ))}
        </div>
      ) : (
        <p>{t('noResultsFound')}</p>
      )}
    </div>
  );
}

export default SearchResultsPage;
