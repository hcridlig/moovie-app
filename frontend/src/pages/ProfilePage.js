// src/pages/ProfilePage.js
import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [watchedItems, setWatchedItems] = useState([]);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur et les éléments vus depuis l'API
    setUser({ username: 'Utilisateur123', email: 'user@example.com' });
    setWatchedItems([
      { id: 1, title: 'Film Vu 1', synopsis: 'Synopsis...', image: '/path/to/image', type: 'movie' },
      // Autres éléments vus...
    ]);
  }, []);

  if (!user) {
    return <p className="text-center mt-8">Chargement...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Bonjour, {user.username}</h1>
      <p className="text-gray-600 mb-8">Email: {user.email}</p>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Vos Films et Séries Vus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {watchedItems.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;