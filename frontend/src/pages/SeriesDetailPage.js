import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getSerieById, getTVStreamingPlatforms, addPreference, removePreference, getUserPreferences } from '../utils/api';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { SettingsContext } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SerieCard from '../components/SerieCard';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';

function SerieDetailPage() {
  const { id } = useParams();
  const { theme, country } = useContext(SettingsContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();

  // Définition des URL pour les fournisseurs de streaming
  const providerUrls = {
    Netflix: (serie) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(serie.title || serie.name)}`,
    'Amazon Prime Video': (serie) =>
      `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(serie.title || serie.name)}`,
    'Disney Plus': (serie) =>
      `https://www.disneyplus.com/search?q=${encodeURIComponent(serie.title || serie.name)}`,
    Max: (serie) =>
      `https://play.max.com/search/result?q=${encodeURIComponent(serie.title || serie.name)}`,
    'Apple TV+': (serie) =>
      `https://tv.apple.com/search?term=${encodeURIComponent(serie.title || serie.name)}`,
    'Canal Plus': (serie) =>
      `https://www.canalplus.com/series/${encodeURIComponent(serie.title || serie.name)}`,
    Crunchyroll: (serie) =>
      `https://www.crunchyroll.com/fr/search?q=${encodeURIComponent(serie.title || serie.name)}`,
    'Paramount Plus': (serie) =>
      `https://www.paramountplus.com/search?q=${encodeURIComponent(serie.title || serie.name)}`,
    'TF1+': (serie) =>
      `https://www.tf1.fr/programmes-tv?q=${encodeURIComponent(serie.title || serie.name)}`
  };

  const providerLoginUrls = {
    Netflix: 'https://www.netflix.com/login',
    'Amazon Prime Video': 'https://www.primevideo.com/ap/signin',
    'Disney Plus': 'https://www.disneyplus.com/login',
    Max: 'https://auth.max.com/login',
    'Apple TV+': 'https://tv.apple.com/login',
    'Canal Plus': 'https://www.canalplus.com/login',
    Crunchyroll: 'https://sso.crunchyroll.com/fr/login',
    'Paramount Plus': 'https://www.paramountplus.com/fr/account/signin/',
    'TF1+': 'https://www.tf1.fr/compte/connexion'
  };

  // États principaux
  const [serie, setSerie] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [userOpinion, setUserOpinion] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const scrollRef = useRef(null);

  // Carrousel des recommandations de séries
  const [recommendedSeries, setRecommendedSeries] = useState([]);
  const [recLoadingSeries, setRecLoadingSeries] = useState(true);
  const [recStartIndexSeries, setRecStartIndexSeries] = useState(0);
  const [recTranslateXSeries, setRecTranslateXSeries] = useState(0);
  const [recMaxTranslateXSeries, setRecMaxTranslateXSeries] = useState(0);
  const recCardRefSeries = useRef(null);

  // Équipe technique (crew)
  const crewScrollRef = useRef(null);
  const scrollLeftCrew = () => {
    crewScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRightCrew = () => {
    crewScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // Pour l’équipe technique, on souhaite utiliser les crédits de la saison sélectionnée.
  // Si ces informations sont manquantes, on utilise celles de la saison qui comporte le plus de membres d'équipe technique.
  // En dernier recours, on utilisera les crédits généraux de la série.
  const validSeasons = serie?.seasons?.filter(s => s.season_number > 0);
  const seasonsWithCredits = validSeasons?.filter(s => s.credits && s.credits.crew) || [];
  const fallbackSeason = seasonsWithCredits.length > 0
    ? seasonsWithCredits.reduce((prev, curr) => {
        const prevCrewCount = prev.credits.crew.filter(member =>
          ['Director', 'Screenplay', 'Writer', 'Composer', 'Original Music Composer'].includes(member.job)
        ).length;
        const currCrewCount = curr.credits.crew.filter(member =>
          ['Director', 'Screenplay', 'Writer', 'Composer', 'Original Music Composer'].includes(member.job)
        ).length;
        return currCrewCount > prevCrewCount ? curr : prev;
      })
    : null;
  const fallbackCrew = fallbackSeason?.credits?.crew;
  const crewData = (selectedSeason?.credits?.crew && selectedSeason.credits.crew.length > 0)
    ? selectedSeason.credits.crew
    : fallbackCrew || serie?.credits?.crew || [];
  const filteredCrew = crewData.filter(member =>
    ['Director', 'Screenplay', 'Writer', 'Composer', 'Original Music Composer'].includes(member.job)
  );

  // États pour la filmographie d’un acteur
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorFilmography, setActorFilmography] = useState([]);
  const [actorCarouselIndex, setActorCarouselIndex] = useState(0);
  const cardWidth = 220; // Largeur d'une carte incluant marge

  // États et ref pour l'animation de la filmographie (slide-down)
  const [filmographyVisible, setFilmographyVisible] = useState(false);
  const [filmographyMaxHeight, setFilmographyMaxHeight] = useState("0px");
  const filmographyContentRef = useRef(null);

  // Récupération des détails de la série et plateformes
  useEffect(() => {
    const fetchSerieDetails = async () => {
      try {
        const serieData = await getSerieById(id);
        setSerie(serieData);
        if (serieData.seasons && serieData.seasons.length > 0) {
          const validSeasons = serieData.seasons.filter(season => season.season_number > 0);
          if (validSeasons.length > 0) {
            // Si certaines saisons possèdent déjà des crédits, on sélectionne celle qui a le plus de membres d'équipe technique.
            const seasonsWithCredits = validSeasons.filter(s => s.credits && s.credits.crew);
            if (seasonsWithCredits.length > 0) {
              const seasonWithMostCrew = seasonsWithCredits.reduce((prev, curr) => {
                const prevCrewCount = prev.credits.crew.filter(member =>
                  ['Director', 'Screenplay', 'Writer', 'Composer', 'Original Music Composer'].includes(member.job)
                ).length;
                const currCrewCount = curr.credits.crew.filter(member =>
                  ['Director', 'Screenplay', 'Writer', 'Composer', 'Original Music Composer'].includes(member.job)
                ).length;
                return currCrewCount > prevCrewCount ? curr : prev;
              });
              setSelectedSeason(seasonWithMostCrew);
            } else {
              // Sinon, on prend la première saison
              setSelectedSeason(validSeasons[0]);
            }
          }
        }
        const selectedCountry = country || 'FR';
        const platformData = await getTVStreamingPlatforms(id, selectedCountry);
        setPlatforms(platformData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la série :", error);
      }
    };
    fetchSerieDetails();
  }, [id, country]);

  // Mise à jour des crédits quand la saison sélectionnée change
  useEffect(() => {
    const fetchSeasonCredits = async () => {
      if (serie && selectedSeason && !selectedSeason.credits) {
        try {
          const apiKey = process.env.API_KEY_TMDB || "4edc74f5d6c3356f7a70a0ff694ecf1b";
          const seasonResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${serie.id}/season/${selectedSeason.season_number}?api_key=${apiKey}&language=fr-FR&append_to_response=credits`
          );
          const seasonData = await seasonResponse.json();
          // Mise à jour de l'objet de la saison avec les crédits récupérés
          setSelectedSeason(prev => ({ ...prev, credits: seasonData.credits }));
        } catch (error) {
          console.error("Erreur lors de la récupération des crédits de la saison:", error);
        }
      }
    };

    fetchSeasonCredits();
  }, [selectedSeason, serie]);

  // Préférence utilisateur
  useEffect(() => {
    const fetchUserPreference = async () => {
      try {
        const preferences = await getUserPreferences();
        const pref = preferences.find(p =>
          Number(p.movie_id) === Number(serie.id) &&
          (p.mediaType === 'serie' || p.media_type === 'serie')
        );
        if (pref) {
          setUserOpinion(pref.liked ? 'like' : 'dislike');
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la préférence utilisateur :", error);
      }
    };
    if (serie) {
      fetchUserPreference();
    }
  }, [serie]);

  // Recommandations
  useEffect(() => {
    if (serie) {
      fetch(`${process.env.REACT_APP_API_URL}/series/recommended/${serie.id}`)
        .then(res => res.json())
        .then(data => {
          return Promise.all(
            data.map(async rec => {
              try {
                const fullSerieData = await getSerieById(rec.serie_id);
                return fullSerieData;
              } catch (error) {
                console.error(`Erreur lors de la récupération de la série recommandée ${rec.serie_id}`, error);
                return null;
              }
            })
          );
        })
        .then(fullSeries => {
          setRecommendedSeries(fullSeries.filter(s => s));
          setRecLoadingSeries(false);
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des recommandations de séries :", error);
          setRecLoadingSeries(false);
        });
    }
  }, [serie]);

  // Mise à jour du carrousel des recommandations
  useEffect(() => {
    const updateRecMeasurementsSeries = () => {
      if (recCardRefSeries.current && recommendedSeries.length > 0) {
        const style = window.getComputedStyle(recCardRefSeries.current);
        const width = recCardRefSeries.current.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const computedCardWidth = width + marginRight;
        const totalWidth = recommendedSeries.length * computedCardWidth - marginRight;
        const container = document.querySelector('.rec-carousel-container.series');
        const containerWidth = container ? container.offsetWidth : 0;
        const maxTranslate = Math.max(totalWidth - containerWidth, 0);
        setRecMaxTranslateXSeries(maxTranslate);

        const currentTranslate = Math.min(recStartIndexSeries * computedCardWidth, maxTranslate);
        setRecTranslateXSeries(currentTranslate);
      }
    };

    updateRecMeasurementsSeries();
    window.addEventListener('resize', updateRecMeasurementsSeries);
    return () => {
      window.removeEventListener('resize', updateRecMeasurementsSeries);
    };
  }, [recommendedSeries, recStartIndexSeries]);

  const handleRecNextSeries = () => setRecStartIndexSeries(prev => prev + 1);
  const handleRecPreviousSeries = () => setRecStartIndexSeries(prev => (prev > 0 ? prev - 1 : 0));
  const isRecNextDisabledSeries = () => recTranslateXSeries >= recMaxTranslateXSeries;

  // Like / Dislike
  const handleOpinion = async (opinion) => {
    if (!isAuthenticated) {
      alert(t('loginPrompt') || "Veuillez vous connecter pour noter la série.");
      return;
    }
    if (userOpinion === opinion) {
      try {
        await removePreference({ movieId: serie.id, mediaType: 'serie' });
        setUserOpinion(null);
      } catch (error) {
        console.error("Erreur lors de la suppression de la préférence :", error);
      }
      return;
    }
    try {
      await addPreference({
        movieId: serie.id,
        liked: opinion === 'like',
        mediaType: 'serie'
      });
      setUserOpinion(opinion);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la série aux contenus visionnés :", error);
    }
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // Modification de la filmographie avec animation slide-down
  const handleActorClick = (actor, e) => {
    if (selectedActor && selectedActor.id === actor.id) {
      // Lancement de l'animation de fermeture
      setFilmographyVisible(false);
      setTimeout(() => {
        setSelectedActor(null);
        setActorFilmography([]);
        setActorCarouselIndex(0);
      }, 500); // durée de la transition
    } else {
      setSelectedActor(actor);
      fetchActorFilmography(actor.id);
      setActorCarouselIndex(0);
      // Légère attente avant l'affichage de la filmographie
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
    const maxIndex = Math.max(actorFilmography.length - 3, 0); // Supposons 3 cartes visibles
    setActorCarouselIndex(prev => (prev < maxIndex ? prev + 1 : prev));
  };

  // Effet pour gérer l'animation de la filmographie (max-height et opacité)
  useEffect(() => {
    if (filmographyVisible && filmographyContentRef.current) {
      setFilmographyMaxHeight(filmographyContentRef.current.scrollHeight + "px");
    } else {
      setFilmographyMaxHeight("0px");
    }
  }, [filmographyVisible, actorFilmography]);

  if (!serie) return <p className="text-center text-xl">{t('loading')}</p>;

  return (
    <div className={`container mx-auto px-4 py-8 mt-12 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg shadow-lg`}>
      {/* Informations principales de la série */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img src={serie.posterUrl} alt={serie.title || serie.name} className="w-full max-w-sm rounded-lg shadow-lg mb-4 md:mb-0" />
        <div className="md:flex-1 space-y-4">
          <h1 className="text-4xl font-bold mb-2">{serie.title || serie.name}</h1>
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

          {/* Sélection de saison */}
          {serie.seasons && serie.seasons.filter(s => s.season_number > 0).length > 0 && (
            <div className="my-4">
              <label htmlFor="season-select" className="block font-semibold mb-2">
                {t('selectSeason')}
              </label>
              <select
                id="season-select"
                value={selectedSeason?.season_number || ''}
                onChange={(e) => {
                  const seasonNumber = Number(e.target.value);
                  const season = serie.seasons.find(s => s.season_number === seasonNumber);
                  setSelectedSeason(season);
                }}
                className="p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                {serie.seasons.filter(s => s.season_number > 0).map((s) => (
                  <option key={s.id || s.season_number} value={s.season_number}>
                    {t('season')} {s.season_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{t('firstSeasonReleaseDate')}:</strong> {serie.first_air_date || 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{t('genres')}:</strong> {serie.genres ? serie.genres.map(g => g.name).join(', ') : 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{t('numberOfSeasons')}:</strong> {serie.number_of_seasons || 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{t('totalNumberOfEpisodes')}:</strong> {serie.number_of_episodes || 'N/A'}
            </p>
            {selectedSeason && (
              <p className="text-gray-700 dark:text-gray-300">
                <strong>{t('episodesForSeason', { season: selectedSeason.season_number })}:</strong> {selectedSeason.episode_count || 'N/A'}
              </p>
            )}
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={() => handleOpinion('like')}
                className={`p-2 rounded-full transform transition duration-200 active:scale-95 ${userOpinion === 'like' ? 'bg-green-500 bg-opacity-70 text-white' : 'bg-green-500 bg-opacity-20 text-green-700'}`}
              >
                <FaThumbsUp size={20} />
              </button>
              <button
                onClick={() => handleOpinion('dislike')}
                className={`p-2 rounded-full transform transition duration-200 active:scale-95 ${userOpinion === 'dislike' ? 'bg-red-500 bg-opacity-70 text-white' : 'bg-red-500 bg-opacity-20 text-red-700'}`}
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
                    onClick={(e) => {
                      e.preventDefault();
                      const isConnected = window.confirm(
                        t('confirmConnection', { provider: provider.provider_name })
                      );
                      if (isConnected) {
                        window.open(providerUrls[provider.provider_name](serie), "_blank");
                      } else {
                        window.open(providerLoginUrls[provider.provider_name] || providerUrls[provider.provider_name](serie), "_blank");
                      }
                    }}
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
                {t('notAvailableInCountry')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Casting */}
      <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('mainCast')}</h2>
      <div className="relative">
        <button
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}
        >
          &lt;
        </button>
        <div ref={scrollRef} className="flex overflow-x-scroll space-x-4 pt-4 pb-4 scrollbar-hide">
          {(selectedSeason?.credits?.cast || serie.credits?.cast).map((actor) => (
            <div
              key={actor.id}
              onClick={(e) => handleActorClick(actor, e)}
              className={`flex-none w-36 text-center p-4 rounded-lg shadow-md cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${selectedActor && selectedActor.id === actor.id ? 'ring-4 ring-indigo-500' : ''}`}
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
          onClick={scrollRight}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}
        >
          &gt;
        </button>
      </div>

      {/* Filmographie avec animation slide-down */}
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
      {serie.credits?.crew && filteredCrew.length > 0 && (
        <>
          <h2 className="text-3xl font-semibold text-center mt-8 mb-4">{t('technicalCrew')}</h2>
          <div className="relative">
            <button
              onClick={scrollLeftCrew}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}
            >
              &lt;
            </button>
            <div ref={crewScrollRef} className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide">
              {filteredCrew.map((member) => (
                <div
                  key={member.id}
                  className={`flex-none w-36 text-center p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                >
                  <img
                    src={
                      member.profile_path
                        ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                        : 'https://cdn.icon-icons.com/icons2/154/PNG/512/user_21980.png'
                    }
                    alt={member.name}
                    className="w-full h-36 object-cover rounded-lg mb-2"
                  />
                  <p className="font-semibold text-sm truncate">{member.name}</p>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t(member.job)}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollRightCrew}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 z-10 text-white ${theme === 'dark' ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75' : 'bg-gray-300 bg-opacity-50 hover:bg-opacity-75'}`}
            >
              &gt;
            </button>
          </div>
        </>
      )}

      {/* Section Recommandations */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-center mb-4">{t('recommendedSeries')}</h2>
        { recLoadingSeries ? (
          <div className="relative flex items-center justify-start">
            <button
              onClick={handleRecPreviousSeries}
              disabled={recStartIndexSeries === 0}
              className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &lt;
            </button>
            <div className="overflow-x-hidden py-4 rec-carousel-container series">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${recTranslateXSeries}px)` }}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex-shrink-0 mr-10">
                    <MovieSkeleton />
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleRecNextSeries}
              disabled={isRecNextDisabledSeries()}
              className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &gt;
            </button>
          </div>
        ) : recommendedSeries.length === 0 ? (
          <div className="relative flex items-center justify-center py-4 rec-carousel-container min-h-[300px]">
            <p className="text-center">{t('noRecommendedSeries')}</p>
          </div>
        ) : (
          <div className="relative flex items-center justify-start">
            <button
              onClick={handleRecPreviousSeries}
              disabled={recStartIndexSeries === 0}
              className="absolute left-0 ml-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &lt;
            </button>
            <div className="overflow-x-hidden py-4 rec-carousel-container series">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${recTranslateXSeries}px)` }}>
                {recommendedSeries.map((rec, index) => (
                  <div
                    key={rec.id}
                    ref={index === 0 ? recCardRefSeries : null}
                    className={`flex-shrink-0 ${index !== recommendedSeries.length - 1 ? 'mr-10' : ''}`}
                  >
                    <SerieCard key={rec.id} serie={rec} />
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleRecNextSeries}
              disabled={isRecNextDisabledSeries()}
              className="absolute right-0 mr-1 z-10 bg-gray-300 dark:bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SerieDetailPage;
