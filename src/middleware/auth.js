import '../utils/moduleResolver.js';
import authService from '../services/authService.js';

/**
 * Authentication middleware
 * @param {Object} event - Lambda event object
 * @returns {Object} - Authentication result
 */
export const authenticate = (event) => {
  return authService.authenticate(event);
};