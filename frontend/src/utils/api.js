// frontend/src/utils/api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL; // URL de votre backend
const imageUrl = 'https://image.tmdb.org/t/p/w500'; // Base URL pour les affiches
const apiKey = "4edc74f5d6c3356f7a70a0ff694ecf1b";

export const getSeriesById = async (id) => {
  const response = await axios.get(`${apiUrl}/series/${id}`);
  return response.data;
};

// Récupérer les informations du profil de l'utilisateur connecté
export const getUserProfile = async () => {
  const token = localStorage.getItem('token'); // Récupérer le token du localStorage
  const response = await fetch(`${apiUrl}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Inclure le token dans l'en-tête d'autorisation
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des informations utilisateur.');
  }

  const data = await response.json();
  return data;
};

// Mettre à jour les informations de l'utilisateur connecté
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

// Mettre à jour le mot de passe de l'utilisateur
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

export const getTopMovies = async () => {
  try {
    const response = await axios.get(`${apiUrl}/movies`);
    const movies = response.data.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg', // Ajouter l'URL de l'affiche complète
    }));
    return movies;
  } catch (error) {
    console.error("Erreur lors de la récupération des films :", error);
    throw error;
  }
};

export const getMovieById = async (id) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=4edc74f5d6c3356f7a70a0ff694ecf1b&language=fr-fr&append_to_response=credits`);
    return {
      ...response.data,
      image: response.data.poster_path ? `${imageUrl}${response.data.poster_path}` : '/path/to/default-image.jpg',
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film :", error);
    throw error;
  }
};

// Récupération des plateformes de streaming par pays pour un film spécifique
export const getStreamingPlatforms = async (id, countryCode) => {
  if (countryCode === "fr") {
    countryCode="FR";
  }
  else{
    countryCode="US";
  }
 
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=4edc74f5d6c3356f7a70a0ff694ecf1b`);
    const platforms = response.data.results[countryCode];

    return platforms ? {
      flatrate: platforms.flatrate || [],
    } : null;
  } catch (error) {
    console.error("Erreur lors de la récupération des plateformes de streaming :", error);
    throw error;
  }
};

// Récupération des genres de films
export const getGenres = async () => {
  const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
  return response.data.genres;
};

// Récupération des langues disponibles
export const getLanguages = async () => {
  const response = await axios.get(`https://api.themoviedb.org/3/configuration/languages?api_key=${apiKey}`);
  return response.data;
};

// Récupération des plateformes de streaming
export const getPlatforms = async (countryCode = 'US') => {
  const response = await axios.get(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}&language=en-US&watch_region=${countryCode}`);
  return response.data.results;
};

// Récupération des films avec filtres dynamiques
export const getFilteredMovies = async (filters) => {
  const {
    genre,
    language,
    platform,
    minRating,
    releaseYear,
    minDuration,
    maxDuration,
    page
  } = filters;

  const params = {
    api_key: apiKey,
    language: 'en-US',
    watch_region: 'US',
    page: page || 1,
  };

  if (genre) params.with_genres = genre;
  if (language) params.with_original_language = language;
  if (platform) params.with_watch_providers = platform;
  if (minRating) params.vote_average_gte = minRating;
  if (releaseYear) params.primary_release_year = releaseYear;
  if (minDuration) params.with_runtime_gte = minDuration;
  if (maxDuration) params.with_runtime_lte = maxDuration;

  try {
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
    const movies = response.data.results.map(movie => ({
      ...movie,
      image: movie.poster_path ? `${imageUrl}${movie.poster_path}` : '/path/to/default-image.jpg',
    }));
    return {
      results: movies,
      total_pages: response.data.total_pages,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des films filtrés :", error);
    throw error;
  }
};
// Autres fonctions API...
