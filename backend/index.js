// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Configuration
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mooviesRoutes = require('./routes/moovies');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/moovies', mooviesRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
