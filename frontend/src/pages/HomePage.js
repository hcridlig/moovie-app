import React, { useEffect, useState, useContext, useRef } from 'react';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { getTopMovies } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();

  const cardRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [maxTranslateX, setMaxTranslateX] = useState(0);

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

  // Obtenir la largeur de la carte et calculer le décalage maximum
  useEffect(() => {
    const updateMeasurements = () => {
      if (cardRef.current) {
        const style = window.getComputedStyle(cardRef.current);
        const width = cardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        setCardWidth(computedCardWidth);

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

    // Mettre à jour les mesures lors du redimensionnement de la fenêtre
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

  return (
    <div
      className={`container mx-auto px-4 mt-20 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'
      }`}
    >
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t('topMoviesOfTheWeek')}</h2>

        <div className="relative flex items-center justify-center">
          {/* Bouton pour défiler vers la gauche */}
          <button
            onClick={handlePrevious}
            disabled={startIndex === 0}
            className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
          >
            &lt;
          </button>

          {/* Conteneur pour les cartes */}
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

          {/* Bouton pour défiler vers la droite */}
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
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
