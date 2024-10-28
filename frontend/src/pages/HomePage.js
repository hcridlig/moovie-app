// src/pages/HomePage.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { getTopMovies } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const topMoviesData = await getTopMovies();
        setTopMovies(topMoviesData);
      } catch (error) {
        console.error('Erreur lors de la récupération des meilleurs films:', error);
      }
    };

    fetchTopMovies();
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className={`container mx-auto px-4 mt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      {/* Barre de recherche */}
      <SearchBar onSearch={(query) => console.log('Recherche pour :', query)} />

      {/* Section des recommandations */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">{t('recommendationsForYou')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Les recommandations peuvent être ajoutées ici si disponibles */}
        </div>
      </section>

      {/* Section des meilleurs films de la semaine avec défilement horizontal */}
      <section className="mt-12 relative">
        <h2 className="text-2xl font-semibold mb-4">{t('topMoviesOfTheWeek')}</h2>

        {/* Flèche pour défiler vers la gauche */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
        >
          &lt;
        </button>

        {/* Conteneur des cartes avec défilement horizontal */}
        <div ref={scrollRef} className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide">
          {topMovies.slice(0, 5).map((item) => ( // Limitez initialement à 5 cartes visibles
            <MovieCard key={item.id} item={item} />
          ))}
        </div>

        {/* Flèche pour défiler vers la droite */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
        >
          &gt;
        </button>
      </section>
    </div>
  );
}

export default HomePage;
