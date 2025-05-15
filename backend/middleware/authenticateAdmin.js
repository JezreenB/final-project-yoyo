const authenticateAdmin = (req, res, next) => {
<<<<<<< HEAD
  console.log('authenticateAdmin - req.user:', req.user);
  console.log('authenticateAdmin - req.user.role:', req.user ? req.user.role : 'undefined');
=======
>>>>>>> cb24943cc1ae5541c634ca51e3a502a4657ce3ae
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = authenticateAdmin;
