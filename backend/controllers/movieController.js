// backend/controllers/movieController.js
const Movie = require('../models/Movie');

const movieController = {
  getAllMovies: async (req, res) => {
    try {
      const movies = await Movie.find();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des films.' });
    }
  },

  getMovieById: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: 'Film non trouvé.' });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du film.' });
    }
  },

  createMovie: async (req, res) => {
    try {
      const newMovie = new Movie(req.body);
      await newMovie.save();
      res.status(201).json(newMovie);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du film.' });
    }
  },

  updateMovie: async (req, res) => {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedMovie) {
        return res.status(404).json({ message: 'Film non trouvé.' });
      }
      res.json(updatedMovie);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du film.' });
    }
  },

  deleteMovie: async (req, res) => {
    try {
      const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
      if (!deletedMovie) {
        return res.status(404).json({ message: 'Film non trouvé.' });
      }
      res.json({ message: 'Film supprimé avec succès.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du film.' });
    }
  },
};

module.exports = movieController;