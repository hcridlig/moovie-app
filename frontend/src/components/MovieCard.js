// src/components/MovieCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ item }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
        <p className="text-gray-600">Plateforme : {item.platform}</p>
        <Link
          to={`/${item.type}/${item.id}`}
          className="text-indigo-600 hover:underline block mt-4"
        >
          Voir plus de détails
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;