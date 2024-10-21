// backend/models/Movie.js
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: String,
  synopsis: String,
  image: String,
  genre: String,
  duration: Number,
  platform: String,
});

module.exports = mongoose.model('Movie', MovieSchema);