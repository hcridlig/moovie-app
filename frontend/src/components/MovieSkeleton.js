// MovieSkeleton.js

import React from 'react';

function MovieSkeleton() {
  return (
    <div className="w-48 h-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg">
      <div className="h-40 bg-gray-400 dark:bg-gray-600 rounded-t-lg"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default MovieSkeleton;