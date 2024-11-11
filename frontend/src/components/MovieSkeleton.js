// MovieSkeleton.js

import React from 'react';

function MovieSkeleton() {
  return (
    <div className="w-48 mx-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition duration-300 animate-pulse">
      <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-2">
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded mb-1"></div>
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default MovieSkeleton;
