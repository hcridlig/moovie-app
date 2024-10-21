// src/pages/MovieDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById } from '../utils/api'; // Fonction pour récupérer le film via l'API

function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    // Récupérer les détails du film depuis l'API
    getMovieById(id).then((data) => setMovie(data));
  }, [id]);

  if (!movie) {
    return <p className="text-center mt-8">Chargement...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <img src={movie.image} alt={movie.title} className="w-full md:w-1/3 rounded-lg shadow-lg" />
        <div className="md:ml-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-600 mb-4">{movie.genre} | {movie.duration} min</p>
          <p className="mb-6">{movie.synopsis}</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Regarder sur {movie.platform}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;