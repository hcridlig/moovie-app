// backend/controllers/seriesController.js
const axios = require('axios');

// Récupère la clé TMDB depuis les variables d'environnement
// Assure-toi que "API_KEY_TMDB" est bien configuré en local ET sur Azure
const TMDB_API_KEY = process.env.API_KEY_TMDB || 'YOUR_KEY_HERE';

module.exports = {
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
    // Vérifie la clé TMDB
    if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_KEY_HERE') {
      return res.status(500).json({
        error: 'Clé TMDB (API_KEY_TMDB) manquante ou invalide. Vérifiez vos variables d’environnement.',
      });
    }

    try {
      // On récupère les filtres depuis le frontend
      const {
        genre = '',
        platform = '',
        minRating = 0,
        seasons = 0,
        page = 1,
        sortBy = '',
        country = 'FR',
      } = req.query;

      console.log('discoverSeries() - Paramètres reçus :', {
        genre, platform, minRating, seasons, page, sortBy, country,
      });

      // Paramètres internes
      const pageSize = 20;
      const numericPage = parseInt(page, 10) || 1;
      const minSeasons = parseInt(seasons, 10) || 0;
      const minVote = parseFloat(minRating) || 0;

      // Nombre de séries filtrées dont on a besoin avant de pouvoir couvrir 'page'
      const neededCount = numericPage * pageSize;

      let collected = [];
      let tmdbPage = 1;
      let hasMoreTmdbPages = true;

      // On boucle tant qu'on n'a pas assez de séries ET qu'il reste des pages
      while (collected.length < neededCount && hasMoreTmdbPages) {
        const params = {
          api_key: TMDB_API_KEY,
          language: 'fr-FR',
          page: tmdbPage,
          'vote_average.gte': minVote,
          watch_region: country,
        };
        if (genre) params.with_genres = genre;
        if (platform) {
          params.with_watch_providers = platform;
          params.with_watch_monetization_types = 'flatrate';
        }
        if (sortBy) params.sort_by = sortBy;

        console.log('discoverSeries() - Requête /discover/tv - page =', tmdbPage, 'params =', params);

        let results = [];
        let total_pages = 1;

        // 1) Appel /discover/tv
        try {
          const discoverResp = await axios.get('https://api.themoviedb.org/3/discover/tv', { params });
          results = discoverResp.data.results;
          total_pages = discoverResp.data.total_pages;
        } catch (err) {
          console.error('Erreur /discover/tv :', err.message);
          if (err.response) {
            console.error('TMDB status:', err.response.status);
            console.error('TMDB data:', err.response.data);
          }
          throw err; // on renvoie l'erreur vers le catch principal
        }

        if (tmdbPage >= total_pages) {
          hasMoreTmdbPages = false;
        } else {
          tmdbPage++;
        }

        // 2) Pour chaque série, on récupère /tv/{id} afin de connaître le number_of_seasons
        for (const item of results) {
          let detailData;
          try {
            const detailUrl = `https://api.themoviedb.org/3/tv/${item.id}`;
            const detailResp = await axios.get(detailUrl, {
              params: {
                api_key: TMDB_API_KEY,
                language: 'fr-FR',
              },
            });
            detailData = detailResp.data;
          } catch (err) {
            console.error(`Erreur /tv/${item.id} :`, err.message);
            if (err.response) {
              console.error('TMDB status:', err.response.status);
              console.error('TMDB data:', err.response.data);
            }
            // on peut ignorer cette série et continuer la boucle
            continue;
          }

          // Filtre si la série a assez de saisons
          if ((detailData.number_of_seasons || 0) >= minSeasons) {
            collected.push({
              ...item,
              posterUrl: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : '/path/to/default-image.jpg',
              number_of_seasons: detailData.number_of_seasons,
            });
          }

          // Si on a déjà assez de séries pour couvrir la page demandée, on arrête
          if (collected.length >= neededCount) {
            break;
          }
        }
      }

      // Pagination "locale"
      const startIndex = (numericPage - 1) * pageSize;
      const endIndex = numericPage * pageSize;
      const pageItems = collected.slice(startIndex, endIndex);

      // Calcul du total_pages local
      const localTotalPages = Math.ceil(collected.length / pageSize);
      let totalPagesFinal = localTotalPages;
      if (hasMoreTmdbPages && pageItems.length === pageSize) {
        totalPagesFinal = localTotalPages + 1;
      }

      return res.json({
        page: numericPage,
        total_pages: totalPagesFinal,
        results: pageItems,
      });

    } catch (error) {
      console.error('Erreur discoverSeries :', error.message);
      if (error.response) {
        console.error('TMDB status:', error.response.status);
        console.error('TMDB data:', error.response.data);
      }
      return res.status(500).json({ error: 'Erreur lors de la découverte de séries' });
    }
  },
};
