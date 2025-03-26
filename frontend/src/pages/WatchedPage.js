// WatchedPage.js

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import SerieCard from '../components/SerieCard';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

// On importe les fonctions d'API
import { getUserPreferences, getMovieById, getSerieById } from '../utils/api';

const WatchedPage = () => {
  const { isAuthenticated, username } = useContext(AuthContext);
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();

  const [watchedItems, setWatchedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrousel "liked"
  const likedContainerRef = useRef(null);
  const [likedStartIndex, setLikedStartIndex] = useState(0);
  const [likedTranslateX, setLikedTranslateX] = useState(0);
  const [likedMaxTranslateX, setLikedMaxTranslateX] = useState(0);

  // Carrousel "disliked"
  const dislikedContainerRef = useRef(null);
  const [dislikedStartIndex, setDislikedStartIndex] = useState(0);
  const [dislikedTranslateX, setDislikedTranslateX] = useState(0);
  const [dislikedMaxTranslateX, setDislikedMaxTranslateX] = useState(0);

  // Au montage, on récupère les préférences + détails TMDB
  useEffect(() => {
    if (!isAuthenticated || !username) {
      setLoading(false);
      return;
    }

    getUserPreferences()
      .then((preferences) => {
        // Pour chaque preference, on va chercher les détails
        const fetchDetailsPromises = preferences.map(async (pref) => {
          try {
            if (pref.media_type === 'movie') {
              const movieData = await getMovieById(pref.movie_id);
              return { ...pref, ...movieData, media_type: 'movie' };
            } else if (pref.media_type === 'series') {
              const serieData = await getSerieById(pref.movie_id);
              return { ...pref, ...serieData, media_type: 'series' };
            }
            return pref; // fallback si media_type n'est pas défini
          } catch (err) {
            console.error('Erreur fetch details TMDB:', err);
            return pref;
          }
        });

        return Promise.all(fetchDetailsPromises);
      })
      .then((detailedItems) => {
        setWatchedItems(detailedItems);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des contenus visionnés :", error);
        setLoading(false);
      });
  }, [isAuthenticated, username]);

  // Mise à jour du carrousel "liked"
  useEffect(() => {
    if (likedContainerRef.current) {
      const firstCard = likedContainerRef.current.querySelector('.card-item');
      if (firstCard) {
        const style = window.getComputedStyle(firstCard);
        const cardWidth = firstCard.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = cardWidth + marginRight;

        const totalWidth =
          watchedItems.filter(item => item.liked === true).length * computedCardWidth - marginRight;
        const containerWidth = likedContainerRef.current.offsetWidth;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setLikedMaxTranslateX(maxTranslate);

        const newTranslate = Math.min(likedStartIndex * computedCardWidth, maxTranslate);
        setLikedTranslateX(newTranslate);
      }
    }
  }, [watchedItems, likedStartIndex]);

  // Mise à jour du carrousel "disliked"
  useEffect(() => {
    if (dislikedContainerRef.current) {
      const firstCard = dislikedContainerRef.current.querySelector('.card-item');
      if (firstCard) {
        const style = window.getComputedStyle(firstCard);
        const cardWidth = firstCard.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = cardWidth + marginRight;

        const totalWidth =
          watchedItems.filter(item => item.liked === false).length * computedCardWidth - marginRight;
        const containerWidth = dislikedContainerRef.current.offsetWidth;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setDislikedMaxTranslateX(maxTranslate);

        const newTranslate = Math.min(dislikedStartIndex * computedCardWidth, maxTranslate);
        setDislikedTranslateX(newTranslate);
      }
    }
  }, [watchedItems, dislikedStartIndex]);

  // Fonctions de navigation du carrousel "liked"
  const handleLikedNext = () => setLikedStartIndex((prev) => prev + 1);
  const handleLikedPrevious = () => setLikedStartIndex((prev) => Math.max(prev - 1, 0));
  const isLikedNextDisabled = () => likedTranslateX >= likedMaxTranslateX;

  // Fonctions de navigation du carrousel "disliked"
  const handleDislikedNext = () => setDislikedStartIndex((prev) => prev + 1);
  const handleDislikedPrevious = () => setDislikedStartIndex((prev) => Math.max(prev - 1, 0));
  const isDislikedNextDisabled = () => dislikedTranslateX >= dislikedMaxTranslateX;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const likedItems = watchedItems.filter((item) => item.liked === true);
  const dislikedItems = watchedItems.filter((item) => item.liked === false);

  return (
    <div
      className={`container mx-auto mt-12 px-4 py-8 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <h2 className="text-3xl font-bold mb-6">{t('watchedItems')}</h2>
      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <>
          {/* --- Carrousel pour les items aimés --- */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-2xl font-semibold mb-4">{t('likedItems')}</h3>
            {likedItems.length > 0 ? (
              <div className="relative flex items-center justify-center">
                {/* Bouton gauche */}
                <button
                  onClick={handleLikedPrevious}
                  disabled={likedStartIndex === 0}
                  className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700
                             bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
                >
                  &lt;
                </button>

                {/* Conteneur du carrousel */}
                <div className="overflow-x-hidden mx-auto py-4 liked-carousel-container" ref={likedContainerRef}>
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${likedTranslateX}px)` }}
                  >
                    {likedItems.map((item) => (
                      <div key={item.preference_id} className="card-item flex-shrink-0 mr-10">
                        {item.media_type === 'series' ? (
                          <SerieCard serie={item} />
                        ) : (
                          <MovieCard item={item} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton droit */}
                <button
                  onClick={handleLikedNext}
                  disabled={isLikedNextDisabled()}
                  className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700
                             bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
                >
                  &gt;
                </button>
              </div>
            ) : (
              <p>{t('noWatchedItems')}</p>
            )}
          </div>

          {/* --- Carrousel pour les items non aimés --- */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">{t('dislikedItems')}</h3>
            {dislikedItems.length > 0 ? (
              <div className="relative flex items-center justify-center">
                {/* Bouton gauche */}
                <button
                  onClick={handleDislikedPrevious}
                  disabled={dislikedStartIndex === 0}
                  className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700
                             bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
                >
                  &lt;
                </button>

                {/* Conteneur du carrousel */}
                <div className="overflow-x-hidden mx-auto py-4 disliked-carousel-container" ref={dislikedContainerRef}>
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${dislikedTranslateX}px)` }}
                  >
                    {dislikedItems.map((item) => (
                      <div key={item.preference_id} className="card-item flex-shrink-0 mr-10">
                        {item.media_type === 'series' ? (
                          <SerieCard serie={item} />
                        ) : (
                          <MovieCard item={item} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton droit */}
                <button
                  onClick={handleDislikedNext}
                  disabled={isDislikedNextDisabled()}
                  className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700
                             bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
                >
                  &gt;
                </button>
              </div>
            ) : (
              <p>{t('noWatchedItems')}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WatchedPage;
