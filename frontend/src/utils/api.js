// api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL; // URL de votre backend
const imageUrl = 'https://image.tmdb.org/t/p/w500'; // Base URL pour les affiches
const apiKey = "4edc74f5d6c3356f7a70a0ff694ecf1b";
const backendBaseUrl = process.env.REACT_APP_API_URL;

// Cache pour les résultats de getPlatforms par pays
const providerCache = {};

/**
 * Tente d'unifier le nom du fournisseur à une marque principale
 * (Netflix, Hulu, Disney Plus, etc.) afin de regrouper toutes les variantes
 * (ex: "Netflix Basic with Ads", "Netflix Standard", "Netflix" => "netflix").
 */
function unifyBrandName(name) {
  const n = name.toLowerCase();

  // Retrait de termes "parasites"
  // On enlève ads, with ads, basic, standard, etc. (vous pouvez ajuster la liste)
  const cleaned = n
    .replace(/\(.*ads.*\)/g, "") // enlève "(with ads)" ou "(ads)"
    .replace(/\b(with|w\/)\s*ads\b/g, "")
    .replace(/\bads\b/g, "")
    .replace(/\bbasic\b/g, "")
    .replace(/\bstandard\b/g, "")
    .replace(/\bpremium\b/g, "")
    .trim();

  // Unifications par mot-clé
  if (cleaned.includes("netflix")) return "netflix";
  if (cleaned.includes("prime") || cleaned.includes("amazon")) return "amazon prime video";
  if (cleaned.includes("disney")) return "disney plus";
  if (cleaned.includes("hulu")) return "hulu";
  if (cleaned.includes("max") || cleaned.includes("hbo")) return "max";
  // Ajoutez ici d’autres marques si nécessaire

  // Fallback : on renvoie la chaîne nettoyée
  return cleaned;
}

/**
 * Regroupe les fournisseurs par leur "marque unifiée" et élimine la version "ads" si possible.
 */
function filterOutAdsProviders(providers) {
  // Regroupe par marque
  const grouped = {};
  providers.forEach(provider => {
    const brand = unifyBrandName(provider.provider_name);
    if (!grouped[brand]) {
      grouped[brand] = [];
    }
    grouped[brand].push(provider);
  });

  const result = [];
  for (const brand in grouped) {
    const group = grouped[brand];
    // On préfère la version sans "ads" si disponible
    // i.e. on cherche un provider dont provider_name n’a pas "ads"
    const withoutAds = group.find(p => !p.provider_name.toLowerCase().includes("ads"));
    result.push(withoutAds || group[0]); // Sinon, on prend le premier
  }
  return result;
}

/**
 * Récupère la liste des plateformes de streaming disponibles pour un pays donné,
 * via l'endpoint /watch/providers/movie.
 */
