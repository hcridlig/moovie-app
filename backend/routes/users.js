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

// Changer le mot de passe
router.put('/me/password', authMiddleware, userController.changePassword);


// Ajouter ou mettre à jour la préférence d’un film
router.post('/me/preferences', authMiddleware, userController.addPreference);

// Récupérer les préférences de l’utilisateur (films visionnés avec opinion)
router.get('/me/preferences', authMiddleware, userController.getPreferences);

// Supprimer une préférence
router.delete('/me/preferences', authMiddleware, userController.deletePreference);

module.exports = router;