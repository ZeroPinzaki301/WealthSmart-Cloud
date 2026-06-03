import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

// List of public paths that don't require authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register', 
  '/api/auth/refresh-token',
  '/api/auth/verify-email',
  '/api/auth/resend-verification'
];

export const protect = async (req, res, next) => {
  // Skip authentication for public paths
  if (publicPaths.some(path => req.originalUrl.includes(path))) {
    console.log('✅ Public route, skipping auth:', req.originalUrl);
    return next();
  }
  
  console.log('🔐 Protected route, checking token:', req.originalUrl);
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'your-secret-key');
    
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};