const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    // Optional debug logging (enable with DEBUG_AUTH=true in .env)
    const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true';
    
    if (DEBUG_AUTH) {
      console.log('[Auth Middleware] === REQUEST RECEIVED ===');
      console.log('[Auth Middleware] Method:', req.method);
      console.log('[Auth Middleware] URL:', req.url);
      console.log('[Auth Middleware] Path:', req.path);
      console.log('[Auth Middleware] Authorization Header:', req.headers.authorization ? 'Present' : 'Missing');
      console.log('[Auth Middleware] Authorization Value:', req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'N/A');
    }
    
    let token;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim(); // Remove "Bearer " prefix and trim whitespace
    } else if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1]?.trim();
    }

    if (!token) {
      if (DEBUG_AUTH) {
        console.log('[Auth Middleware] ❌ NO TOKEN - Missing Authorization header or invalid format');
      }
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please login.' 
      });
    }
    
    if (DEBUG_AUTH) {
      console.log('[Auth Middleware] ✅ Token extracted');
      console.log('[Auth Middleware] Token length:', token.length);
      console.log('[Auth Middleware] Token preview:', token.substring(0, 30) + '...');
    }

    try {
      // Verify token - use same JWT_SECRET as login
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
      
      if (DEBUG_AUTH) {
        console.log('[Auth Middleware] JWT_SECRET exists:', !!JWT_SECRET);
        console.log('[Auth Middleware] JWT_SECRET length:', JWT_SECRET?.length);
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (DEBUG_AUTH) {
        console.log('[Auth Middleware] ✅ Token verified successfully');
        console.log('[Auth Middleware] Decoded payload:', {
          userId: decoded.userId,
          id: decoded.id,
          email: decoded.email,
          iat: decoded.iat,
          exp: decoded.exp
        });
      }
      
      // Get user ID from token payload (login uses userId, so check both)
      const userId = decoded.userId || decoded.id || decoded._id;
      
      if (!userId) {
        if (DEBUG_AUTH) {
          console.log('[Auth Middleware] ❌ NO USER ID in token payload');
        }
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required. Please login.' 
        });
      }
      
      if (DEBUG_AUTH) {
        console.log('[Auth Middleware] Looking up user with ID:', userId);
      }
      
      // Find user by ID
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        if (DEBUG_AUTH) {
          console.log('[Auth Middleware] ❌ USER NOT FOUND for ID:', userId);
        }
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required. Please login.' 
        });
      }
      
      // Check if user is active
      if (user.isActive === false) {
        if (DEBUG_AUTH) {
          console.log('[Auth Middleware] ❌ USER ACCOUNT DEACTIVATED:', user.email);
        }
        return res.status(401).json({ 
          success: false,
          message: 'Account is deactivated. Please contact support.' 
        });
      }
      
      if (DEBUG_AUTH) {
        console.log('[Auth Middleware] ✅ Authentication successful for user:', user.email);
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      // Handle JWT errors
      if (DEBUG_AUTH) {
        console.error('[Auth Middleware] ❌ Token verification failed');
        console.error('[Auth Middleware] Error name:', error.name);
        console.error('[Auth Middleware] Error message:', error.message);
        console.error('[Auth Middleware] Error stack:', error.stack);
      }
      
      if (error.name === 'JsonWebTokenError') {
        console.error('[Auth Middleware] Invalid token:', error.message);
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required. Please login.' 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        console.error('[Auth Middleware] Token expired:', error.message);
        return res.status(401).json({ 
          success: false,
          message: 'Token expired. Please login again.' 
        });
      }
      
      console.error('[Auth Middleware] Token verification error:', error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please login.' 
      });
    }
  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
};

// Middleware to check admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Legacy middleware for backward compatibility
const authMiddleware = function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      msg: 'Access denied. No Authorization header.' 
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ 
      success: false,
      msg: 'Access denied. Token missing.' 
    });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Optionally ensure required properties exist
    if (!decoded?.id && !decoded?.userId) {
      return res.status(403).json({ 
        success: false,
        msg: 'Token payload incomplete. Access denied.' 
      });
    }

    req.user = decoded; // Attach user info (e.g., id, role) to request
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ 
      success: false,
      msg: 'Invalid or expired token' 
    });
  }
};

// Alias for backward compatibility
const authenticateToken = protect;

module.exports = { protect, admin, authMiddleware, authenticateToken };