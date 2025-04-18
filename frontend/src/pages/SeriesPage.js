// SeriesPage.js

import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';
import SerieCard from '../components/SerieCard';
import { getFilteredSeries, getTvGenres, getPlatforms } from '../utils/api';

function SeriesPage() {
  const { t } = useTranslation();
  const { theme, country } = useContext(SettingsContext);
  const language = localStorage.getItem('language') || 'en';

  // États pour les séries
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  // États pour les filtres (formulaire et appliqués)
  const [filters, setFilters] = useState({
    genre: '',
    platform: '',
    minRating: '',
    seasons: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    genre: '',
    platform: '',
    minRating: '',
    seasons: ''
  });

  // État pour le tri et la pagination
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Données pour les genres et plateformes
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatformsState] = useState([]);

  /**
   * Fonction de recherche qui combine filtres, tri, pays et pagination
   */
  const handleSearch = useCallback(
    async (newPage = 1, currentFilters = appliedFilters, currentSortBy = sortBy, currentCountry = country) => {
      setLoading(true);
      try {
        const searchFilters = {
          ...currentFilters,
          sortBy: currentSortBy,
          country: currentCountry,
          page: newPage,
        };
        const { results, total_pages } = await getFilteredSeries(searchFilters);
        setSeries(results);
        setTotalPages(total_pages);
        setPage(newPage);
      } catch (error) {
        console.error('Erreur lors de la récupération des séries filtrées :', error);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, sortBy, country]
  );

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tvGenres = await getTvGenres(`${language}-FR`);
        setGenres(tvGenres);

        const defaultPlatforms = await getPlatforms(country);
        setPlatformsState(defaultPlatforms);

        await handleSearch(1, appliedFilters, sortBy, country);
      } catch (error) {
        console.error('Erreur lors de la récupération des données pour les séries :', error);
      }
    };
    fetchData();
  }, [country, appliedFilters, sortBy, language, handleSearch]);

  // Lorsqu'on change le tri ou les filtres, relancer la recherche à la page 1
  useEffect(() => {
    handleSearch(1, appliedFilters, sortBy, country);
  }, [sortBy, country, appliedFilters, handleSearch]);

  // Gestion des changements dans le formulaire de filtres et tri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortBy') {
      setSortBy(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    handleSearch(1, filters, sortBy, country);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    const defaultFilters = {
      genre: '',
      platform: '',
      minRating: '',
      seasons: ''
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSortBy('');
    handleSearch(1, defaultFilters, '', country);
  };

  // Fonction de pagination unifiée
  const handlePrevPage = () => {
    if (page > 1) {
      handleSearch(page - 1, appliedFilters, country);
    }
  };
  const handleNextPage = () => {
    if (page < totalPages) {
      handleSearch(page + 1, appliedFilters, country);
    }
  };

  // Fonction pour générer les numéros de page
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

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{t('seriesFilters') || 'Series Filters'}</h1>

      <div className="flex">
        {/* Barre latérale des filtres */}
        <div className={`w-1/4 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[49vh] overflow-y-auto`}>
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

          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('platform')}</label>
            <select
              name="platform"
              value={filters.platform}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allPlatforms')}</option>
              {platforms.map((p) => (
                <option key={p.provider_id} value={p.provider_id}>
                  {p.provider_name}
                </option>
              ))}
            </select>
          </div>

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

          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">
              {t('numberOfSeasons') || 'Number of Seasons'}
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
            onClick={handleApplyFilters}
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

        {/* Zone principale : tri + liste de séries */}
        <div className="flex-1">
          <div className="flex items-center justify-end mb-4">
            <label className="mr-2 font-semibold">{t('sortBy')}:</label>
            <select
              name="sortBy"
              value={sortBy}
              onChange={handleFilterChange}
              className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('defaultSorting')}</option>
              <option value="first_air_date.asc">{t('first_air_date.asc')}</option>
              <option value="first_air_date.desc">{t('first_air_date.desc')}</option>
              <option value="vote_average.asc">{t('vote_average.asc')}</option>
              <option value="vote_average.desc">{t('vote_average.desc')}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-8">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-48 h-72 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : series.length === 0 ? (
            <div className="text-center mt-10 text-lg">Aucune série à afficher.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-8">
              {series.map((serie) => (
                <SerieCard key={serie.id} serie={serie} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {series.length > 0 && (
            <div className="flex items-center justify-center space-x-2 my-6">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
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
                    onClick={() => handleSearch(p, appliedFilters, country)}
                    className={`px-3 py-1 rounded border ${
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
                className="px-3 py-1 rounded border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeriesPage;
