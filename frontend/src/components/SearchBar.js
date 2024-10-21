// src/components/SearchBar.js
import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center max-w-md mx-auto mt-6">
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-l-lg focus:outline-none"
        placeholder="Rechercher un film ou une série..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700">
        Rechercher
      </button>
    </form>
  );
}

export default SearchBar;