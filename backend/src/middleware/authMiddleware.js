import jwt from 'jsonwebtoken';
import config from '../config.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret);
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}
