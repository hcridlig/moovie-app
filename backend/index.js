const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { syncModels } = require('./models'); // Sync function

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/movies', movieRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await syncModels(); // Synchronize models
  } catch (error) {
    console.error('Error during model synchronization:', error);
  }
});
