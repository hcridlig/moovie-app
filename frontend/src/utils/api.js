// src/utils/api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL; // URL de votre backend
const imageUrl = 'https://image.tmdb.org/t/p/w500'; // Base URL pour les affiches
const apiKey = "4edc74f5d6c3356f7a70a0ff694ecf1b";

// Cache pour les résultats de getPlatforms par pays
const providerCache = {};

/**
 * Récupère la liste des plateformes de streaming (watch providers) disponibles pour un pays donné,
 * via l'endpoint /watch/providers/movie.
 * Contrairement à /movie/{id}/watch/providers, cet endpoint renvoie un tableau "results".
 */
export const getPlatforms = async (countryCode = 'US') => {
  countryCode = countryCode.toUpperCase();
  const lang = countryCode === 'FR' ? 'fr-FR' : 'en-US';

  // Mapping manuel des providers autorisés pour chaque pays.
  // (Les IDs utilisés ici sont donnés à titre d'exemple ; adaptez-les à vos besoins.)
  const allowedProviders = {
    // Pour la France : on affiche Netflix, Amazon Prime Video, Disney Plus, Canal+ et Apple TV+.
    'FR': [8, 119, 337, 97, 350, 381, 283, 138, 1899, 59, 147, 61, 234, 236, 68, 188, 192, 190, 310, 324, 415, 196, 554, 559, 567, 573, 585, 588, 593, 613, 1754, 2303],

    // Pour les États-Unis : on affiche Netflix, Amazon Prime Video, Hulu, Disney Plus, HBO Max, Apple TV+ et Peacock.
    'US': [8, 9, 15, 337, 384, 350, 386, 3, 192, 188, 531, 1770, 538, 1796, 582, 583, 584, 207, 201, 2077, 289, 290, 291, 293, 294, 300, 343, 388, 433, 438, 439, 455, 457, 475, 503, 507, 508, 514, 529, 546, 551, 554, 569, 574, 633, 634, 635, 636, 688, 73, 87, 143, 185, 191, 196, 199, 202, 204, 228, 235, 239, 251, 257, 258, 260, 268, 278, 284, 295, 309, 322, 331, 332, 344, 361, 363, 368, 397, 417, 432, 437, 464, 486, 506, 515, 526, 542, 677, 1715, 1733, 1734, 1735, 1736, 1737, 1738, 1754, 1771, 1860, 1875, 1887, 1888, 1899, 1912, 222, 209, 123, 155, 157, 1853, 1854, 1855, 1875, 1889, 1899, 1967, 236, 256, 257, 264, 275, 285, 307, 315, 345, 377, 422, 444, 459, 473, 525, 533, 534, 535, 545, 555, 567, 573, 574, 585, 588, 593, 613, 637, 675, 685, 692, 701, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1754, 1771, 1860, 1867, 1875, 1887, 1888, 1889, 1899, 1912, 1967, 201, 207, 2077, 228, 236, 256, 257, 264, 275, 285, 307, 315, 345, 377, 422, 444, 459, 473, 525, 533, 534, 535, 545, 555, 567, 573, 574, 585, 588, 593, 613, 637, 675, 685, 692, 701, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1754, 1771, 1860, 1867, 1875, 1887, 1888, 1889, 1899, 1912, 1967, 201, 207, 2077, 228, 236, 256, 257, 264, 275, 285, 307, 315, 345, 377, 422, 444, 459, 473, 525, 533, 534, 535, 545, 555, 567, 573, 574, 585, 588, 593, 613, 637, 675, 685, 692, 701],
  };
  

  if (providerCache[countryCode]) {
    return providerCache[countryCode];
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/watch/providers/movie`, {
      params: {
        api_key: apiKey,
        language: lang,
        watch_region: countryCode
      }
    });

    let providersArray = response.data.results || [];
    // Tri par display_priority pour un ordre cohérent
    providersArray.sort((a, b) => (a.display_priority ?? 9999) - (b.display_priority ?? 9999));

    // Filtrage manuel : ne conserver que les fournisseurs autorisés pour le pays sélectionné
    if (allowedProviders[countryCode]) {
      providersArray = providersArray.filter(provider =>
        allowedProviders[countryCode].includes(provider.provider_id)
      );
    }

    providerCache[countryCode] = providersArray;

    return providersArray;
  } catch (error) {
    console.error('Erreur lors de la récupération des plateformes:', error);
    return [];
  }
};

/**
 * Récupère les plateformes de streaming pour un film donné (et un pays donné),
 * via l'endpoint /movie/{id}/watch/providers. Celui-ci renvoie un objet "results" 
 * dont chaque clé est un code pays (ex: "FR", "US"), et chaque sous-objet contient 
 * des catégories: flatrate, free, buy, rent, etc.
 */
export const getStreamingPlatforms = async (id, countryCode = 'FR') => {
  countryCode = countryCode.toUpperCase();
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, {
      params: { api_key: apiKey }
    });
    // response.data.results ressemble à { FR: { flatrate: [...], buy: [...], ... }, US: {...}, ...}
    const result = response.data.results[countryCode];
    // Ici, vous pouvez cumuler flatrate, free, buy, rent, etc. si vous le souhaitez
    // Par défaut, on renvoie flatrate ou un tableau vide
    return result ? (result.flatrate || []) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des plateformes de streaming :", error);
    throw error;
  }
};

export const getSearchedMovies = async (query) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: apiKey,
        query,
        language: 'en-US'
      }
    });
    const movies = response.data.results.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg'
    }));
    return {
      results: movies,
      total_pages: response.data.total_pages,
    };
  } catch (error) {
    console.error("Erreur lors de la recherche de films:", error);
    throw error;
  }
};

export const getTopMovies = async () => {
  try {
    const response = await axios.get(`${apiUrl}/movies`);
    const movies = response.data.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg',
    }));
    return movies;
  } catch (error) {
    console.error("Erreur lors de la récupération des films :", error);
    throw error;
  }
};

export const getTopSeries = async () => {
  try {
    const response = await axios.get(`${apiUrl}/series`);
    const series = response.data.map(serie => ({
      ...serie,
      posterUrl: serie.poster_path ? `${imageUrl}${serie.poster_path}` : '/path/to/default-image.jpg',
      title: serie.name,
    }));
    return series;
  } catch (error) {
    console.error("Erreur lors de la récupération des séries :", error);
    throw error;
  }
};

export const getMovieById = async (id) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr-fr&append_to_response=credits`);
    return {
      ...response.data,
      image: response.data.poster_path ? `${imageUrl}${response.data.poster_path}` : '/path/to/default-image.jpg',
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film :", error);
    throw error;
  }
};

