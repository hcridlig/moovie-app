// src/components/MovieCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ item }) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <img src={item.image} alt={item.title} className="w-full h-48 object-cover"/>
      <div className="p-4">
        <h3 className="text-xl font-semibold">{item.title}</h3>
        <p className="text-gray-600 truncate">{item.synopsis}</p>
        <Link to={`/${item.type}/${item.id}`} className="text-indigo-600 hover:underline">
          En savoir plus
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;