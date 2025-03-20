// src/pages/SearchResultsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { getSearchedMulti } from '../utils/api';
import MovieCard from '../components/MovieCard';
import SerieCard from '../components/SerieCard';
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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (searchQuery.trim()) {
      setLoading(true);
      getSearchedMulti(searchQuery, page)
        .then(data => {
          setResults(data.results);
          setTotalPages(data.total_pages);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erreur lors de la recherche multi :", err);
          setLoading(false);
        });
    }
  }, [searchQuery, page]);

  // Réinitialise la page à 1 quand la query change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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

  const handlePageChange = (newPage) => {
    if (newPage !== '...' && newPage !== page) {
      setPage(newPage);
      window.scrollTo(0, 0); // Retour en haut lors du changement de page
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">
        {t('searchResults')}{searchQuery && ` pour "${searchQuery}"`}
      </h1>
      {loading ? (
        <p>{t('loading')}</p>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {results.map(item =>
              item.media_type === 'tv' ? (
                <SerieCard key={item.id} serie={item} />
              ) : (
                <MovieCard key={item.id} item={item} />
              )
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 my-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('previous')}
              </button>
              {getPageNumbers(page, totalPages, 5).map((p, index) =>
                p === '...' ? (
                  <span key={index} className="px-3 py-1">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded border ${p === page ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      ) : (
        <p>{t('noResultsFound')}</p>
      )}
    </div>
  );
}

export default SearchResultsPage;
