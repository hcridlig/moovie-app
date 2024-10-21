// backend/models/Series.js
const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
  title: String,
  synopsis: String,
  image: String,
  genre: String,
  seasons: Number,
  platform: String,
});

module.exports = mongoose.model('Series', SeriesSchema);