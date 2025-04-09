const { User, Preference, UserPlatform, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { get } = require('../routes/users');

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

  // Modification de getProfile pour éventuellement inclure les plateformes associées.
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

      // Inclure les plateformes associées
      const platforms = await UserPlatform.findAll({
        where: { user_id: decoded.id },
        attributes: ['platform_id']
      });
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      const profileData = {
        user,
        platforms: platforms.map(platform => platform.platform_id)
    };

    res.json(profileData);
    
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
    }
  },

  /*updateProfile: async (req, res) => {
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
  },*/

  updateProfile: async (req, res) => {
    try {
      // Récupérer l'ID utilisateur à partir du token
      const authHeader = req.header('Authorization');
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing.' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      // Extraire streamingPlatforms et les autres champs à mettre à jour
      const { streamingPlatforms, ...fieldsToUpdate } = req.body;
      
      // Récupérer l'utilisateur actuel
      let userInstance = await User.findOne({ where: { user_id: userId } });
      if (!userInstance) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      
      // Mettre à jour les champs (username, email, etc.) s'ils sont présents
      if (Object.keys(fieldsToUpdate).length > 0) {
        // Met à jour les autres champs
        await userInstance.update(fieldsToUpdate);
      }
      
      // Mise à jour des plateformes de streaming, que le tableau soit vide ou non
      if (Array.isArray(streamingPlatforms)) {
        // Supprimer les associations existantes
        await UserPlatform.destroy({ where: { user_id: userId } });
        // Ajouter les nouvelles associations si le tableau n'est pas vide
        if (streamingPlatforms.length > 0) {
          const newAssociations = streamingPlatforms.map(pid => ({
            user_id: userId,
            platform_id: Number(pid)
          }));
          await UserPlatform.bulkCreate(newAssociations);
        }
      }
      
      // Récupérer les plateformes mises à jour
      const platforms = await UserPlatform.findAll({
        where: { user_id: userId },
        attributes: ['platform_id']
      });
      
      // Construire l'objet à renvoyer (sans le mot de passe)
      const userWithoutPassword = userInstance.get({ plain: true });
      userWithoutPassword.streamingPlatforms = platforms.map(p => p.platform_id);
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Erreur updateProfile:', error);
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

  deletePreference: async (req, res) => {
    try {
      const { movieId } = req.body; // Get movieId from request body
  
      // Retrieve the JWT token
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        return res.status(401).json({ message: 'Token manquant' });
      }
      const token = authHeader.split(' ')[1];
  
      // Decode the token to get the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // Find the preference to delete
      const preference = await Preference.findOne({ 
        where: { user_id: userId, movie_id: movieId }
      });
  
      if (!preference) {
        return res.status(404).json({ message: 'Préférence non trouvée' });
      }
  
      // Delete the preference
      await preference.destroy();
  
      return res.status(200).json({ message: 'Préférence supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de deletePreference:', error);
      return res.status(500).json({ message: 'Erreur lors de la suppression de la préférence', error });
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
  },

  /*getRecommendations: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accès non autorisé' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in env variables
        const userId = decoded.id;

        const preferences = await sequelize.query(
            `SELECT m.movie_id
            FROM users u, movie_embeddings m
            WHERE u.user_id = :userId
            ORDER BY u.user_embedding <#> m.embeddings ASC  -- or DESC depending on operator
            LIMIT 10;`,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        


        res.json(preferences);
    } catch (error) {
        console.error('Erreur lors de la récupération des recommandations', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }*/

    getRecommendations: async (req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Accès non autorisé' });
      }
  
      const token = authHeader.split(' ')[1];
  
      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in env variables
          const userId = decoded.id;
  
          const preferences = await sequelize.query(
              `WITH liked_movies AS (
              SELECT movie_id
              FROM preferences
              WHERE user_id = :userId AND liked = TRUE AND media_type = 'movie'
              ),
              liked_embeddings AS (
              SELECT movie_id, embeddings
              FROM movie_embeddings
              WHERE movie_id IN (SELECT movie_id FROM liked_movies)
              ),
              neighbors AS (
              SELECT 
                lm.movie_id AS liked_movie_id,
                me.movie_id AS neighbor_movie_id,
                me.embeddings <=> lm.embeddings AS distance
              FROM liked_embeddings lm
              JOIN movie_embeddings me
                ON lm.movie_id != me.movie_id
              )
              SELECT liked_movie_id, neighbor_movie_id
              FROM (
              SELECT 
                liked_movie_id, 
                neighbor_movie_id,
                distance,
                ROW_NUMBER() OVER (PARTITION BY liked_movie_id ORDER BY distance ASC) AS rn
              FROM neighbors
              ) ranked
              WHERE rn <= 3;`,
              {
                  replacements: { userId },
                  type: sequelize.QueryTypes.SELECT,
              }
          );
          
  
  
          res.json(preferences);
      } catch (error) {
          console.error('Erreur lors de la récupération des recommandations', error);
          res.status(500).json({ error: 'Erreur interne du serveur' });
      }
    }


  
};

module.exports = userController;
