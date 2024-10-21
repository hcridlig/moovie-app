// backend/routes/movies.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/auth');

// Récupérer tous les films
router.get('/', movieController.getAllMovies);

// Récupérer un film par ID
router.get('/:id', movieController.getMovieById);

// Ajouter un nouveau film (protégé)
router.post('/', authMiddleware, movieController.createMovie);

// Mettre à jour un film (protégé)
router.put('/:id', authMiddleware, movieController.updateMovie);

// Supprimer un film (protégé)
router.delete('/:id', authMiddleware, movieController.deleteMovie);

module.exports = router;