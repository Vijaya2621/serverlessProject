import '../../utils/moduleResolver.js';
import { success, error } from '../../utils/response.js';
import { USER_POOL_ID } from '../../utils/config.js';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

/**
 * Get all users handler - Gets users from Cognito
 */
export const handler = async (event) => {
  try {
    // Get users from Cognito
    const cognitoClient = new CognitoIdentityProviderClient({
      region: 'us-east-1'
    });
    
    const params = {
      UserPoolId: USER_POOL_ID,
      Limit: 10
    };
    
    const command = new ListUsersCommand(params);
    const response = await cognitoClient.send(command);
    
    // Return simplified user data
    const users = response.Users?.map(user => ({
      username: user.Username,
      enabled: user.Enabled,
      status: user.UserStatus
    })) || [];
    
    return success({
      message: 'Users retrieved successfully',
      users: users
    });
  } catch (err) {
    return error('Internal server error', 500, err.message);
  }
};
