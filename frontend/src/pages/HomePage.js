// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const [recommendations, setRecommendations] = useState([]);
  const [topMovies, setTopMovies] = useState([]);

  useEffect(() => {
    // Récupérer les recommandations et le classement depuis l'API
    // Placeholder pour les données simulées
    setRecommendations([
      { id: 1, title: 'Film Recommandé 1', synopsis: 'Synopsis...', image: '/path/to/image', type: 'movie' },
      // Autres films recommandés...
    ]);
    setTopMovies([
      { id: 2, title: 'Top Film 1', synopsis: 'Synopsis...', image: '/path/to/image', type: 'movie' },
      // Autres top films...
    ]);
  }, []);

  const handleSearch = (query) => {
    // Gérer la recherche
    console.log('Recherche pour :', query);
  };

  return (
    <div className="container mx-auto px-4 mt-20">
      <SearchBar onSearch={handleSearch} />

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recommandations pour vous</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Top Films de la Semaine</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topMovies.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;