export const getSerieById = async (id) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=fr-fr&append_to_response=credits`);
    return {
      ...response.data,
      posterUrl: response.data.poster_path ? `${imageUrl}${response.data.poster_path}` : '/path/to/default-image.jpg',
      title: response.data.name,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la série :", error);
    throw error;
  }
};

export const getSeriesById = async (id) => {
  const response = await axios.get(`${apiUrl}/series/${id}`);
  return response.data;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des informations utilisateur.');
  }
  const data = await response.json();
  return data;
};

export const updateUserProfile = async (userData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du profil.');
  }
  const data = await response.json();
  return data;
};

export const updatePassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du mot de passe.');
  }
  const data = await response.json();
  return data;
};

export const getGenres = async () => {
  const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
    params: { api_key: apiKey, language: 'en-US' }
  });
  return response.data.genres;
};

export const getLanguages = async () => {
  const response = await axios.get(`https://api.themoviedb.org/3/configuration/languages`, {
    params: { api_key: apiKey }
  });
  return response.data;
};

export const getCountries = async () => {
  const response = await axios.get(`https://api.themoviedb.org/3/configuration/countries`, {
    params: { api_key: apiKey }
  });
  return response.data;
};

/**
 * Récupère les films en fonction des filtres.
 */
export const getFilteredMovies = async (filters) => {
  const { genre, country, platform, minRating, releaseYear, minDuration, maxDuration, page, sortBy } = filters;
  const selectedCountry = country || 'FR';

  if (platform === "cinema") {
    // Simule "actuellement au cinéma" avec un intervalle de dates
    const today = new Date().toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const params = {
      api_key: apiKey,
      language: 'fr-FR',
      region: selectedCountry,
      page: page || 1,
      "primary_release_date.gte": pastDate,
      "primary_release_date.lte": today
    };
    // Autres filtres
    if (genre) params.with_genres = genre;
    if (minRating) params["vote_average.gte"] = minRating;
    if (releaseYear) params.primary_release_year = releaseYear;
    if (minDuration) params["with_runtime.gte"] = minDuration;
    if (maxDuration) params["with_runtime.lte"] = maxDuration;
    // Tri
    if (sortBy) params.sort_by = sortBy;

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
    const movies = response.data.results.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg',
    }));
    return {
      results: movies,
      total_pages: response.data.total_pages,
    };
  } else {
    // Filtres classiques
    const params = {
      api_key: apiKey,
      language: 'fr-FR',
      watch_region: selectedCountry,
      page: page || 1,
    };
    if (genre) params.with_genres = genre;
    if (platform) {
      params.with_watch_providers = platform;
      params.with_watch_monetization_types = 'flatrate';
    }
    if (minRating) params["vote_average.gte"] = minRating;
    if (releaseYear) params.primary_release_year = releaseYear;
    if (minDuration) params["with_runtime.gte"] = minDuration;
    if (maxDuration) params["with_runtime.lte"] = maxDuration;
    if (sortBy) params.sort_by = sortBy;

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
    const movies = response.data.results.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg',
    }));
    return {
      results: movies,
      total_pages: response.data.total_pages,
    };
  }
};

