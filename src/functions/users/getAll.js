import '../../utils/moduleResolver.js';
import userService from '../../services/userService.js';
import authService from '../../services/authService.js';
import { success, error } from '../../utils/response.js';

/**
 * Get all users handler
 */
export const handler = async (event) => {
  try {
    // Check authentication using auth service
    const auth = authService.authenticate(event);
    if (!auth.isAuth) {
      return error(auth.error, 401);
    }
    
    // Get all users using user service
    const users = await userService.getAllUsers();
    
    return success({ users });
  } catch (err) {
    console.error('GetAllUsers error:', err);
    return error('Internal server error', 500, err.message);
  }
};