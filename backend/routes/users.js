// backend/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/', userController.getAllUsers);

// Récupérer les informations de l'utilisateur connecté
router.get('/me', authMiddleware, userController.getProfile);

// Mettre à jour les informations de l'utilisateur
router.put('/me', authMiddleware, userController.updateProfile);

// Ajouter un film/série aux éléments vus
router.post('/me/watched', authMiddleware, userController.addWatchedItem);

// Récupérer les éléments vus par l'utilisateur
router.get('/me/watched', authMiddleware, userController.getWatchedItems);

// Récupérer les informations de l'utilisateur connecté
router.get('/me', authMiddleware, userController.getProfile);

// Mettre à jour les informations de l'utilisateur
router.put('/me', authMiddleware, userController.updateProfile);

// Changer le mot de passe
router.put('/me/password', authMiddleware, userController.changePassword);

module.exports = router;