/**
 * Récupère les séries en fonction des filtres.
 */
export const getFilteredSeries = async (filters) => {
  const {
    genre,      // ID du genre TV (ex: 10759 = Action & Adventure)
    platform,   // ID du watch provider
    minRating,  // Note minimale
    seasons,    // Nombre minimal de saisons
    page,       // Numéro de page
    sortBy,     // Tri, ex: first_air_date.desc
    country     // Pays, ex: FR => watch_region=FR
  } = filters;

  // Paramètres pour l'endpoint discover/tv
  const params = {
    api_key: apiKey,
    language: 'fr-FR',
    page: page || 1,
  };

  if (genre) {
    params.with_genres = genre;
  }
  if (platform) {
    params.with_watch_providers = platform;
    params.with_watch_monetization_types = 'flatrate';
  }
  if (minRating) {
    params['vote_average.gte'] = minRating;
  }
  if (sortBy) {
    params.sort_by = sortBy;
  }
  if (country) {
    params.watch_region = country;
  }

  try {
    // Premier appel : /discover/tv
    const response = await axios.get('https://api.themoviedb.org/3/discover/tv', { params });
    let series = response.data.results.map(serie => ({
      ...serie,
      posterUrl: serie.poster_path ? `${imageUrl}${serie.poster_path}` : '/path/to/default-image.jpg',
      title: serie.name,
    }));

    // Si on a un filtre "nombre de saisons", on fait un second appel /tv/{id} pour chaque série
    // afin de récupérer number_of_seasons et filtrer localement.
    if (seasons) {
      const minSeasons = parseInt(seasons, 10);

      // Pour chaque série de la liste, on va chercher le détail
      const seriesWithDetails = await Promise.all(
        series.map(async (item) => {
          const detailResp = await axios.get(`https://api.themoviedb.org/3/tv/${item.id}`, {
            params: {
              api_key: apiKey,
              language: 'fr-FR'
            }
          });
          const detailData = detailResp.data;
          // On renvoie un nouvel objet avec le nombre de saisons
          return {
            ...item,
            number_of_seasons: detailData.number_of_seasons
          };
        })
      );

      // On filtre localement
      series = seriesWithDetails.filter(s => s.number_of_seasons >= minSeasons);
    }

    return {
      results: series,
      total_pages: response.data.total_pages,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des séries filtrées :", error);
    throw error;
  }
};

/**
 * Récupère la liste des genres pour les séries (endpoint /genre/tv/list).
 */
export const getTvGenres = async (language = 'fr-FR') => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/genre/tv/list', {
      params: {
        api_key: apiKey,
        language
      }
    });
    return response.data.genres; // Tableau d'objets { id, name }
  } catch (error) {
    console.error("Erreur lors de la récupération des genres TV :", error);
    return [];
  }
};

/**
 * Exemple d'implémentation de getWatchedItems
 */
export const getWatchedItems = async () => {
  // Ici, vous pouvez appeler votre API backend pour récupérer les films visionnés par l'utilisateur.
  // Pour l'instant, nous retournons un tableau vide.
  return [];
};
