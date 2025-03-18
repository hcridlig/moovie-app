// src/pages/WatchedPage.js
import React, { useEffect, useState } from 'react';
import { getWatchedItems } from '../utils/api';

function WatchedPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchWatchedItems = async () => {
      try {
        const data = await getWatchedItems();
        setItems(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des éléments visionnés :", error);
      }
    };
    fetchWatchedItems();
    // Si apiUrl n'est pas utilisé, il n'est pas nécessaire de l'ajouter aux dépendances
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Films Visionnés</h1>
      {items.length === 0 ? (
        <p>Aucun film visionné.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WatchedPage;
