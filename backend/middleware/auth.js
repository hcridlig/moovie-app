// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
  }

  try {
    const decoded = jwt.verify(token, 'votre_secret_jwt');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide.' });
  }
}

module.exports = authMiddleware;