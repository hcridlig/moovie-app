// backend/routes/series.js
const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');

// Récupérer la liste des séries avec filtres (similaire à /api/movies/search)
router.get('/', seriesController.getSeries);

// Récupérer les détails d'une série en fonction de son ID
router.get('/:id', seriesController.getSeriesDetail);

// Optionnel : Marquer une série comme vue pour l'utilisateur
router.post('/:id/mark-seen', seriesController.markAsSeen);

module.exports = router;