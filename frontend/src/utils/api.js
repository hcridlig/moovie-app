// frontend/src/utils/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // URL de votre backend

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
  const response = await axios.get(`${API_URL}/movies/${id}`);
  return response.data;
};

export const getSeriesById = async (id) => {
  const response = await axios.get(`${API_URL}/series/${id}`);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  });
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await axios.put(`${API_URL}/users/me`, data, {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  });
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/users/me/password`, passwordData, {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  });
  return response.data;
};

// Autres fonctions API...
