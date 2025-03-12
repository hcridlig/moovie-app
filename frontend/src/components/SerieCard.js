// src/components/SerieCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function SerieCard({ serie }) {
  return (
    <div className="serie-card">
      <Link to={`/series/${serie.id}`}>
        <img src={serie.posterUrl} alt={serie.title} className="serie-poster" />
        <h3 className="serie-title">{serie.title}</h3>
      </Link>
    </div>
  );
}

export default SerieCard;
