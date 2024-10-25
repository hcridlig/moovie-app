// frontend/src/utils/api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL; // URL de votre backend

// Configurer le token d'authentification si nécessaire
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token,
    },
  };
};

export const getMovieById = async (id) => {
  const response = await axios.get(`${apiUrl}/movies/${id}`);
  return response.data;
};

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

// Autres fonctions API...
