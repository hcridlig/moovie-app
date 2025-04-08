// HomePage.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import SerieCard from '../components/SerieCard';
import { getTopMovies, getTopSeries } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
// Ajout du contexte d'authentification pour vérifier si l'utilisateur est connecté
import { AuthContext } from '../contexts/AuthContext';

function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();
  const location = useLocation();
  // Si un message de suppression est passé via la redirection, l'utiliser comme toast
  const [toastMessage, setToastMessage] = useState(location.state?.deletionMessage || '');
  
  // Récupération de l'utilisateur connecté
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000); // disparaît après 3 secondes
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const cardRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [maxTranslateX, setMaxTranslateX] = useState(0);

  // États pour les séries
  const [topSeries, setTopSeries] = useState([]);
  const [seriesStartIndex, setSeriesStartIndex] = useState(0);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);
  const seriesCardRef = useRef(null);
  const [seriesTranslateX, setSeriesTranslateX] = useState(0);
  const [seriesMaxTranslateX, setSeriesMaxTranslateX] = useState(0);

  // Chargement des top movies
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

  // Mesures pour le carrousel des films
  useEffect(() => {
    const updateMeasurements = () => {
      if (cardRef.current) {
        const style = window.getComputedStyle(cardRef.current);
        const width = cardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;

        // Calcul du décalage maximum
        const totalWidth = topMovies.length * computedCardWidth - marginRight;
        const container = document.querySelector('.carousel-container');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setMaxTranslateX(maxTranslate);

        // Calcul du décalage actuel
        const currentTranslate = Math.min(startIndex * computedCardWidth, maxTranslate);
        setTranslateX(currentTranslate);
      }
    };

    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => {
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [topMovies, startIndex]);

  const handleNext = () => {
    setStartIndex((prevIndex) => prevIndex + 1);
  };

  const handlePrevious = () => {
    setStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const isNextDisabled = () => {
    return translateX >= maxTranslateX;
  };

  // Chargement des top series
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

  // Mesures pour le carrousel des séries
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
    return () => {
      window.removeEventListener('resize', updateSeriesMeasurements);
    };
  }, [topSeries, seriesStartIndex]);

  const handleSeriesNext = () => {
    setSeriesStartIndex((prevIndex) => prevIndex + 1);
  };

  const handleSeriesPrevious = () => {
    setSeriesStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const isSeriesNextDisabled = () => {
    return seriesTranslateX >= seriesMaxTranslateX;
  };

  // ============================
  // Ajout de la section "Recommandations pour vous"
  // ============================

  // États et références pour les recommandations films
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recMoviesStartIndex, setRecMoviesStartIndex] = useState(0);
  const [isLoadingRecMovies, setIsLoadingRecMovies] = useState(true);
  const recMovieCardRef = useRef(null);
  const [recMoviesTranslateX, setRecMoviesTranslateX] = useState(0);
  const [recMoviesMaxTranslateX, setRecMoviesMaxTranslateX] = useState(0);

  // États et références pour les recommandations séries
  const [recommendedSeries, setRecommendedSeries] = useState([]);
  const [recSeriesStartIndex, setRecSeriesStartIndex] = useState(0);
  const [isLoadingRecSeries, setIsLoadingRecSeries] = useState(true);
  const recSeriesCardRef = useRef(null);
  const [recSeriesTranslateX, setRecSeriesTranslateX] = useState(0);
  const [recSeriesMaxTranslateX, setRecSeriesMaxTranslateX] = useState(0);

  useEffect(() => {
    if (user) {
      // Concatène les ID des plateformes pour les transmettre en paramètre
      const platformsQuery = user.streamingPlatforms && user.streamingPlatforms.length > 0
        ? `?platforms=${user.streamingPlatforms.join(',')}`
        : '';
      // Récupération des films recommandés en tenant compte (optionnellement) des plateformes
      fetch(`/api/recommendations/movies${platformsQuery}`)
        .then((response) => response.json())
        .then((data) => setRecommendedMovies(data))
        .catch((error) =>
          console.error("Erreur lors du chargement des films recommandés:", error)
        );
  
      // Même logique pour les séries recommandées
      fetch(`/api/recommendations/series${platformsQuery}`)
        .then((response) => response.json())
        .then((data) => setRecommendedSeries(data))
        .catch((error) =>
          console.error("Erreur lors du chargement des séries recommandées:", error)
        );
    }
  }, [user]);

  // Récupération des recommandations ML pour les films
  useEffect(() => {
    if (user) {
      fetch('/api/recommendations/movies')
        .then((response) => response.json())
        .then((data) => {
          setRecommendedMovies(data);
          setIsLoadingRecMovies(false);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des films recommandés:", error);
          setIsLoadingRecMovies(false);
        });
    } else {
      setIsLoadingRecMovies(false);
    }
  }, [user]);

  // Récupération des recommandations ML pour les séries
  useEffect(() => {
    if (user) {
      fetch('/api/recommendations/series')
        .then((response) => response.json())
        .then((data) => {
          setRecommendedSeries(data);
          setIsLoadingRecSeries(false);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des séries recommandées:", error);
          setIsLoadingRecSeries(false);
        });
    } else {
      setIsLoadingRecSeries(false);
    }
  }, [user]);

  // Mesures pour le carrousel des films recommandés
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
    return () => {
      window.removeEventListener('resize', updateRecMovieMeasurements);
    };
  }, [recommendedMovies, recMoviesStartIndex]);

  // Mesures pour le carrousel des séries recommandées
  useEffect(() => {
    const updateRecSeriesMeasurements = () => {
      if (recSeriesCardRef.current) {
        const style = window.getComputedStyle(recSeriesCardRef.current);
        const width = recSeriesCardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        const totalWidth = recommendedSeries.length * computedCardWidth - marginRight;
        const container = document.querySelector('.rec-series-carousel-container');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setRecSeriesMaxTranslateX(maxTranslate);
        const currentTranslate = Math.min(recSeriesStartIndex * computedCardWidth, maxTranslate);
        setRecSeriesTranslateX(currentTranslate);
      }
    };

    updateRecSeriesMeasurements();
    window.addEventListener('resize', updateRecSeriesMeasurements);
    return () => {
      window.removeEventListener('resize', updateRecSeriesMeasurements);
    };
  }, [recommendedSeries, recSeriesStartIndex]);

  // Fonctions de navigation pour le carrousel des films recommandés
  const handleRecMoviesNext = () => {
    setRecMoviesStartIndex((prevIndex) => prevIndex + 1);
  };

  const handleRecMoviesPrevious = () => {
    setRecMoviesStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const isRecMoviesNextDisabled = () => {
    return recMoviesTranslateX >= recMoviesMaxTranslateX;
  };

  // Fonctions de navigation pour le carrousel des séries recommandées
  const handleRecSeriesNext = () => {
    setRecSeriesStartIndex((prevIndex) => prevIndex + 1);
  };

  const handleRecSeriesPrevious = () => {
    setRecSeriesStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const isRecSeriesNextDisabled = () => {
    return recSeriesTranslateX >= recSeriesMaxTranslateX;
  };

  return (
    <div className={`container mx-auto px-4 mt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      {/* Toast de confirmation de suppression */}
      {toastMessage && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mt-14 px-4 py-2 rounded shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'}`}>
          {toastMessage}
        </div>
      )}

      {/* Section Recommandations ML (affichée seulement si l'utilisateur est connecté) */}
      {user && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Recommandations pour vous</h2>
          
          {/* Carrousel des films recommandés */}
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

          {/* Carrousel des séries recommandées */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={handleRecSeriesPrevious}
              disabled={recSeriesStartIndex === 0}
              className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &lt;
            </button>
            <div className="overflow-x-hidden mx-auto py-4 rec-series-carousel-container">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${recSeriesTranslateX}px)` }}
              >
                {isLoadingRecSeries
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        ref={idx === 0 ? recSeriesCardRef : null}
                        className={`flex-shrink-0 ${idx !== recommendedSeries.length - 1 ? 'mr-10' : ''}`}
                      >
                        <MovieSkeleton />
                      </div>
                    ))
                  : recommendedSeries.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        ref={idx === 0 ? recSeriesCardRef : null}
                        className={`flex-shrink-0 ${idx !== recommendedSeries.length - 1 ? 'mr-10' : ''}`}
                      >
                        <SerieCard serie={item} index={idx + 1} />
                      </div>
                    ))}
              </div>
            </div>
            <button
              onClick={handleRecSeriesNext}
              disabled={isRecSeriesNextDisabled()}
              className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &gt;
            </button>
          </div>
        </section>
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
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${translateX}px)` }}>
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
    </div>
  );
}

export default HomePage;
