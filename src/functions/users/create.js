import '../../utils/moduleResolver.js';
import userService from '../../services/userService.js';
import { success, error } from '../../utils/response.js';

/**
 * Create user handler
 */
export const handler = async (event) => {
  try {
    const userData = JSON.parse(event.body);
    
    // Validate input
    if (!userData.username || !userData.password) {
      return error('Username and password are required', 400);
    }
    
    // Create user using service
    try {
      const user = await userService.createUser(userData);
      
      return success({ 
        message: 'User created successfully',
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }, 201);
    } catch (serviceError) {
      // Handle specific service errors
      if (serviceError.message === 'Username already exists') {
        return error(serviceError.message, 409);
      }
      throw serviceError; // Re-throw other errors
    }
  } catch (err) {
    console.error('Create user error:', err);
    return error('Internal server error', 500, err.message);
  }
};