// backend/controllers/userController.js
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] } // Exclude password from the result
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
  },

  getProfile: async (req, res) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        where: { user_id: decoded.id },
        attributes: { exclude: ['password'] } // Exclude password from the result
      });
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
    }
  },


  updateProfile: async (req, res) => {
    try {
      const [affectedRows, [updatedUser]] = await User.update(req.body, {
        where: { user_id: req.user.id },
        returning: true, // returns the updated user
        individualHooks: true // runs any hooks if defined in your model
      });

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const userWithoutPassword = updatedUser.get({ plain: true });
      delete userWithoutPassword.password; // remove password from the response
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
    }
  },


  addWatchedItem: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const movie = await Movie.findById(req.body.movieId);
      if (!movie) {
        return res.status(404).json({ message: 'Film non trouvé.' });
      }
      if (!user.watchedItems.includes(movie._id)) {
        user.watchedItems.push(movie._id);
        await user.save();
      }
      res.json({ message: 'Film ajouté aux éléments vus.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'ajout du film aux éléments vus.' });
    }
  },

  getWatchedItems: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('watchedItems');
      res.json(user.watchedItems);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des éléments vus.' });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    try {
      const user = await User.findOne({ where: { user_id: decoded.id } });
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Le mot de passe actuel est incorrect.' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
    }
  },
};

module.exports = userController;