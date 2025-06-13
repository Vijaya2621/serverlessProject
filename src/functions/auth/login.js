import '../../utils/moduleResolver.js';
import authService from '../../services/authService.js';
import { success, error } from '../../utils/response.js';

/**
 * Login handler
 */
export const handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);
    
    // Validate input
    if (!username || !password) {
      return error('Username and password are required', 400);
    }
    
    try {
      // Use auth service for login
      const authResult = await authService.login(username, password);
      
      return success({ 
        message: 'Login successful',
        token: authResult.token,
        user: authResult.user
      });
    } catch (serviceError) {
      // Handle authentication errors
      return error(serviceError.message, 401);
    }
  } catch (err) {
    console.error('Login error:', err);
    return error('Internal server error', 500, err.message);
  }
};