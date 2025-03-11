// backend/models/Series.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seriesSchema = new Schema({
  title: { type: String, required: true },
  synopsis: { type: String },
  posterUrl: { type: String },
  genre: { type: String },
  platform: { type: String },
  releaseDate: { type: Date },
  seasons: { type: Number },
  episodes: { type: Number },
  // Vous pouvez ajouter d'autres champs spécifiques aux séries
});

module.exports = mongoose.model('Series', seriesSchema);