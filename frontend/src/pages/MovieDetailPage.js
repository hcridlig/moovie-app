// src/pages/MovieDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById } from '../utils/api';

function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieData = await getMovieById(id);
        setMovie(movieData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du film :", error);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (!movie) return <p>Chargement...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
      <img src={movie.image} alt={movie.title} className="w-full max-w-md mb-4" />
      <p className="text-lg mb-2">{movie.overview}</p>
      <p className="text-gray-600">Date de sortie : {movie.release_date || 'Non spécifiée'}</p>
      <p className="text-gray-600">Note : {movie.vote_average} ({movie.vote_count} votes)</p>
    </div>
  );
}

export default MovieDetailPage;
