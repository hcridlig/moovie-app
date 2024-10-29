// HomePage.js

import React, { useEffect, useState, useContext } from 'react';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { getTopMovies } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const [startIndex, setStartIndex] = useState(0); // Index pour la première carte visible
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();

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

  // Fonction pour afficher la série suivante de cartes
  const handleNext = () => {
    if (startIndex + 5 < topMovies.length) {
      setStartIndex(startIndex + 5);
    }
  };

  // Fonction pour afficher la série précédente de cartes
  const handlePrevious = () => {
    if (startIndex - 5 >= 0) {
      setStartIndex(startIndex - 5);
    }
  };

  return (
    <div className={`container mx-auto px-4 mt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      <SearchBar onSearch={(query) => console.log('Recherche pour :', query)} />

      <section className="mt-12 relative">
        <h2 className="text-2xl font-semibold mb-4">{t('topMoviesOfTheWeek')}</h2>

        {/* Bouton pour défiler vers la gauche */}
        <button
          onClick={handlePrevious}
          disabled={startIndex === 0} // Désactiver si au début
          className="absolute left-[-1rem] top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
        >
          &lt;
        </button>

        {/* Affichage des cartes visibles */}
        <div className="grid grid-cols-5 gap-4">
          {topMovies.slice(startIndex, startIndex + 5).map((item, idx) => (
            <MovieCard key={item.id} item={item} index={startIndex + idx + 1} />
          ))}
        </div>

        {/* Bouton pour défiler vers la droite */}
        <button
          onClick={handleNext}
          disabled={startIndex + 5 >= topMovies.length} // Désactiver si à la fin
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
        >
          &gt;
        </button>
      </section>
    </div>
  );
}

export default HomePage;
