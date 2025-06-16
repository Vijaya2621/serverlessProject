import '../../utils/moduleResolver.js';
import authService from '../../services/authService.js';
import { success, error } from '../../utils/response.js';
import { USER_POOL_ID, USER_POOL_CLIENT_ID } from '../../utils/config.js';

/**
 * Login handler using AWS Cognito
 */
export const handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);
    
    // Validate input
    if (!username || !password) {
      return error('Username and password are required', 400);
    }
    
    try {
      // Use auth service for Cognito login
      const authResult = await authService.login(username, password);
      
      // Return Cognito tokens directly
      return success({ 
        message: 'Login successful',
        accessToken: authResult.tokens.AccessToken,
        idToken: authResult.tokens.IdToken,
        refreshToken: authResult.tokens.RefreshToken,
        expiresIn: authResult.tokens.ExpiresIn,
        user: {
          username: username,
          // Any additional user info from Cognito can be added here
        }
      });
    } catch (serviceError) {
      // Handle authentication errors
      return error(serviceError.message, 401);
    }
  } catch (err) {
    return error('Internal server error', 500, err.message);
  }
};