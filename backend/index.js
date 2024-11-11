const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Référence directe à l'instance Sequelize exportée depuis db.js

<<<<<<< HEAD
const User = sequelize.define('user', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',  // Nom de la table dans la base de données
  timestamps: false,   // Désactivation des champs createdAt et updatedAt auto-générés
=======
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
>>>>>>> 8a77598652c135e3d6b7d01432368cc41e3f3822
});

module.exports = User;

