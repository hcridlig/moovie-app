const { User, Preference } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
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
        attributes: { exclude: ['password'] }
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
        returning: true,
        individualHooks: true
      });
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      const userWithoutPassword = updatedUser.get({ plain: true });
      delete userWithoutPassword.password;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { user_id: decoded.id } });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Le mot de passe actuel est incorrect.' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
    }
  },

  // Ajoutez les fonctions pour gérer les préférences directement dans l'objet userController
  addPreference: async (req, res) => {
    const { movieId, liked } = req.body; // on attend title et image aussi
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let preference = await Preference.findOne({ where: { user_id: decoded.id, movie_id: movieId } });
      
      if (preference) {
        preference.liked = liked;
        await preference.save();
      } else {
          preference = await UserPreference.create({ userId, movieId, liked });
      }
  
      res.status(200).json({ message: "Preference saved", preference });
    } catch (error) {
      res.status(500).json({ message: "Error saving preference", error });
    }
  },

  getPreferences: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accès non autorisé' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in env variables
        const userId = decoded.id;

        const preferences = await Preference.findAll({ where: { user_id: userId } });
        res.json(preferences);
    } catch (error) {
        console.error('Erreur lors de la récupération des préférences', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
};

module.exports = userController;
