// backend/controllers/authController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    console.log('register');
    try {
      const { username, email, password } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ where: { email } });
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
      console.error(error);  // Log the error for better debugging
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      // Créer un token JWT
      const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1w' });

      res.json({ token, user: { id: user.user_id, username: user.username, email: user.email } });
    } catch (error) {
      console.error(error);  // Log the error for better
      res.status(500).json({ message: 'Erreur lors de la connexion.' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const token = req.header('Authorization');
  
      if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
      }
  
      // Vérifier et décoder le token
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // Vérifier si l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
  
      // Supprimer l'utilisateur
      await user.destroy();
  
      res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
      console.error(error);
  
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token invalide ou expiré.' });
      }
  
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.' });
    }
  }
  
};

module.exports = authController;