// backend/controllers/mooviesController.js
const { MovieEmbedding, sequelize} = require('../models');
const axios = require('axios');

const moviesController = {
    getTrendingMovies: async (req, res) => {
        const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.API_KEY_TMDB}`;
        try {
            const response = await axios.get(url);
            // Filter the top 10 movies
            const top10Movies = response.data.results.slice(0, 10);
            res.json(top10Movies);
          } catch (error) {
            console.error("Error fetching top 10 movies: ", error);
            return [];
          }
      },

    getRecommendedMovies: async (req, res) => {
      const { movieId } = req.params;
      const limit = 6;
      console.log('movieId:', movieId);
      try {
        // Fetch the embedding for the given movie_id
        const movieEmbedding = await MovieEmbedding.findByPk(movieId);
        if (!movieEmbedding) {
          throw new Error('Movie embedding not found');
        }
    
        // Execute the SQL command to find the nearest neighbors
        const nearestNeighbors = await sequelize.query(
          `SELECT * FROM movie_embeddings ORDER BY embeddings <-> (SELECT embeddings FROM movie_embeddings WHERE movie_id = :movieId) LIMIT :limit`,
          {
            replacements: { movieId, limit },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        
        // Fetch movie names from TMDB
        const neighborsWithNames = await Promise.all(
          nearestNeighbors.map(async (neighbor) => {
            const movieName = await moviesController.getMovieNameFromTmdb(neighbor.movie_id);
            return { ...neighbor, movie_name: movieName };
          })
        );

        // Return the list of recommended movies
        res.json(neighborsWithNames);
      } catch (error) {
        console.error('Error calculating nearest neighbors:', error);
        throw error;
      }
      
    },
   async getMovieNameFromTmdb(movieId) {
      const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
          params: {
            api_key: process.env.API_KEY_TMDB,
          },
        });
        return response.data.title;
      } catch (error) {
        console.error('Error fetching movie name from TMDB:', error);
        throw error;
      }
    }
};

module.exports = moviesController;