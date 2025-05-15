const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;

