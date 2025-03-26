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
  }
};

// Ajoutez les fonctions pour gérer les préférences directement dans l'objet userController
userController.addPreference = async (req, res) => {
  const { movieId, opinion, title, image } = req.body; // on attend title et image aussi
  const userId = req.user.user_id;
  try {
    let pref = await Preference.findOne({ where: { user_id: userId, movie_id: movieId } });
    if (pref) {
      if (pref.preference_type !== opinion) {
        pref.preference_type = opinion;
        pref.title = title;
        pref.image = image;
        await pref.save();
        return res.json({ message: 'Préférence mise à jour', preference: pref });
      }
      return res.json({ message: 'Préférence déjà définie', preference: pref });
    }
    pref = await Preference.create({
      user_id: userId,
      movie_id: movieId,
      preference_type: opinion,
      title,
      image,
    });
    res.status(201).json({ message: 'Préférence créée', preference: pref });
  } catch (error) {
    console.error('Erreur lors de l’ajout de la préférence', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

userController.getPreferences = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const preferences = await Preference.findAll({ where: { user_id: userId } });
    res.json(preferences);
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = userController;
