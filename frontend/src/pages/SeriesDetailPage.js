// SeriesDetailPage.js

import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getSerieById, getTVStreamingPlatforms, addPreference } from '../utils/api';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { SettingsContext } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

function SerieDetailPage() {
  const { id } = useParams();
  const { theme, country } = useContext(SettingsContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();

  const [serie, setSerie] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [userOpinion, setUserOpinion] = useState(null);
  const castScrollRef = useRef(null);

  const providerUrls = {
    Netflix: (serie) => `https://www.netflix.com/search?q=${encodeURIComponent(serie.title)}`,
    'Amazon Prime Video': (serie) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(serie.title)}`,
    'Disney Plus': (serie) => `https://www.disneyplus.com/search?q=${encodeURIComponent(serie.title)}`,
    Max: (serie) => `https://play.max.com/search/result?q=${encodeURIComponent(serie.title)}`,
    'Apple TV+': (serie) => `https://tv.apple.com/search?term=${encodeURIComponent(serie.title)}`,
    'Canal Plus': (serie) => `https://www.canalplus.com/login`,
    Crunchyroll: (serie) => `https://www.crunchyroll.com/fr/search?q=${encodeURIComponent(serie.title)}`,
    'Paramount Plus': (serie) => `https://www.paramountplus.com/shows/${encodeURIComponent(serie.title)}`,
    'TF1+': (serie) => `https://www.tf1.fr/programmes-tv/series?q=${encodeURIComponent(serie.title)}`,
  };

  const providerLoginUrls = {
    Netflix: 'https://www.netflix.com/login',
    'Amazon Prime Video': 'https://www.primevideo.com/ap/signin',
    'Disney Plus': 'https://www.disneyplus.com/login',
    Max: 'https://auth.max.com/login',
    'Apple TV+': 'https://tv.apple.com/login',
    'Canal Plus': 'https://www.canalplus.com/login',
    Crunchyroll: `https://sso.crunchyroll.com/fr/login`,
    'Paramount Plus': `https://www.paramountplus.com/fr/account/signin/`,
    'TF1+': `https://www.tf1.fr/compte/connexion`,
  };

  const handleProviderClick = (provider, event) => {
    event.preventDefault();
    const isConnected = window.confirm(
      `Êtes-vous connecté à ${provider.provider_name} ? Cliquez sur OK si oui, sinon sur Annuler pour vous connecter.`
    );
    if (isConnected) {
      window.open(providerUrls[provider.provider_name](serie), "_blank");
    } else {
      window.open(
        providerLoginUrls[provider.provider_name] ||
          providerUrls[provider.provider_name](serie),
        "_blank"
      );
    }
  };

  const handleOpinion = async (opinion) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour noter la série.");
      return;
    }
    if (userOpinion === opinion) return;
    try {
      await addPreference({
        movieId: Number(id),
        liked: (opinion === 'like'),
        media_type: 'series'
      });
      setUserOpinion(opinion);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la série aux contenus visionnés :", error);
    }
  };

  useEffect(() => {
    const fetchSerieDetail = async () => {
      try {
        const serieData = await getSerieById(id);
        setSerie(serieData);
        const selectedCountry = country || 'FR';
        const platformsData = await getTVStreamingPlatforms(id, selectedCountry);
        setPlatforms(platformsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la série :", error);
      }
    };
    fetchSerieDetail();
  }, [id, country]);

  const scrollLeftCast = () => {
    castScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRightCast = () => {
    castScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (!serie) return <p className="text-center text-xl">{t('loading')}</p>;

  return (
    <div className={`container mx-auto px-4 py-8 mt-12 ${theme==='dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg shadow-lg`}>
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img src={serie.posterUrl} alt={serie.title} className="w-full max-w-sm rounded-lg shadow-lg mb-4 md:mb-0" />
        <div className="md:flex-1 space-y-4">
          <h1 className="text-4xl font-bold mb-2">{serie.title}</h1>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex items-center justify-center text-white font-bold">
              <FaStar className="text-yellow-500 w-10 h-10" />
              <span className="absolute text-sm font-semibold" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {serie.vote_average.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {serie.vote_count} {t('votes')}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{serie.overview}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>{t('firstAirDate')}:</strong> {serie.first_air_date}
          </p>
          {serie.episode_run_time && serie.episode_run_time.length > 0 && (
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>{t('runtime')}:</strong> {serie.episode_run_time[0]} {t('minutes')}
            </p>
          )}
          {serie.genres && (
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>{t('genres')}:</strong> {serie.genres.map(g => g.name).join(', ')}
            </p>
          )}
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>{t('seasons')}:</strong> {serie.number_of_seasons}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>{t('episodes')}:</strong> {serie.number_of_episodes}
          </p>
          {isAuthenticated && (
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={() => handleOpinion('like')}
                className={`p-2 rounded-full transform transition duration-200 active:scale-95 ${
                  userOpinion === 'like'
                    ? 'bg-green-500 bg-opacity-70 text-white'
                    : 'bg-green-500 bg-opacity-20 text-green-700'
                }`}
              >
                <FaThumbsUp size={20} />
              </button>
              <button
                onClick={() => handleOpinion('dislike')}
                className={`p-2 rounded-full transform transition duration-200 active:scale-95 ${
                  userOpinion === 'dislike'
                    ? 'bg-red-500 bg-opacity-70 text-white'
                    : 'bg-red-500 bg-opacity-20 text-red-700'
                }`}
              >
                <FaThumbsDown size={20} />
              </button>
            </div>
          )}
          <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">{t('availableOn')}</h3>
            {platforms && platforms.length > 0 ? (
              <div className="flex space-x-4">
                {platforms.map((provider) => (
                  <button
                    key={provider.provider_id}
                    onClick={(e) => handleProviderClick(provider, e)}
                    className="block bg-transparent border-none p-0 cursor-pointer"
                    aria-label={provider.provider_name}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="h-12 w-auto rounded-md shadow-md"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300">
                {t('notAvailableInCountry') || 'Non disponible dans ce pays'}
              </div>
            )}
          </div>
        </div>
      </div>
      {serie.credits && serie.credits.cast && serie.credits.cast.length > 0 && (
        <>
          <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('mainCast')}</h2>
          <div className="relative">
            <button
              onClick={scrollLeftCast}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${
                theme==='dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'
              }`}
            >
              &lt;
            </button>
            <div ref={castScrollRef} className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide">
              {serie.credits.cast.slice(0, 12).map((actor) => (
                <div
                  key={actor.id}
                  className={`flex-none w-36 text-center p-4 rounded-lg shadow-md ${
                    theme==='dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : 'https://cdn.icon-icons.com/icons2/154/PNG/512/user_21980.png'
                    }
                    alt={actor.name}
                    className="w-full h-36 object-cover rounded-lg mb-2"
                  />
                  <p className="font-semibold text-sm truncate">{actor.name}</p>
                  <p className={`text-xs truncate ${theme==='dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollRightCast}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${
                theme==='dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'
              }`}
            >
              &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SerieDetailPage;
