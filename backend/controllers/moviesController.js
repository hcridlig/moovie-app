// backend/controllers/mooviesController.js
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
};

module.exports = moviesController;