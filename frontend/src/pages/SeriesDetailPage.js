// src/pages/SerieDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SerieDetailPage = () => {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);

  useEffect(() => {
    const fetchSerieDetail = async () => {
      try {
        const response = await axios.get(`/api/series/${id}`);
        setSerie(response.data.serie);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la série :", error);
      }
    };
    fetchSerieDetail();
  }, [id]);

  if (!serie) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="serie-detail-page">
      <h2>{serie.title}</h2>
      <img src={serie.posterUrl} alt={serie.title} className="serie-detail-poster" />
      <p>{serie.synopsis}</p>
      <p><strong>Genre :</strong> {serie.genre}</p>
      <p><strong>Plateforme :</strong> {serie.platform}</p>
      <p><strong>Date de sortie :</strong> {serie.releaseDate}</p>
      {/* Ajoutez ici d'autres informations spécifiques aux séries (nombre de saisons, casting, etc.) */}
    </div>
  );
};

export default SerieDetailPage;