export const getPlatforms = async (countryCode = 'US') => {
  countryCode = countryCode.toUpperCase();
  const lang = countryCode === 'FR' ? 'fr-FR' : 'en-US';

  const allowedProviders = {
    'FR': [8, 119, 337, 97, 350, 381, 283, 138, 1899, 59, 147, 61, 234, 236, 68, 188, 192, 190, 310, 324, 415, 196, 554, 559, 567, 573, 585, 588, 593, 613, 1754, 2303],
    'US': [8, 9, 15, 337, 384, 350, 386, 3, 192, 188, 531, 1770, 538, 1796, 582, 583, 584, 207, 201, 2077, 289, 290, 291, 293, 294, 300, 343, 388, 433, 438, 439, 455, 457, 475, 503, 507, 508, 514, 529, 546, 551, 554, 569, 574, 633, 634, 635, 636, 688, 73, 87, 143, 185, 191, 196, 199, 202, 204, 228, 235, 239, 251, 257, 258, 260, 268, 278, 284, 295, 309, 322, 331, 332, 344, 361, 363, 368, 397, 417, 432, 437, 464, 486, 506, 515, 526, 542, 677, 1715, 1733, 1734, 1735, 1736, 1737, 1738, 1754, 1771, 1860, 1875, 1887, 1888, 1899, 1912, 222, 209, 123, 155, 157, 1853, 1854, 1855, 1875, 1889, 1899, 1967, 236, 256, 257, 264, 275, 285, 307, 315, 345, 377, 422, 444, 459, 473, 525, 533, 534, 535, 545, 555, 567, 573, 574, 585, 588, 593, 613, 637, 675, 685, 692, 701, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1754, 1771, 1860, 1867, 1875, 1887, 1888, 1889, 1899, 1912, 1967, 201, 207, 2077, 228, 236, 256, 257, 264, 275, 285, 307, 315, 345, 377, 422, 444, 459, 473, 525, 533, 534, 535, 545, 555, 567, 573, 574, 585, 588, 593, 613, 637, 675, 685, 692, 701],
  };

  if (providerCache[countryCode]) {
    return providerCache[countryCode];
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/watch/providers/movie`, {
      params: {
        api_key: apiKey,
        language: lang,
      }
    });
    let providersArray = response.data.results || [];
    providersArray.sort((a, b) => (a.display_priority ?? 9999) - (b.display_priority ?? 9999));
    if (allowedProviders[countryCode]) {
      providersArray = providersArray.filter(provider =>
        allowedProviders[countryCode].includes(provider.provider_id)
      );
    }
    providersArray = filterOutAdsProviders(providersArray);
    providerCache[countryCode] = providersArray;
    return providersArray;
  } catch (error) {
    console.error('Erreur lors de la récupération des plateformes:', error);
    return [];
  }
};

/**
 * Récupère les plateformes de streaming pour un film donné (et un pays donné),
 * via l'endpoint /movie/{id}/watch/providers.
 */
export const getStreamingPlatforms = async (id, countryCode = 'FR') => {
  countryCode = countryCode.toUpperCase();
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, {
      params: { api_key: apiKey }
    });
    const result = response.data.results[countryCode];
    let platforms = result ? (result.flatrate || []) : [];
    platforms = filterOutAdsProviders(platforms);
    return platforms;
  } catch (error) {
    console.error("Erreur lors de la récupération des plateformes de streaming :", error);
    throw error;
  }
};

/**
 * Récupère les plateformes de streaming pour une série (TV) (et un pays donné),
 * via l'endpoint /tv/{id}/watch/providers.
 */
export const getTVStreamingPlatforms = async (id, countryCode = 'FR') => {
  countryCode = countryCode.toUpperCase();
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}/watch/providers`, {
      params: { api_key: apiKey }
    });
    const result = response.data.results[countryCode];
    let platforms = result ? (result.flatrate || []) : [];
    platforms = filterOutAdsProviders(platforms);
    return platforms;
  } catch (error) {
    console.error("Erreur lors de la récupération des plateformes de streaming pour la série :", error);
    throw error;
  }
};

/**
 * Recherche multi (films et séries) sur TMDB.
 * Utilise l'endpoint /search/multi et ne conserve que les résultats de type "movie" ou "tv".
 * Pour les films, ajoute la propriété "image" pour l'affiche.
 * Pour les séries, ajoute la propriété "posterUrl" pour l'affiche.
 */
export const getSearchedMulti = async (query, page = 1, sortBy = null) => {
  try {
    const language = localStorage.getItem('language') || 'fr-FR';
    const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
      params: {
        api_key: apiKey,
        query,
        language,
        page,
      }
    });
    // Filtrer les résultats pour ne conserver que les films et séries
    let results = response.data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => {
        if (item.media_type === 'movie') {
          return {
            ...item,
            title: item.title,
            image: item.poster_path ? `${imageUrl}${item.poster_path}` : '/path/to/default-image.jpg',
            release_date: item.release_date,
          };
        } else {
          return {
            ...item,
            title: item.name,
            posterUrl: item.poster_path ? `${imageUrl}${item.poster_path}` : '/path/to/default-image.jpg',
            release_date: item.first_air_date,
          };
        }
      });
      
    // Appliquer le tri si sortBy est spécifié
    if (sortBy) {
      let [field, order] = sortBy.split('.');
      // Convertir "primary_release_date" en "release_date" pour correspondre aux données récupérées
      if (field === 'primary_release_date') {
        field = 'release_date';
      }
      results.sort((a, b) => {
        if (field === 'vote_average' || field === 'runtime') {
          return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
        } else if (field === 'release_date') {
          const dateA = new Date(a.release_date);
          const dateB = new Date(b.release_date);
          return order === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
    }

    return {
      results,
      total_pages: response.data.total_pages,
    };
  } catch (error) {
    console.error("Erreur lors de la recherche multi :", error);
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
  const language = localStorage.getItem('language') || 'fr-FR';
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=${language}&append_to_response=credits`);
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

// Nouvelle fonction pour supprimer le compte de l'utilisateur
export const deleteAccount = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Aucun token disponible, utilisateur non authentifié.');
  
  const response = await axios.delete(`${apiUrl}/auth/delete`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
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
 * 
 * Modification apportée pour le tri par durée (runtime) :
 * - Si sortBy commence par "runtime", on ne l'envoie pas à l'API.
 * - Après réception des résultats, on récupère (si nécessaire) la durée de chaque film via getMovieById,
 *   puis on trie manuellement la liste en fonction de la durée (ascendant ou descendant).
 */
export const getFilteredMovies = async (filters) => {
  const { genre, country, platform, minRating, releaseYear, minDuration, maxDuration, page, sortBy } = filters;
  const selectedCountry = country || 'FR';
  const language = localStorage.getItem('language') || 'fr-FR';

  if (platform === "cinema") {
    const today = new Date().toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const params = {
      api_key: apiKey,
      language,
      region: selectedCountry,
      page: page || 1,
      "primary_release_date.gte": pastDate,
      "primary_release_date.lte": today,
    };
    if (genre) params.with_genres = genre;
    if (minRating) params["vote_average.gte"] = minRating;
    if (releaseYear) params.primary_release_year = releaseYear;
    if (minDuration) params["with_runtime.gte"] = minDuration;
    if (maxDuration) params["with_runtime.lte"] = maxDuration;
    // N'envoie pas sort_by si c'est un tri par runtime
    if (sortBy && !sortBy.startsWith('runtime')) params.sort_by = sortBy;

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
    let movies = response.data.results.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg',
    }));

    if (sortBy && sortBy.startsWith('runtime')) {
      movies = await Promise.all(
        movies.map(async (movie) => {
          if (movie.runtime == null) {
            try {
              const details = await getMovieById(movie.id);
              return { ...movie, runtime: details.runtime };
            } catch (e) {
              return { ...movie, runtime: 0 };
            }
          }
          return movie;
        })
      );
      movies.sort((a, b) =>
        sortBy === 'runtime.asc' ? a.runtime - b.runtime : b.runtime - a.runtime
      );
    }

    return {
      results: movies,
      total_pages: response.data.total_pages,
    };
  } else {
    const params = {
      api_key: apiKey,
      language,
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
    // N'envoie pas sort_by si c'est un tri par runtime
    if (sortBy && !sortBy.startsWith('runtime')) params.sort_by = sortBy;

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
    let movies = response.data.results.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg',
    }));

    if (sortBy && sortBy.startsWith('runtime')) {
      movies = await Promise.all(
        movies.map(async (movie) => {
          if (movie.runtime == null) {
            try {
              const details = await getMovieById(movie.id);
              return { ...movie, runtime: details.runtime };
            } catch (e) {
              return { ...movie, runtime: 0 };
            }
          }
          return movie;
        })
      );
      movies.sort((a, b) =>
        sortBy === 'runtime.asc' ? a.runtime - b.runtime : b.runtime - a.runtime
      );
    }

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
  const { genre, platform, minRating, seasons, page = 1, sortBy, country = 'FR' } = filters;
  try {
    const response = await axios.get(`${backendBaseUrl}/series/discover`, {
      params: { genre, platform, minRating, seasons, page, sortBy, country },
    });
    return {
      results: response.data.results || [],
      total_pages: response.data.total_pages || 1,
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
      params: { api_key: apiKey, language }
    });
    return response.data.genres;
  } catch (error) {
    console.error("Erreur lors de la récupération des genres TV :", error);
    return [];
  }
};

/**
 * Récupère la liste brute des préférences (movie_id, liked, mediaType, etc.)
 */
export const getUserPreferences = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Aucun token disponible, utilisateur non authentifié.');
  
  const response = await fetch(`${apiUrl}/users/me/preferences`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des contenus visionnés.');
  }
  
  return await response.json();
};

/**
 * Ajoute ou met à jour la préférence (like/dislike) d'un film ou d'une série
 */
export const addPreference = async ({ movieId, liked, mediaType }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Aucun token disponible, utilisateur non authentifié.');
  
  const response = await fetch(`${apiUrl}/users/me/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movieId,
      liked,
      mediaType
    }),
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de l'enregistrement de la préférence.");
  }
  
  return await response.json();
};

// Nouvelle fonction pour supprimer une préférence
export const removePreference = async ({ movieId, mediaType }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Aucun token disponible, utilisateur non authentifié.');
  
  const response = await axios.delete(`${apiUrl}/users/me/preferences`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: { movieId, mediaType }
  });
  
  return response.data;
};
