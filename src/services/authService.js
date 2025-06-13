import '../utils/moduleResolver.js';
import { jwt } from '../utils/moduleLoader.js';
import userService from './userService.js';
import { JWT_SECRET, JWT_EXPIRY } from '../utils/config.js';

/**
 * Auth Service - Handles authentication and authorization
 */
class AuthService {
  /**
   * Generate JWT token
   * @param {string} userId - User ID to include in token
   * @returns {string} - JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded token payload or null
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Authenticate user with username and password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} - Authentication result with token and user data
   */
  async login(username, password) {
    // Find user
    const user = await userService.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await userService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    };
  }

  /**
   * Authenticate request using JWT token from headers
   * @param {Object} event - Lambda event object
   * @returns {Object} - Authentication result
   */
  authenticate(event) {
    try {
      const authHeader = event.headers.Authorization || event.headers.authorization;
      
      if (!authHeader) {
        return { isAuth: false, error: 'No authorization header provided' };
      }
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.verifyToken(token);
      
      if (!decoded) {
        return { isAuth: false, error: 'Invalid or expired token' };
      }
      
      return { isAuth: true, userId: decoded.userId };
    } catch (err) {
      return { isAuth: false, error: 'Authentication failed' };
    }
  }
}

export default new AuthService();