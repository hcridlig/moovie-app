// src/pages/SeriesPage.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';
import SerieCard from '../components/SerieCard';
import {
  getFilteredSeries,
  getGenres,
  getLanguages,
  getPlatforms,
} from '../utils/api';

function SeriesPage() {
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext);

  // États pour les séries et le chargement
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  // États pour les filtres
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    platform: '',
    minRating: 0,
    seasons: '',
  });

  // États pour la pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Définition de handleSearch avec useCallback
  const handleSearch = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const { results, total_pages } = await getFilteredSeries({
        ...filters,
        page: newPage,
      });
      setSeries(results);
      setTotalPages(total_pages);
      setPage(newPage);
    } catch (error) {
      console.error('Erreur lors de la récupération des séries filtrées :', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      genre: '',
      language: '',
      platform: '',
      minRating: 0,
      seasons: '',
    });
    setPage(1);
    handleSearch(1);
  };

  // useEffect qui charge les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genreData, languageData] = await Promise.all([
          getGenres(),
          getLanguages(),
        ]);
        setGenres(genreData);
        setLanguages(languageData);
        const defaultPlatforms = await getPlatforms();
        setPlatforms(defaultPlatforms);
        await handleSearch(1);
      } catch (error) {
        console.error('Erreur lors de la récupération des données pour les séries :', error);
      }
    };
    fetchData();
  }, [handleSearch]);

  // Gestion des changements de filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour générer la pagination
  const getPageNumbers = (current, total, maxVisible = 5) => {
    if (total <= 1) return [1];
    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;
    if (start < 1) {
      start = 1;
      end = Math.min(maxVisible, total);
    }
    if (end > total) {
      end = total;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (start > 2) {
      pages.unshift('...');
      pages.unshift(1);
    } else if (start === 2) {
      pages.unshift(1);
    }
    if (end < total - 1) {
      pages.push('...');
      pages.push(total);
    } else if (end === total - 1) {
      pages.push(total);
    }
    return pages;
  };

  const handlePrevPage = () => {
    if (page > 1) {
      handleSearch(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      handleSearch(page + 1);
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{t('seriesFilters') || 'Series Filters'}</h1>

      <div className="flex">
        {/* Barre latérale de filtres */}
        <div className={`w-1/4 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[58vh] overflow-y-auto`}>
          {/* Filtre Genre */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('genre')}</label>
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allGenres')}</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Langue */}
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

          {/* Filtre Plateforme */}
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

          {/* Filtre Note minimale */}
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

          {/* Filtre Nombre de saisons */}
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">
              {t('numberOfSeasons') || 'Nombre de saisons'}
            </label>
            <input
              type="number"
              name="seasons"
              value={filters.seasons}
              onChange={handleFilterChange}
              min="0"
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>

          <button
            onClick={() => handleSearch(1)}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
          >
            {t('search')}
          </button>
          <button
            onClick={handleResetFilters}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
          >
            {t('resetFilters')}
          </button>
        </div>

        {/* Grille des séries */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-8">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-48 h-72 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              ))
            : series.map((serie) => <SerieCard key={serie.id} serie={serie} />)}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 my-6">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-3 py-1 rounded border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {t('previous')}
        </button>

        {getPageNumbers(page, totalPages, 5).map((p, index) =>
          p === '...' ? (
            <span key={index} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={(e) => {
                e.currentTarget.focus();
                handleSearch(p);
              }}
              className={`px-3 py-1 rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}

export default SeriesPage;
