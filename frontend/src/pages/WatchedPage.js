// src/pages/WatchedPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

function WatchedPage() {
  const [watchedItems, setWatchedItems] = useState([]);
  const [groupedByPlatform, setGroupedByPlatform] = useState({});

  useEffect(() => {
    // Appel à l'API pour récupérer les films et séries vus par l'utilisateur
    const fetchWatchedItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me/watched', {
          headers: {
            Authorization: localStorage.getItem('token'), // Assurez-vous que le token JWT est bien dans le localStorage
          },
        });
        const items = response.data;
        setWatchedItems(items);

        // Grouper les éléments par plateforme
        const grouped = items.reduce((acc, item) => {
          acc[item.platform] = acc[item.platform] || [];
          acc[item.platform].push(item);
          return acc;
        }, {});
        setGroupedByPlatform(grouped);
      } catch (error) {
        console.error('Erreur lors de la récupération des éléments vus', error);
      }
    };

    fetchWatchedItems();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vos Films et Séries Vus</h1>

      {Object.keys(groupedByPlatform).length === 0 ? (
        <p className="text-gray-600">Vous n'avez encore vu aucun film ou série.</p>
      ) : (
        Object.keys(groupedByPlatform).map((platform) => (
          <section key={platform} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {platform}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {groupedByPlatform[platform].map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default WatchedPage;