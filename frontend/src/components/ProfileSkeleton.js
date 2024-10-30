// src/components/ProfileSkeleton.js

import React from 'react';

function ProfileSkeleton({ theme }) {
  const bgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300';
  const secondaryBgClass = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200';

  return (
    <div className={`container mx-auto px-4 py-8 mt-12 max-w-lg mx-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4 animate-pulse">{' '}</h1>
      <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} animate-pulse`}>
        <div className="mb-4">
          <div className={`h-6 w-3/4 ${bgClass} rounded mb-2`}></div>
          <div className={`h-4 w-1/2 ${secondaryBgClass} rounded`}></div>
        </div>
        <div className="mb-4">
          <div className={`h-6 w-3/4 ${bgClass} rounded mb-2`}></div>
          <div className={`h-4 w-1/2 ${secondaryBgClass} rounded`}></div>
        </div>
        <div className="mb-4">
          <div className={`h-6 w-3/4 ${bgClass} rounded mb-2`}></div>
          <div className={`h-4 w-1/2 ${secondaryBgClass} rounded`}></div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSkeleton;