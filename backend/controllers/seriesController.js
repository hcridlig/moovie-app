// backend/controllers/seriesController.js
const axios = require('axios');

const seriesController = {
  getTrendingSeries: async (req, res) => {
    const url = `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.API_KEY_TMDB}`;
    try {
      const response = await axios.get(url);
      // Filter the top 10 movies
      const top10Series = response.data.results.slice(0, 10);
      res.json(top10Series);
    } catch (error) {
      console.error("Error fetching top 10 series: ", error);
      return [];
    }
  },

  getSeriesDetail: async (req, res) => {
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
  },

  markAsSeen: async (req, res) => {
    try {
      // Implémentez ici la logique pour marquer la série comme vue pour l'utilisateur connecté.
      // Par exemple, mettre à jour le document utilisateur pour y ajouter l'ID de la série.
      res.json({ message: "Série marquée comme vue" });
    } catch (error) {
      console.error("Erreur lors du marquage de la série comme vue :", error);
      res.status(500).json({ error: "Erreur lors du marquage de la série comme vue" });
    }
  },
};

module.exports = seriesController;