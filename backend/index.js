// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { syncModels } = require('./models'); // Importer la fonction de synchronisation

const app = express();

// Configuration
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Démarrer le serveur et synchroniser les modèles
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  try {
    await syncModels(); // Synchroniser les modèles
  } catch (error) {
    console.error('Erreur lors de la synchronisation des modèles :', error);
  }
});
