// src/pages/SeriesDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSeriesById } from '../utils/api'; // Fonction pour récupérer la série via l'API

function SeriesDetailPage() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);

  useEffect(() => {
    // Récupérer les détails de la série depuis l'API
    getSeriesById(id).then((data) => setSeries(data));
  }, [id]);

  if (!series) {
    return <p className="text-center mt-8">Chargement...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <img src={series.image} alt={series.title} className="w-full md:w-1/3 rounded-lg shadow-lg" />
        <div className="md:ml-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
          <p className="text-gray-600 mb-4">{series.genre} | {series.seasons} saisons</p>
          <p className="mb-6">{series.synopsis}</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Regarder sur {series.platform}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeriesDetailPage;