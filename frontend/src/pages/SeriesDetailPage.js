import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getSerieById } from '../utils/api';
import { FaStar } from 'react-icons/fa';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function SerieDetailPage() {
  const { id } = useParams();
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslation();
  const [serie, setSerie] = useState(null);
  const castScrollRef = useRef(null);

  useEffect(() => {
    const fetchSerieDetail = async () => {
      try {
        const serieData = await getSerieById(id);
        setSerie(serieData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la série :", error);
      }
    };
    fetchSerieDetail();
  }, [id]);

  const scrollLeftCast = () => {
    castScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRightCast = () => {
    castScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (!serie) return <p className="text-center text-xl">{t('loading')}</p>;

  return (
    <div
      className={`container mx-auto px-4 py-8 mt-12 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } rounded-lg shadow-lg`}
    >
      {/* Section principale */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img
          src={serie.posterUrl}
          alt={serie.title}
          className="w-full max-w-sm rounded-lg shadow-lg mb-4 md:mb-0"
        />
        <div className="md:flex-1 space-y-4">
          <h1 className="text-4xl font-bold mb-2">{serie.title}</h1>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex items-center justify-center text-white font-bold">
              <FaStar className="text-yellow-500 w-10 h-10" />
              <span
                className="absolute text-sm font-semibold"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              >
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
              <strong>{t('genres')}:</strong> {serie.genres.map((g) => g.name).join(', ')}
            </p>
          )}
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>{t('seasons')}:</strong> {serie.number_of_seasons}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>{t('episodes')}:</strong> {serie.number_of_episodes}
          </p>
        </div>
      </div>

      {/* Casting en défilement horizontal */}
      {serie.credits && serie.credits.cast && serie.credits.cast.length > 0 && (
        <>
          <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('mainCast')}</h2>
          <div className="relative">
            <button
              onClick={scrollLeftCast}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${
                theme === 'dark'
                  ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75'
                  : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'
              }`}
            >
              &lt;
            </button>
            <div ref={castScrollRef} className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide">
              {serie.credits.cast.slice(0, 12).map((actor) => (
                <div
                  key={actor.id}
                  className={`flex-none w-36 text-center p-4 rounded-lg shadow-md ${
                    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
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
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollRightCast}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${
                theme === 'dark'
                  ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75'
                  : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'
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
