import '../utils/moduleResolver.js';
import * as UserModel from '../models/user.js';

/**
 * User Service - Handles all user-related business logic
 */
class UserService {
  /**
   * Find user by username
   * @param {string} username - Username to search for
   * @returns {Promise<Object>} - User object or null
   */
  async findByUsername(username) {
    return UserModel.findByUsername(username);
  }

  /**
   * Get all users
   * @returns {Promise<Array>} - Array of user objects
   */
  async getAllUsers() {
    return UserModel.getAll();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data including username and password
   * @returns {Promise<Object>} - Created user object
   */
  async createUser(userData) {
    // Check if user already exists
    const existingUser = await UserModel.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    return UserModel.createUser(userData);
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return UserModel.verifyPassword(plainPassword, hashedPassword);
  }
}

export default new UserService();