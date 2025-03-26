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
    try {
      const { movieId, liked, mediaType } = req.body; 
      // Si vous envoyez aussi media_type, title, image, il faudra éventuellement les extraire ici,
      // mais seulement si votre table "preferences" a des colonnes correspondantes.

      // Récupération du token JWT
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        return res.status(401).json({ message: 'Token manquant' });
      }
      const token = authHeader.split(' ')[1];

      // Décodage du token pour avoir l'ID utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Vérifier si la préférence existe déjà
      let preference = await Preference.findOne({ 
        where: { user_id: userId, movie_id: movieId }
      });

      if (preference) {
        // Mettre à jour la préférence existante
        preference.liked = liked; // liked doit être un booléen (true/false)
        await preference.save();
      } else {
        // Créer une nouvelle préférence
        preference = await Preference.create({
          user_id: userId,
          movie_id: movieId,
          liked, // true ou false
          media_type: mediaType // 'movie' ou 'serie
        });
      }

      return res.status(200).json({ message: 'Preference saved', preference });
    } catch (error) {
      console.error('Erreur lors de addPreference:', error);
      return res.status(500).json({ message: 'Error saving preference', error });
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
