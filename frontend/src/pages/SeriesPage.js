// src/pages/SeriesPage.js
import React, { useEffect, useState, useContext } from 'react';
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

  const [series, setSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    platform: '',
    minRating: 0,
    releaseYear: '',
    minDuration: '',
    maxDuration: ''
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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

        // Lance la première recherche de séries
        handleSearch();
      } catch (error) {
        console.error('Erreur lors de la récupération des données pour les séries :', error);
      }
    };
    fetchData();
  }, []);

  const fetchPlatformsByLanguage = async (language) => {
    const countryCodeMap = {
      fr: 'FR',
      en: 'US',
      // Ajoutez d’autres mappings langue → pays si nécessaire
    };
    const countryCode = countryCodeMap[language] || 'US';

    try {
      const platformsByLanguage = await getPlatforms(countryCode);
      setPlatforms(platformsByLanguage);
    } catch (error) {
      console.error('Erreur lors de la récupération des plateformes (séries) :', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'language') {
      fetchPlatformsByLanguage(value);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { results, total_pages } = await getFilteredSeries({ ...filters, page });
      setSeries(results);
      setTotalPages(total_pages);
    } catch (error) {
      console.error('Erreur lors de la récupération des séries filtrées :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      genre: '',
      language: '',
      platform: '',
      minRating: 0,
      releaseYear: '',
      minDuration: '',
      maxDuration: ''
    });
    setPage(1);
    handleSearch();
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      handleSearch();
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      handleSearch();
    }
  };

  return (
    <div
      className={`container mx-auto px-4 py-8 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <h1 className="text-3xl font-bold mb-4">{t('seriesFilters') || 'Series Filters'}</h1>

      <div className="flex">
        {/* Barre latérale de filtres */}
        <div
          className={`w-1/4 p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } max-h-[73vh] overflow-y-auto`}
        >
          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('genre')}</label>
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${
                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
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
            <label className="block font-semibold dark:text-gray-200">{t('language')}</label>
            <select
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded mt-2 ${
                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
            >
              <option value="">{t('allLanguages')}</option>
              {languages.map((lang) => (
                <option key={lang.iso_639_1} value={lang.iso_639_1}>
                  {lang.english_name}
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
              className={`w-full p-2 border rounded mt-2 ${
                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
            >
              <option value="">{t('allPlatforms')}</option>
              {platforms.map((plat) => (
                <option key={plat.provider_id} value={plat.provider_id}>
                  {plat.provider_name}
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
              className={`w-full p-2 border rounded mt-2 ${
                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('releaseYear')}</label>
            <input
              type="number"
              name="releaseYear"
              value={filters.releaseYear}
              onChange={handleFilterChange}
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full p-2 border rounded mt-2 ${
                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold dark:text-gray-200">{t('duration')}</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                placeholder={t('min')}
                className={`w-1/2 p-2 border rounded mt-2 ${
                  theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                }`}
              />
              <input
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                placeholder={t('max')}
                className={`w-1/2 p-2 border rounded mt-2 ${
                  theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
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
            : series.map((serie) => (
                <SerieCard key={serie.id} serie={serie} />
              ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between my-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('previous')}
        </button>
        <span className="text-lg">
          {t('page')} {page} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}

export default SeriesPage;
