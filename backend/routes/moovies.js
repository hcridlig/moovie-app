// backend/routes/users.js
const express = require('express');
const router = express.Router();
const mooviesController = require('../controllers/mooviesController');

// Récupérer les films tendances
router.get('/', mooviesController.getTrendingMoovies);




module.exports = router;