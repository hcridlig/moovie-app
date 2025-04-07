// backend/controllers/seriesController.js
const axios = require('axios');
const { SerieEmbedding, sequelize } = require('../models');

// Récupère la clé TMDB depuis les variables d'environnement
// Assure-toi que "API_KEY_TMDB" est bien configuré en local ET sur Azure
const TMDB_API_KEY = process.env.API_KEY_TMDB || 'YOUR_KEY_HERE';


const seriesController = {
  /**
   * ----------------
   * getTrendingSeries
   * ----------------
   */
  getTrendingSeries: async (req, res) => {
    // Vérifie la clé TMDB
    if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_KEY_HERE') {
      return res.status(500).json({
        error: 'Clé TMDB (API_KEY_TMDB) manquante ou invalide. Vérifiez vos variables d’environnement.',
      });
    }

    const url = `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}`;
    try {
      const response = await axios.get(url);
      const top10Series = response.data.results.slice(0, 10);
      return res.json(top10Series);
    } catch (error) {
      console.error('Erreur getTrendingSeries:', error.message);
      if (error.response) {
        console.error('TMDB status:', error.response.status);
        console.error('TMDB data:', error.response.data);
      }
      return res.status(500).json({ error: 'Impossible de récupérer les séries tendances.' });
    }
  },

  /**
   * ---------------
   * getSeriesDetail
   * ---------------
   */
  getSeriesDetail: async (req, res) => {
    // Vérifie la clé TMDB
    if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_KEY_HERE') {
      return res.status(500).json({
        error: 'Clé TMDB (API_KEY_TMDB) manquante ou invalide. Vérifiez vos variables d’environnement.',
      });
    }

    try {
      const seriesId = req.params.id;
      console.log('getSeriesDetail() - seriesId:', seriesId);

      const detailUrl = `https://api.themoviedb.org/3/tv/${seriesId}`;
      const detailResp = await axios.get(detailUrl, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'fr-FR',
          append_to_response: 'credits',
        },
      });
      return res.json(detailResp.data);

    } catch (error) {
      console.error('Erreur getSeriesDetail :', error.message);
      if (error.response) {
        console.error('TMDB status:', error.response.status);
        console.error('TMDB data:', error.response.data);
      }
      return res.status(500).json({ error: 'Erreur lors de la récupération des détails de la série' });
    }
  },

  /**
   * -----------
   * markAsSeen
   * -----------
   */
  markAsSeen: async (req, res) => {
    try {
      // Exemple minimaliste
      res.json({ message: 'Série marquée comme vue' });
    } catch (error) {
      console.error('Erreur markAsSeen :', error);
      res.status(500).json({ error: 'Erreur lors du marquage de la série comme vue' });
    }
  },

  /**
   * ---------------
   * discoverSeries
   * ---------------
   */
 discoverSeries: async (req, res) => {
    try {
      const {
        genre = '',
        platform = '',
        minRating = 0,
        seasons = 0,
        page = 1,
        sortBy = '',
        country = 'FR',
      } = req.query;

      console.log('discoverSeries() - Paramètres reçus :', { genre, platform, minRating, seasons, page, sortBy, country });

      const pageSize = 20;
      const numericPage = parseInt(page, 10) || 1;
      const minSeasons = parseInt(seasons, 10) || 0;
      const minVote = parseFloat(minRating) || 0;
      const neededCount = numericPage * pageSize;

      let collected = [];
      let tmdbPage = 1;
      let hasMoreTmdbPages = true;
      const maxTmdbPages = 10; // Évite trop de requêtes

      while (collected.length < neededCount && hasMoreTmdbPages && tmdbPage <= maxTmdbPages) {
        const params = {
          api_key: TMDB_API_KEY,
          language: 'fr-FR',
          page: tmdbPage,
          'vote_average.gte': minVote,
          watch_region: country,
          with_genres: genre || undefined,
          with_watch_providers: platform || undefined,
          with_watch_monetization_types: platform ? 'flatrate' : undefined,
          sort_by: sortBy || undefined,
        };

        console.log('discoverSeries() - Requête TMDB - Page :', tmdbPage);

        try {
          const { data } = await axios.get('https://api.themoviedb.org/3/discover/tv', { params });
          const results = data.results || [];
          const total_pages = data.total_pages;

          if (tmdbPage >= total_pages) hasMoreTmdbPages = false;
          tmdbPage++;

          // Récupérer les IDs des séries pour les détails
          const seriesDetails = await Promise.allSettled(
            results.map((item) =>
              axios.get(`https://api.themoviedb.org/3/tv/${item.id}`, {
                params: { api_key: TMDB_API_KEY, language: 'fr-FR' },
              })
            )
          );

          seriesDetails.forEach((detail, index) => {
            if (detail.status === 'fulfilled') {
              const detailData = detail.value.data;
              if ((detailData.number_of_seasons || 0) >= minSeasons) {
                collected.push({
                  ...results[index],
                  posterUrl: results[index].poster_path
                    ? `https://image.tmdb.org/t/p/w500${results[index].poster_path}`
                    : '/path/to/default-image.jpg',
                  number_of_seasons: detailData.number_of_seasons,
                });
              }
            }
          });

        } catch (err) {
          console.error('Erreur API TMDB:', err.message);
          if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Détails:', err.response.data);
          }
          break;
        }
      }

      const startIndex = (numericPage - 1) * pageSize;
      const pageItems = collected.slice(startIndex, startIndex + pageSize);
      const totalPagesFinal = hasMoreTmdbPages && pageItems.length === pageSize
        ? Math.ceil(collected.length / pageSize) + 1
        : Math.ceil(collected.length / pageSize);

      return res.json({ page: numericPage, total_pages: totalPagesFinal, results: pageItems });

    } catch (error) {
      console.error('Erreur discoverSeries:', error.message);
      return res.status(500).json({ error: 'Erreur lors de la découverte de séries' });
    }
  },

  /**
   * ---------------
   * getRecommendedSeries
   * ---------------
   */
  getRecommendedSeries: async (req, res) => {
    const { serieId } = req.params;
      const limit = 6;
      try {
        // Fetch the embedding for the given movie_id
        const serieEmbedding = await SerieEmbedding.findByPk(serieId);
        if (!serieEmbedding) {
          throw new Error('Serie embedding not found');
        }
    
        // Execute the SQL command to find the nearest neighbors
        const nearestNeighbors = await sequelize.query(
          `SELECT * FROM serie_embeddings ORDER BY embeddings <-> (SELECT embeddings FROM serie_embeddings WHERE serie_id = :serieId) LIMIT :limit`,
          {
            replacements: { serieId, limit },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        
        // Fetch movie names from TMDB
        const neighborsWithNames = await Promise.all(
          nearestNeighbors.map(async (neighbor) => {
            const serieName = await seriesController.getSerieNameFromTmdb(neighbor.serie_id);
            return { ...neighbor, serie_name: serieName };
          })
        );

        // Return the list of recommended movies
        res.json(neighborsWithNames);
      } catch (error) {
        console.error('Error calculating nearest neighbors:', error);
        throw error;
  }
},

async getSerieNameFromTmdb(serieId) {
      const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
      console.log('getSerieNameFromTmdb() - serieId:', serieId);
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/${serieId}`, {
          params: {
            api_key: process.env.API_KEY_TMDB,
          },
        });
        return response.data.name;
      } catch (error) {
        console.error('Error fetching movie name from TMDB:', error);
        throw error;
      }
    }

};

module.exports = seriesController;