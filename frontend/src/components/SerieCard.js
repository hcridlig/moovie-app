// src/components/SerieCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function SerieCard({ serie, index }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/series/${serie.id}`);
  };

  return (
    <div 
      onClick={handleClick} 
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 w-48 mx-4 cursor-pointer relative"
    >
      {index && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs font-semibold rounded-full px-2 py-1">
          {index}
        </div>
      )}
      <img
        src={
          serie.posterUrl
            ? serie.posterUrl
            : 'https://media.istockphoto.com/id/1642381175/fr/vectoriel/cin%C3%A9ma.jpg?s=612x612&w=0&k=20&c=obVOGQkJifaPk9lSf1-YrrmNQAQnHbKSCQ1JvnpDO00='
        }
        alt={serie.title || serie.name}
        className="w-full h-64 object-cover"
      />
      <div className="p-2">
        <h3
          className="text-lg font-bold mb-1 dark:text-white text-center overflow-hidden text-ellipsis whitespace-normal"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {serie.title || serie.name}
        </h3>
      </div>
    </div>
  );
}

export default SerieCard;
