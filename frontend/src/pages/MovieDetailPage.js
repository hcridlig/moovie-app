// src/pages/MovieDetailPage.js
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById, getStreamingPlatforms } from '../utils/api';
import { FaStar } from 'react-icons/fa';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function MovieDetailPage() {
  const { id } = useParams();
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();
  const [movie, setMovie] = useState(null);
  const [platforms, setPlatforms] = useState(null);
  const scrollRef = useRef(null);

  // Mapping des plateformes avec une fonction générant l'URL de deep link (ici une recherche) pour le film
  const providerUrls = {
    Netflix: (movie) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`,
    'Amazon Prime Video': (movie) =>
      `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(movie.title)}`,
    Hulu: (movie) =>
      `https://www.hulu.com/search?q=${encodeURIComponent(movie.title)}`,
    'Disney Plus': (movie) =>
      `https://www.disneyplus.com/search?q=${encodeURIComponent(movie.title)}`,
    'HBO Max': (movie) =>
      `https://www.hbomax.com/search?q=${encodeURIComponent(movie.title)}`,
    // Vous pouvez ajouter d'autres plateformes ici
  };
  
  // Mapping des URL de connexion de chaque plateforme
  const providerLoginUrls = {
    Netflix: 'https://www.netflix.com/login',
    'Amazon Prime Video': 'https://www.primevideo.com/ap/signin',
    Hulu: 'https://secure.hulu.com/account',
    'Disney Plus': 'https://www.disneyplus.com/login',
    'HBO Max': 'https://www.hbomax.com/login',
    // Ajoutez d'autres URL de connexion si nécessaire
  };

  // Gestion du clic sur une icône de plateforme
  const handleProviderClick = (provider, event) => {
    event.preventDefault();
    // Demande de confirmation : l'utilisateur est-il connecté à cette plateforme ?
    const isConnected = window.confirm(
      `Êtes-vous connecté à ${provider.provider_name} ? Cliquez sur OK si oui, sinon sur Annuler pour vous connecter.`
    );
    if (isConnected) {
      // Redirection vers le deep link (ici la recherche du film)
      window.open(providerUrls[provider.provider_name](movie), "_blank");
    } else {
      // Redirection vers la page de connexion de la plateforme
      window.open(providerLoginUrls[provider.provider_name] || providerUrls[provider.provider_name](movie), "_blank");
    }
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieData = await getMovieById(id);
        setMovie(movieData);

        const platformData = await getStreamingPlatforms(id, 'FR'); // Récupération pour la France
        setPlatforms(platformData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du film :", error);
      }
    };
    fetchMovieDetails();
  }, [id]);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (!movie) return <p className="text-center text-xl">{t('loading')}</p>;

  return (
    <div className={`container mx-auto px-4 py-8 mt-12 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg shadow-lg`}>
      {/* Section principale */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img src={movie.image} alt={movie.title} className="w-full max-w-sm rounded-lg shadow-lg mb-4 md:mb-0" />
        
        <div className="md:flex-1 space-y-4">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>

          {/* Présentation de la note */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex items-center justify-center text-white font-bold">
              <FaStar className="text-yellow-500 w-10 h-10" />
              <span className="absolute text-sm font-semibold" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm">{movie.vote_count} votes</span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{movie.overview}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('releaseDate')}:</strong> {movie.release_date}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('runtime')}:</strong> {movie.runtime} {t('minutes')}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('genres')}:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('budget')}:</strong> ${movie.budget.toLocaleString()}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('revenue')}:</strong> ${movie.revenue.toLocaleString()}</p>
          
          {/* Section des plateformes de streaming */}
          {platforms && (
            <div className="my-4">
              <h3 className="text-lg font-semibold mb-2">{t('availableOn')}</h3>
              <div className="flex space-x-4">
                {platforms.flatrate && platforms.flatrate.map((provider) => (
                  <a
                    key={provider.provider_id}
                    href="#"
                    onClick={(e) => handleProviderClick(provider, e)}
                    className="block"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="h-12 w-auto rounded-md shadow-md"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Casting en défilement horizontal */}
      <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('mainCast')}</h2>
      <div className="relative">
        <button
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}
        >
          &lt;
        </button>
        <div ref={scrollRef} className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide">
          {movie.credits?.cast.slice(0, 12).map((actor) => (
            <div 
              key={actor.id} 
              className={`flex-none w-36 text-center p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <img 
                src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://cdn.icon-icons.com/icons2/154/PNG/512/user_21980.png'}
                alt={actor.name} 
                className="w-full h-36 object-cover rounded-lg mb-2" 
              />
              <p className="font-semibold text-sm truncate">{actor.name}</p>
              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{actor.character}</p>
            </div>
          ))}
        </div>
        <button
          onClick={scrollRight}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default MovieDetailPage;
