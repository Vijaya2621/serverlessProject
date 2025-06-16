import '../utils/moduleResolver.js';
import authService from '../services/authService.js';

/**
 * Authentication middleware using AWS Cognito
 * @param {Object} event - Lambda event object
 * @returns {Promise<Object>} - Authentication result
 */
export const authenticate = async (event) => {
  const authResult = await authService.authenticate(event);
  
  // Add user info to the event for downstream handlers
  if (authResult.isAuth) {
    event.user = {
      userId: authResult.userId,
      username: authResult.username,
      claims: authResult.claims
    };
  }
  
  return authResult;
};