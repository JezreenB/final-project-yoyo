const authenticateAdmin = (req, res, next) => {
  console.log('authenticateAdmin - req.user:', req.user);
  console.log('authenticateAdmin - req.user.role:', req.user ? req.user.role : 'undefined');
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = authenticateAdmin;
