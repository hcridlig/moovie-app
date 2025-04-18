// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Inscription
router.post('/register', authController.register);

// Connexion
router.post('/login', authController.login);

// Delete user
router.delete('/delete', authController.deleteUser);

module.exports = router;