import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  getMovieById,
  getStreamingPlatforms,
  addPreference,
  removePreference,
  getUserPreferences
} from '../utils/api';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { SettingsContext } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import MovieCard from '../components/MovieCard';
import SerieCard from '../components/SerieCard';
import MovieSkeleton from '../components/MovieSkeleton';

function MovieDetailPage() {
  const { id } = useParams();
  const { theme, country } = useContext(SettingsContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();

  // États principaux
  const [movie, setMovie] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [userOpinion, setUserOpinion] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  // Carrousel recommandations
  const scrollRef = useRef(null);
  const [recStartIndex, setRecStartIndex] = useState(0);
  const [recTranslateX, setRecTranslateX] = useState(0);
  const [recMaxTranslateX, setRecMaxTranslateX] = useState(0);
  const recCardRef = useRef(null);

  // Équipe technique (crew)
  const crewScrollRef = useRef(null);
  const scrollLeftCrew = () => {
    crewScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRightCrew = () => {
    crewScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };
  const filteredCrew = movie?.credits?.crew.filter(member =>
    ['Director', 'Screenplay', 'Writer', 'Composer', 'Original Music Composer'].includes(member.job)
  ) || [];

  const providerUrls = {
    Netflix: (movie) => `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`,
    'Amazon Prime Video': (movie) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(movie.title)}`,
    'Disney Plus': (movie) => `https://www.disneyplus.com/search?q=${encodeURIComponent(movie.title)}`,
    Max: (movie) => `https://play.max.com/search/result?q=${encodeURIComponent(movie.title)}`,
    'Apple TV+': (movie) => `https://tv.apple.com/search?term=${encodeURIComponent(movie.title)}`,
    'Canal Plus': (movie) => `https://www.canalplus.com/cinema/${encodeURIComponent(movie.title)}`,
    Crunchyroll: (movie) => `https://www.crunchyroll.com/fr/search?q=${encodeURIComponent(movie.title)}`,
    'Paramount Plus': (movie) => `https://www.paramountplus.com/search?q=${encodeURIComponent(movie.title)}`,
    'TF1+': (movie) => `https://www.tf1.fr/programmes-tv?q=${encodeURIComponent(movie.title)}`
  };

  const providerLoginUrls = {
    Netflix: 'https://www.netflix.com/login',
    'Amazon Prime Video': 'https://www.primevideo.com/ap/signin',
    'Disney Plus': 'https://www.disneyplus.com/login',
    Max: 'https://auth.max.com/login',
    'Apple TV+': 'https://tv.apple.com/login',
    'Canal Plus': 'https://www.canalplus.com',
    Crunchyroll: `https://sso.crunchyroll.com/fr/login`,
    'Paramount Plus': `https://www.paramountplus.com/fr/account/signin/`,
    'TF1+': `https://www.tf1.fr/compte/connexion`
  };

  // États pour la filmographie d’un acteur
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorFilmography, setActorFilmography] = useState([]);
  const [actorCarouselIndex, setActorCarouselIndex] = useState(0);
  // État pour contrôler l’affichage animé de la filmographie
  const [filmographyVisible, setFilmographyVisible] = useState(false);
  const filmographyContentRef = useRef(null);
  const [filmographyMaxHeight, setFilmographyMaxHeight] = useState("0px");
  const cardWidth = 220; // Largeur d'une carte incluant marge

  // Récupération du film et plateformes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieData = await getMovieById(id);
        setMovie(movieData);
        const selectedCountry = country || 'FR';
        const platformData = await getStreamingPlatforms(id, selectedCountry);
        setPlatforms(platformData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du film :", error);
      }
    };
    fetchMovieDetails();
  }, [id, country]);

  // Préférence utilisateur
  useEffect(() => {
    const fetchUserPreference = async () => {
      try {
        const preferences = await getUserPreferences();
        const pref = preferences.find(p =>
          Number(p.movie_id) === Number(movie?.id) &&
          (p.mediaType === 'movie' || p.media_type === 'movie')
        );
        if (pref) {
          setUserOpinion(pref.liked ? 'like' : 'dislike');
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la préférence utilisateur :", error);
      }
    };
    if (movie) {
      fetchUserPreference();
    }
  }, [movie]);

  // Recommandations
  useEffect(() => {
    if (movie) {
      fetch(`${process.env.REACT_APP_API_URL}/movies/recommended/${movie.id}`)
        .then(res => res.json())
        .then(data => {
          return Promise.all(
            data.map(async rec => {
              try {
                const fullMovieData = await getMovieById(rec.movie_id);
                return fullMovieData;
              } catch (error) {
                console.error(`Erreur lors de la récupération du film ${rec.movie_id}`, error);
                return null;
              }
            })
          );
        })
        .then(fullMovies => {
          setRecommendedMovies(fullMovies.filter(m => m));
          setRecLoading(false);
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des recommandations :", error);
          setRecLoading(false);
        });
    }
  }, [movie]);

  // Mesures pour le carrousel de recommandations
  useEffect(() => {
    const updateRecMeasurements = () => {
      if (recCardRef.current && recommendedMovies.length > 0) {
        const style = window.getComputedStyle(recCardRef.current);
        const width = recCardRef.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        const totalWidth = recommendedMovies.length * computedCardWidth - marginRight;
        const container = document.querySelector('.rec-carousel-container');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setRecMaxTranslateX(maxTranslate);
        const currentTranslate = Math.min(recStartIndex * computedCardWidth, maxTranslate);
        setRecTranslateX(currentTranslate);
      }
    };

    updateRecMeasurements();
    window.addEventListener('resize', updateRecMeasurements);
    return () => window.removeEventListener('resize', updateRecMeasurements);
  }, [recommendedMovies, recStartIndex]);

  const handleRecNext = () => setRecStartIndex(prev => prev + 1);
  const handleRecPrevious = () => setRecStartIndex(prev => (prev > 0 ? prev - 1 : 0));
  const isRecNextDisabled = () => recTranslateX >= recMaxTranslateX;

  // Gestion du like/dislike
  const handleOpinion = async (opinion) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour noter le film.");
      return;
    }
    if (userOpinion === opinion) {
      try {
        await removePreference({ movieId: movie.id, mediaType: 'movie' });
        setUserOpinion(null);
      } catch (error) {
        console.error("Erreur lors de la suppression de la préférence :", error);
      }
      return;
    }
    try {
      await addPreference({
        movieId: movie.id,
        liked: opinion === 'like',
        mediaType: 'movie'
      });
      setUserOpinion(opinion);
    } catch (error) {
      console.error("Erreur lors de l'ajout du film aux contenus visionnés :", error);
    }
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const isNowPlaying = () => {
    if (!movie || !movie.release_date) return false;
    const releaseDate = new Date(movie.release_date);
    const now = new Date();
    const diffDays = (now - releaseDate) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 30;
  };

  // ========= Filmographie avec animation slide-down =========
  const handleActorClick = (actor, e) => {
    if (selectedActor && selectedActor.id === actor.id) {
      // Rétractation : on lance l'animation de fermeture
      setFilmographyVisible(false);
      setTimeout(() => {
        setSelectedActor(null);
        setActorFilmography([]);
      }, 500); // durée de la transition
    } else {
      setSelectedActor(actor);
      fetchActorFilmography(actor.id);
      // Affichage de la filmographie avec un léger délai
      setTimeout(() => {
        setFilmographyVisible(true);
      }, 50);
    }
  };

  const fetchActorFilmography = async (actorId) => {
    try {
      const apiKey = process.env.API_KEY_TMDB || "4edc74f5d6c3356f7a70a0ff694ecf1b";
      const response = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}/combined_credits?api_key=${apiKey}&language=fr-FR`
      );
      const data = await response.json();
      let filmography = data.cast.filter(item =>
        item.media_type === 'movie' || item.media_type === 'tv'
      );
      // Retirer les doublons (basé sur id et media_type)
      filmography = filmography.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id && t.media_type === item.media_type)
      );
      filmography.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date);
        const dateB = new Date(b.release_date || b.first_air_date);
        return dateB - dateA;
      });
      setActorFilmography(filmography);
    } catch (error) {
      console.error("Erreur lors de la récupération de la filmographie de l'acteur:", error);
    }
  };

  const handleActorCarouselPrevious = () => {
    setActorCarouselIndex(prev => (prev > 0 ? prev - 1 : 0));
  };
  const handleActorCarouselNext = () => {
    const maxIndex = Math.max(actorFilmography.length - 3, 0);
    setActorCarouselIndex(prev => (prev < maxIndex ? prev + 1 : prev));
  };

  // Animation de la filmographie avec transition sur max-height et opacité
  useEffect(() => {
    if (filmographyVisible && filmographyContentRef.current) {
      setFilmographyMaxHeight(filmographyContentRef.current.scrollHeight + "px");
    } else {
      setFilmographyMaxHeight("0px");
    }
  }, [filmographyVisible, actorFilmography]);

  // =================================================

  if (!movie) return <p className="text-center text-xl">{t('loading')}</p>;

  return (
    <div className={`container mx-auto px-4 py-8 mt-12 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg shadow-lg`}>
      {/* Détails du film */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img src={movie.image} alt={movie.title} className="w-full max-w-sm rounded-lg shadow-lg mb-4 md:mb-0" />
        <div className="md:flex-1 space-y-4">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex items-center justify-center text-white font-bold">
              <FaStar className="text-yellow-500 w-10 h-10" />
              <span className="absolute text-sm font-semibold" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {movie.vote_count} {t('votes')}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{movie.overview}</p>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300"><strong>{t('releaseDate')}:</strong> {movie.release_date}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>{t('runtime')}:</strong> {movie.runtime} {t('minutes')}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>{t('genres')}:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>{t('budget')}:</strong> ${movie.budget.toLocaleString()}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>{t('revenue')}:</strong> ${movie.revenue.toLocaleString()}</p>
            {isAuthenticated && (
              <div className="flex items-center space-x-4 mt-4">
                <button onClick={() => handleOpinion('like')}
                  className={`p-2 rounded-full transform transition duration-200 active:scale-95 ${userOpinion === 'like' ? 'bg-green-500 bg-opacity-70 text-white' : 'bg-green-500 bg-opacity-20 text-green-700'}`}>
                  <FaThumbsUp size={20} />
                </button>
                <button onClick={() => handleOpinion('dislike')}
                  className={`p-2 rounded-full transform transition duration-200 active:scale-95 ${userOpinion === 'dislike' ? 'bg-red-500 bg-opacity-70 text-white' : 'bg-red-500 bg-opacity-20 text-red-700'}`}>
                  <FaThumbsDown size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">{t('availableOn')}</h3>
            {platforms && platforms.length > 0 ? (
              <div className="flex space-x-4">
                {platforms.map((provider) => (
                  <button key={provider.provider_id}
                    onClick={(e) => {
                      e.preventDefault();
                      const isConnected = window.confirm(`Êtes-vous connecté à ${provider.provider_name} ? Cliquez sur OK si oui, sinon sur Annuler pour vous connecter.`);
                      if (isConnected) {
                        window.open(providerUrls[provider.provider_name](movie), "_blank");
                      } else {
                        window.open(providerLoginUrls[provider.provider_name] || providerUrls[provider.provider_name](movie), "_blank");
                      }
                    }}
                    className="block bg-transparent border-none p-0 cursor-pointer"
                    aria-label={provider.provider_name}>
                    <img src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="h-12 w-auto rounded-md shadow-md" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300">
                {isNowPlaying() ? t('currentlyInTheaters') || 'Actuellement au cinéma' : t('notAvailableInCountry') || 'Non disponible dans ce pays'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Casting */}
      <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('mainCast')}</h2>
      <div className="relative">
        <button onClick={scrollLeft}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}>
          &lt;
        </button>
        <div ref={scrollRef} className="flex overflow-x-scroll space-x-4 pt-4 pb-4 scrollbar-hide">
          {movie.credits?.cast.map((actor) => (
            <div key={actor.id}
              onClick={(e) => handleActorClick(actor, e)}
              className={`flex-none w-36 text-center p-4 rounded-lg shadow-md cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${selectedActor && selectedActor.id === actor.id ? 'ring-4 ring-indigo-500' : ''}`}>
              <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://cdn.icon-icons.com/icons2/154/PNG/512/user_21980.png'}
                alt={actor.name}
                className="w-full h-36 object-cover rounded-lg mb-2" />
              <p className="font-semibold text-sm truncate">{actor.name}</p>
              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{actor.character}</p>
            </div>
          ))}
        </div>
        <button onClick={scrollRight}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}>
          &gt;
        </button>
      </div>

      {/* Bloc animé de filmographie (intégré dans le flux, avec fond englobant l'acteur sélectionné) */}
      {selectedActor && (
        <div className={`filmography-container rounded-lg shadow-lg p-4 mt-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          style={{
            maxHeight: filmographyMaxHeight,
            opacity: filmographyVisible ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 500ms ease-in-out, opacity 500ms ease-in-out'
          }}>
          <div ref={filmographyContentRef}>
            <style>{`
              .filmography-card h3 {
                color: ${theme === 'dark' ? '#ffffff' : '#1a202c'} !important;
              }
            `}</style>
            <div className="flex items-center space-x-4 mb-4">
              <img src={selectedActor.profile_path ? `https://image.tmdb.org/t/p/w185${selectedActor.profile_path}` : 'https://cdn.icon-icons.com/icons2/154/PNG/512/user_21980.png'}
                alt={selectedActor.name}
                className="w-24 h-24 object-cover rounded-full" />
              <h3 className="text-2xl font-bold">{selectedActor.name}</h3>
            </div>
            <div className="relative">
              <button onClick={handleActorCarouselPrevious}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2">
                &lt;
              </button>
              <div className="overflow-x-hidden pb-8">
                <div className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${actorCarouselIndex * cardWidth}px)` }}>
                  {actorFilmography.length > 0 ? (
                    actorFilmography.map((credit) => (
                      <div key={credit.id} className="flex-shrink-0 mr-4 filmography-card">
                        {credit.media_type === 'movie' ? (
                          <MovieCard
                            item={{
                              id: credit.id,
                              image: credit.poster_path ? `https://image.tmdb.org/t/p/w500${credit.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
                              title: credit.title || credit.original_title,
                            }}
                          />
                        ) : (
                          <SerieCard
                            serie={{
                              id: credit.id,
                              posterUrl: credit.poster_path ? `https://image.tmdb.org/t/p/w500${credit.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
                              title: credit.name || credit.original_name,
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-4">{t('noFilmographyFound') || "Aucune filmographie trouvée."}</p>
                  )}
                </div>
              </div>
              <button onClick={handleActorCarouselNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2">
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Équipe Technique */}
      {movie.credits?.crew && filteredCrew.length > 0 && (
        <>
          <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('technicalCrew')}</h2>
          <div className="relative">
            <button onClick={scrollLeftCrew}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}>
              &lt;
            </button>
            <div ref={crewScrollRef} className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide">
              {filteredCrew.map((member) => (
                <div key={member.id}
                  className={`flex-none w-36 text-center p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                  <img src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : 'https://cdn.icon-icons.com/icons2/154/PNG/512/user_21980.png'}
                    alt={member.name}
                    className="w-full h-36 object-cover rounded-lg mb-2" />
                  <p className="font-semibold text-sm truncate">{member.name}</p>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t(member.job)}</p>
                </div>
              ))}
            </div>
            <button onClick={scrollRightCrew}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}>
              &gt;
            </button>
          </div>
        </>
      )}

      {/* Section Recommandations */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-center mb-4">{t('recommendedMovies')}</h2>
        {recLoading ? (
          <div className="relative flex items-center justify-start">
            <button onClick={handleRecPrevious}
              disabled={recStartIndex === 0}
              className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2">
              &lt;
            </button>
            <div className="overflow-x-hidden py-4 rec-carousel-container">
              <div className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${recTranslateX}px)` }}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex-shrink-0 mr-10">
                    <MovieSkeleton />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleRecNext}
              disabled={isRecNextDisabled()}
              className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2">
              &gt;
            </button>
          </div>
        ) : recommendedMovies.length === 0 ? (
          <div className="relative flex items-center justify-center py-4 rec-carousel-container min-h-[300px]">
            <p className="text-center">{t('noRecommendedMovies')}</p>
          </div>
        ) : (
          <div className="relative flex items-center justify-start">
            <button onClick={handleRecPrevious}
              disabled={recStartIndex === 0}
              className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2">
              &lt;
            </button>
            <div className="overflow-x-hidden py-4 rec-carousel-container">
              <div className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${recTranslateX}px)` }}>
                {recommendedMovies.map((rec, index) => (
                  <div key={rec.id}
                    ref={index === 0 ? recCardRef : null}
                    className={`flex-shrink-0 ${index !== recommendedMovies.length - 1 ? 'mr-10' : ''}`}>
                    <MovieCard key={rec.id} item={rec} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleRecNext}
              disabled={isRecNextDisabled()}
              className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2">
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetailPage;
