const jwt = require('jsonwebtoken');

// Cek apakah sudah login
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "Token diperlukan" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

// Cek apakah Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Akses ditolak, khusus Admin" });
  next();
};

module.exports = { verifyToken, isAdmin };