// src/pages/MoviesPage.js
import React, { useEffect, useState, useContext } from 'react';
import MovieCard from '../components/MovieCard';
import { getFilteredMovies, getGenres, getLanguages, getPlatforms } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';

function MoviesPage() {
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext); // Intégration du thème
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    platform: '',
    minRating: 0,
    releaseYear: '',
    minDuration: '', // Nouveau champ pour la durée minimale
    maxDuration: ''  // Nouveau champ pour la durée maximale
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupère les genres, langues et plateformes disponibles pour le filtrage
    const fetchData = async () => {
      try {
        const [genreData, languageData, platformData] = await Promise.all([
          getGenres(),
          getLanguages(),
          getPlatforms()
        ]);
        setGenres(genreData);
        setLanguages(languageData);
        setPlatforms(platformData);
      } catch (error) {
        console.error('Erreur lors de la récupération des genres, langues ou plateformes:', error);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filteredMovies = await getFilteredMovies(filters);
      setMovies(filteredMovies);
    } catch (error) {
      console.error('Erreur lors de la récupération des films filtrés:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{t('movieFilters')}</h1>
      <div className="flex">
        {/* Barre latérale de filtres */}
        <div className={`w-1/4 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Genre */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('genre')}</label>
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allGenres')}</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Langue */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('language')}</label>
            <select
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allLanguages')}</option>
              {languages.map((lang) => (
                <option key={lang.iso_639_1} value={lang.iso_639_1}>
                  {lang.english_name}
                </option>
              ))}
            </select>
          </div>

          {/* Plateforme */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('platform')}</label>
            <select
              name="platform"
              value={filters.platform}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allPlatforms')}</option>
              {platforms.map((platform) => (
                <option key={platform.provider_id} value={platform.provider_id}>
                  {platform.provider_name}
                </option>
              ))}
            </select>
          </div>

          {/* Note minimale */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('minRating')}</label>
            <input
              type="number"
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              min="0"
              max="10"
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>

          {/* Année de sortie */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('releaseYear')}</label>
            <input
              type="number"
              name="releaseYear"
              value={filters.releaseYear}
              onChange={handleFilterChange}
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>

          {/* Durée du film */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('duration')}</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                placeholder={t('min')}
                className={`w-1/2 p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
              />
              <input
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                placeholder={t('max')}
                className={`w-1/2 p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
              />
            </div>
          </div>

          {/* Bouton de recherche */}
          <button
            onClick={handleSearch}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
          >
            {t('search')}
          </button>
        </div>

        {/* Liste des films */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-8">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-48 h-72 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              ))
            : movies.map((movie) => <MovieCard key={movie.id} item={movie} />)}
        </div>
      </div>
    </div>
  );
}

export default MoviesPage;
