// backend/routes/series.js
const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');

// Nouveau endpoint pour récupérer des séries filtrées (minSeasons, etc.)
router.get('/discover', seriesController.discoverSeries);

// Récupérer la liste des séries tendances
router.get('/', seriesController.getTrendingSeries);

// Récupérer les détails d'une série en fonction de son ID
router.get('/:id', seriesController.getSeriesDetail);

// Optionnel : Marquer une série comme vue pour l'utilisateur
router.post('/:id/mark-seen', seriesController.markAsSeen);

router.get('/recommended/:serieId', seriesController.getRecommendedSeries);

module.exports = router;