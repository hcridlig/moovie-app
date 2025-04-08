import React, { useEffect, useState, useContext, useRef } from 'react';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import SerieCard from '../components/SerieCard';
import { getTopMovies, getTopSeries, getMovieById } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function HomePage() {
  // États pour Top Movies
  const [topMovies, setTopMovies] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [maxTranslateX, setMaxTranslateX] = useState(0);

  // États pour Top Series
  const [topSeries, setTopSeries] = useState([]);
  const [seriesStartIndex, setSeriesStartIndex] = useState(0);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);
  const seriesCardRef = useRef(null);
  const [seriesTranslateX, setSeriesTranslateX] = useState(0);
  const [seriesMaxTranslateX, setSeriesMaxTranslateX] = useState(0);

  // États pour les recommandations (films uniquement)
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recMoviesStartIndex, setRecMoviesStartIndex] = useState(0);
  const [isLoadingRecMovies, setIsLoadingRecMovies] = useState(true);
  const recMovieCardRef = useRef(null);
  const [recMoviesTranslateX, setRecMoviesTranslateX] = useState(0);
  const [recMoviesMaxTranslateX, setRecMoviesMaxTranslateX] = useState(0);

  // Contextes et hooks supplémentaires
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const [toastMessage, setToastMessage] = useState(location.state?.deletionMessage || '');

  // Gestion du toast de confirmation
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Chargement des Top Movies
  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const topMoviesData = await getTopMovies();
        setTopMovies(topMoviesData);
      } catch (error) {
        console.error('Erreur lors de la récupération des meilleurs films:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopMovies();
  }, []);

  // Calcul du translateX pour le carrousel des Top Movies
  useEffect(() => {
    const updateMeasurements = () => {
      if (cardRef.current) {
        const style = window.getComputedStyle(cardRef.current);
        const width = cardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        const totalWidth = topMovies.length * computedCardWidth - marginRight;
        const container = document.querySelector('.carousel-container');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setMaxTranslateX(maxTranslate);
        const currentTranslate = Math.min(startIndex * computedCardWidth, maxTranslate);
        setTranslateX(currentTranslate);
      }
    };

    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, [topMovies, startIndex]);

  const handleNext = () => setStartIndex((prev) => prev + 1);
  const handlePrevious = () => setStartIndex((prev) => (prev > 0 ? prev - 1 : 0));
  const isNextDisabled = () => translateX >= maxTranslateX;

  // Chargement des Top Series
  useEffect(() => {
    const fetchTopSeries = async () => {
      try {
        const topSeriesData = await getTopSeries();
        setTopSeries(topSeriesData);
      } catch (error) {
        console.error('Erreur lors de la récupération des meilleures séries:', error);
      } finally {
        setIsLoadingSeries(false);
      }
    };
    fetchTopSeries();
  }, []);

  // Calcul du translateX pour le carrousel des Top Series
  useEffect(() => {
    const updateSeriesMeasurements = () => {
      if (seriesCardRef.current) {
        const style = window.getComputedStyle(seriesCardRef.current);
        const width = seriesCardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        const totalWidth = topSeries.length * computedCardWidth - marginRight;
        const container = document.querySelector('.series-carousel-container');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setSeriesMaxTranslateX(maxTranslate);
        const currentTranslate = Math.min(seriesStartIndex * computedCardWidth, maxTranslate);
        setSeriesTranslateX(currentTranslate);
      }
    };

    updateSeriesMeasurements();
    window.addEventListener('resize', updateSeriesMeasurements);
    return () => window.removeEventListener('resize', updateSeriesMeasurements);
  }, [topSeries, seriesStartIndex]);

  const handleSeriesNext = () => setSeriesStartIndex((prev) => prev + 1);
  const handleSeriesPrevious = () => setSeriesStartIndex((prev) => (prev > 0 ? prev - 1 : 0));
  const isSeriesNextDisabled = () => seriesTranslateX >= seriesMaxTranslateX;

  // Chargement des recommandations (films) pour l'utilisateur connecté
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      fetch(`${process.env.REACT_APP_API_URL}/users/me/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(async (data) => {
          // data est un tableau d'objets { neighbor_movie_id: 1234, ... }
          // Pour chaque neighbor_movie_id, on récupère le vrai film (titre, image, etc.) via getMovieById
          const moviesWithDetails = await Promise.all(
            data.map(async (item) => {
              const details = await getMovieById(item.neighbor_movie_id);
              // details inclut le poster_path => details.image, le titre => details.title, etc.
              return {
                ...details, // inclut .id, .title, .image, etc.
                id: details.id, // rassure qu'on utilise l'id correct
              };
            })
          );
          setRecommendedMovies(moviesWithDetails);
          setIsLoadingRecMovies(false);
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des films recommandés:', error);
          setIsLoadingRecMovies(false);
        });
    } else {
      setIsLoadingRecMovies(false);
    }
  }, [isAuthenticated]);

  // Calcul du translateX pour le carrousel des recommandations
  useEffect(() => {
    const updateRecMovieMeasurements = () => {
      if (recMovieCardRef.current) {
        const style = window.getComputedStyle(recMovieCardRef.current);
        const width = recMovieCardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        const totalWidth = recommendedMovies.length * computedCardWidth - marginRight;
        const container = document.querySelector('.rec-movies-carousel-container');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setRecMoviesMaxTranslateX(maxTranslate);
        const currentTranslate = Math.min(recMoviesStartIndex * computedCardWidth, maxTranslate);
        setRecMoviesTranslateX(currentTranslate);
      }
    };

    updateRecMovieMeasurements();
    window.addEventListener('resize', updateRecMovieMeasurements);
    return () => window.removeEventListener('resize', updateRecMovieMeasurements);
  }, [recommendedMovies, recMoviesStartIndex]);

  const handleRecMoviesNext = () => setRecMoviesStartIndex((prev) => prev + 1);
  const handleRecMoviesPrevious = () => setRecMoviesStartIndex((prev) => (prev > 0 ? prev - 1 : 0));
  const isRecMoviesNextDisabled = () => recMoviesTranslateX >= recMoviesMaxTranslateX;

  return (
    <div className={`container mx-auto px-4 mt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mt-14 px-4 py-2 rounded shadow-md ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Section Top Movies */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">{t('topMoviesOfTheWeek')}</h2>
        <div className="relative flex items-center justify-center">
          <button
            onClick={handlePrevious}
            disabled={startIndex === 0}
            className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
          >
            &lt;
          </button>
          <div className="overflow-x-hidden mx-auto py-4 carousel-container">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${translateX}px)` }}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      ref={idx === 0 ? cardRef : null}
                      className={`flex-shrink-0 ${idx !== topMovies.length - 1 ? 'mr-10' : ''}`}
                    >
                      <MovieSkeleton />
                    </div>
                  ))
                : topMovies.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      ref={idx === 0 ? cardRef : null}
                      className={`flex-shrink-0 ${idx !== topMovies.length - 1 ? 'mr-10' : ''}`}
                    >
                      <MovieCard item={item} index={idx + 1} />
                    </div>
                  ))}
            </div>
          </div>
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
          >
            &gt;
          </button>
        </div>
      </section>

      {/* Section Top Series */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">{t('topSeriesOfTheWeek')}</h2>
        <div className="relative flex items-center justify-center">
          <button
            onClick={handleSeriesPrevious}
            disabled={seriesStartIndex === 0}
            className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
          >
            &lt;
          </button>
          <div className="overflow-x-hidden mx-auto py-4 series-carousel-container">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${seriesTranslateX}px)` }}
            >
              {isLoadingSeries
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      ref={idx === 0 ? seriesCardRef : null}
                      className={`flex-shrink-0 ${idx !== topSeries.length - 1 ? 'mr-10' : ''}`}
                    >
                      <MovieSkeleton />
                    </div>
                  ))
                : topSeries.map((item, idx) => (
                    <div
                      key={item.id}
                      ref={idx === 0 ? seriesCardRef : null}
                      className={`flex-shrink-0 ${idx !== topSeries.length - 1 ? 'mr-10' : ''}`}
                    >
                      <SerieCard serie={item} index={idx + 1} />
                    </div>
                  ))}
            </div>
          </div>
          <button
            onClick={handleSeriesNext}
            disabled={isSeriesNextDisabled()}
            className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
          >
            &gt;
          </button>
        </div>
      </section>

      {/* Section Recommandations (affichée si l'utilisateur est authentifié) */}
      {isAuthenticated && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Recommandations pour vous</h2>
          <div className="relative flex items-center justify-center mb-8">
            <button
              onClick={handleRecMoviesPrevious}
              disabled={recMoviesStartIndex === 0}
              className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &lt;
            </button>
            <div className="overflow-x-hidden mx-auto py-4 rec-movies-carousel-container">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${recMoviesTranslateX}px)` }}
              >
                {isLoadingRecMovies
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        ref={idx === 0 ? recMovieCardRef : null}
                        className={`flex-shrink-0 ${idx !== recommendedMovies.length - 1 ? 'mr-10' : ''}`}
                      >
                        <MovieSkeleton />
                      </div>
                    ))
                  : recommendedMovies.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        ref={idx === 0 ? recMovieCardRef : null}
                        className={`flex-shrink-0 ${idx !== recommendedMovies.length - 1 ? 'mr-10' : ''}`}
                      >
                        <MovieCard item={item} index={idx + 1} />
                      </div>
                    ))}
              </div>
            </div>
            <button
              onClick={handleRecMoviesNext}
              disabled={isRecMoviesNextDisabled()}
              className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &gt;
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
