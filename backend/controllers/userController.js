// backend/controllers/userController.js
const { User } = require('../models/User');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
      res.json(updatedUser);
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

    try {
      const user = await User.findById(req.user.id);
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