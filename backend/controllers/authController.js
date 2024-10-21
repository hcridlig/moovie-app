// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer un nouvel utilisateur
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      // Créer un token JWT
      const token = jwt.sign({ id: user._id }, 'votre_secret_jwt', { expiresIn: '1h' });

      res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion.' });
    }
  },
};

module.exports = authController;