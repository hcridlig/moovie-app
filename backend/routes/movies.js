// backend/routes/users.js
const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');

// Récupérer les films tendances
router.get('/', moviesController.getTrendingMovies);

router.get('/recommended/:movieId', moviesController.getRecommendedMovies);


module.exports = router;