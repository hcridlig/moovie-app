// src/components/MovieCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function MovieCard({ item, index }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${item.id}`);
  };

  return (
    <div 
      onClick={handleClick} 
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 w-48 mx-4 cursor-pointer relative"
    >
      {/* Badge de numéro translucide en haut à gauche */}
      {index && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs font-semibold rounded-full px-2 py-1">
          {index}
        </div>
      )}

      <img
        src={
          item.image
            ? item.image
            : 'https://media.istockphoto.com/id/1642381175/fr/vectoriel/cin%C3%A9ma.jpg?s=612x612&w=0&k=20&c=obVOGQkJifaPk9lSf1-YrrmNQAQnHbKSCQ1JvnpDO00='
        }
        alt={item.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-2">
        {/* Limite à 2 lignes, puis coupe avec "..." */}
        <h3
          className="text-lg font-bold mb-1 dark:text-white text-center overflow-hidden text-ellipsis whitespace-normal"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.title}
        </h3>
      </div>
    </div>
  );
}

export default MovieCard;
