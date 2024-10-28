// src/components/MovieCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function MovieCard({ item }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${item.id}`);
  };

  return (
    <div 
      onClick={handleClick} 
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 w-48 mx-4 cursor-pointer" // Largeur réduite et espacement ajusté
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-64 object-cover" // Hauteur inchangée
      />
      <div className="p-2">
        <h3 className="text-lg font-bold mb-1 dark:text-white text-center">{item.title}</h3>
      </div>
    </div>
  );
}

export default MovieCard;
