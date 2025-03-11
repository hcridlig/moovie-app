// backend/controllers/seriesController.js
const Series = require('../models/Series');

exports.getSeries = async (req, res) => {
  try {
    const { search, genre, platform } = req.query;
    let query = {};

    if (search) {
      // Recherche insensible à la casse dans le titre
      query.title = { $regex: search, $options: 'i' };
    }
    if (genre) {
      query.genre = genre;
    }
    if (platform) {
      query.platform = platform;
    }
    
    const series = await Series.find(query);
    res.json({ series });
  } catch (error) {
    console.error("Erreur lors de la récupération des séries :", error);
    res.status(500).json({ error: 'Erreur lors de la récupération des séries' });
  }
};

exports.getSeriesDetail = async (req, res) => {
  try {
    const seriesId = req.params.id;
    const serie = await Series.findById(seriesId);
    if (!serie) {
      return res.status(404).json({ error: 'Série non trouvée' });
    }
    res.json({ serie });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la série :", error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de la série' });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    // Implémentez ici la logique pour marquer la série comme vue pour l'utilisateur connecté.
    // Par exemple, mettre à jour le document utilisateur pour y ajouter l'ID de la série.
    res.json({ message: "Série marquée comme vue" });
  } catch (error) {
    console.error("Erreur lors du marquage de la série comme vue :", error);
    res.status(500).json({ error: "Erreur lors du marquage de la série comme vue" });
  }
};
