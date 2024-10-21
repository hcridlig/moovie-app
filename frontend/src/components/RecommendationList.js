// frontend/src/components/RecommendationList.js
import React from 'react';
import MovieCard from './MovieCard';

function RecommendationList({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <MovieCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default RecommendationList;