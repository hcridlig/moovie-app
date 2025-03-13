import React, { useEffect, useState, useContext, useRef } from 'react';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import SerieCard from '../components/SerieCard';
import { getTopMovies, getTopSeries } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();

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

  return (
    <div
      className={`container mx-auto px-4 mt-20 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'
      }`}
    >
      {/* Section Top Movies */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t('topMoviesOfTheWeek')}</h2>
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
                      key={item.id}
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
        <h2 className="text-2xl font-semibold mb-4">{t('topSeriesOfTheWeek')}</h2>
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
