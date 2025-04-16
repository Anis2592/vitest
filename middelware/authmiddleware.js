import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'testsecret', (err, user) => {

    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user; 
    next();
  });
};
