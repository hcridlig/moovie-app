// src/pages/MoviesPage.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import MovieCard from '../components/MovieCard';
import { getFilteredMovies, getGenres, getPlatforms } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';

function MoviesPage() {
  const { t } = useTranslation();
  const { theme, country } = useContext(SettingsContext);

  // Liste des films et état de chargement
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Genres et plateformes pour les sélecteurs
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  // Filtres (tous par défaut vides sauf sortBy qui déclenche auto update)
  const [filters, setFilters] = useState({
    genre: '',
    platform: '',
    minRating: '',
    releaseYear: '',
    minDuration: '',
    maxDuration: '',
    sortBy: '' // Tri par défaut (vide = tri "mis en avant")
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Chargement initial des genres, plateformes et films (avec filtres par défaut)
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const genreData = await getGenres();
        // Ajout manuel du genre "Manga" s'il n'existe pas déjà
        if (!genreData.find(g => g.name.toLowerCase() === 'manga')) {
          genreData.push({ id: 9999, name: 'Manga' });
        }
        setGenres(genreData);

        const platformData = await getPlatforms(country);
        setPlatforms(platformData);

        // Chargement initial des films avec filtres par défaut
        await handleSearch(1, filters, country);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchData();
  }, [country]);

  /**
   * Fonction de recherche : charge les films en fonction des filtres, du pays et de la page.
   */
  const handleSearch = useCallback(
    async (newPage = 1, currentFilters = filters, currentCountry = country) => {
      setLoading(true);
      try {
        const minRatingNum = currentFilters.minRating ? Number(currentFilters.minRating) : 0;
        const { results, total_pages } = await getFilteredMovies({
          ...currentFilters,
          country: currentCountry,
          minRating: minRatingNum,
          page: newPage
        });
        setMovies(results);
        setTotalPages(total_pages);
        setPage(newPage);
      } catch (error) {
        console.error('Erreur lors de la récupération des films filtrés:', error);
      } finally {
        setLoading(false);
      }
    },
    [filters, country]
  );

  /**
   * Gère le changement des filtres (sauf le tri) :
   * Les autres filtres se mettent à jour dans le state sans déclencher la recherche.
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Lorsque l'utilisateur clique sur "Rechercher", on recharge les films avec les filtres actuels.
   */
  const handleApplyFilters = () => {
    handleSearch(1, filters, country);
  };

  /**
   * Réinitialise les filtres et recharge la liste avec les valeurs par défaut.
   */
  const handleResetFilters = () => {
    const defaultFilters = {
      genre: '',
      platform: '',
      minRating: '',
      releaseYear: '',
      minDuration: '',
      maxDuration: '',
      sortBy: ''
    };
    setFilters(defaultFilters);
    handleSearch(1, defaultFilters, country);
  };

  /**
   * Mise à jour automatique de la recherche lorsque le tri (sortBy) change.
   * Le changement de tri déclenche une recherche sans attendre le clic sur "Rechercher".
   */
  useEffect(() => {
    // Lorsqu'on change sortBy, on recharge la première page avec le nouveau tri
    handleSearch(1, filters, country);
  }, [filters.sortBy]);

  /**
   * Pagination : navigation entre les pages.
   */
  const handlePrevPage = () => {
    if (page > 1) {
      handleSearch(page - 1, filters, country);
    }
  };
  const handleNextPage = () => {
    if (page < totalPages) {
      handleSearch(page + 1, filters, country);
    }
  };

  /**
   * Génère les numéros de page pour la pagination.
   */
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
      <h1 className="text-3xl font-bold mb-6">{t('movieFilters')}</h1>

      <div className="flex space-x-8">
        {/* Barre latérale des filtres */}
        <div className={`w-1/4 p-6 rounded-lg shadow-md h-fit ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Filtre Genre */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 dark:text-gray-200">{t('genre')}</label>
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allGenres')}</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Plateforme */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 dark:text-gray-200">{t('platform')}</label>
            <select
              name="platform"
              value={filters.platform}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">{t('allPlatforms')}</option>
              <option value="cinema">{t('currentlyInTheaters') || 'Actuellement au cinéma'}</option>
              {platforms.map((p) => (
                <option key={p.provider_id} value={p.provider_id}>
                  {p.provider_name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Note minimale */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 dark:text-gray-200">{t('minRating')}</label>
            <input
              type="number"
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              min="0"
              max="10"
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>

          {/* Filtre Année de sortie */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 dark:text-gray-200">{t('releaseYear')}</label>
            <input
              type="number"
              name="releaseYear"
              value={filters.releaseYear}
              onChange={handleFilterChange}
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>

          {/* Filtre Durée */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 dark:text-gray-200">{t('duration')}</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                placeholder={t('min')}
                className={`w-1/2 p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
              />
              <input
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                placeholder={t('max')}
                className={`w-1/2 p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
              />
            </div>
          </div>

          {/* Bouton "Rechercher" pour appliquer les filtres (sauf le tri) */}
          <button
            onClick={handleApplyFilters}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
          >
            {t('search')}
          </button>

          {/* Bouton "Reset" */}
          <button
            onClick={handleResetFilters}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
          >
            {t('resetFilters')}
          </button>
        </div>

        {/* Zone principale : tri en haut à droite et grille de films */}
        <div className="flex-1">
          {/* Barre "Trier par" placée en haut à droite */}
          <div className="flex items-center justify-end mb-4">
            <label className="mr-2 font-semibold">Trier par :</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">Mis en avant (défaut)</option>
              <option value="primary_release_date.asc">Date de sortie : Croissant</option>
              <option value="primary_release_date.desc">Date de sortie : Décroissant</option>
              <option value="runtime.asc">Durée : Croissant</option>
              <option value="runtime.desc">Durée : Décroissant</option>
              <option value="vote_average.asc">Note : Croissante</option>
              <option value="vote_average.desc">Note : Décroissante</option>
            </select>
          </div>

          {/* Affichage de la grille des films */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-48 h-72 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center mt-10 text-lg">Aucun film à afficher.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} item={movie} />
              ))}
            </div>
          )}

          {/* Pagination si des films sont affichés */}
          {movies.length > 0 && (
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
                    onClick={() => handleSearch(p, filters, country)}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default MoviesPage;
