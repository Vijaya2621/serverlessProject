import '../../utils/moduleResolver.js';
import { success, error } from '../../utils/response.js';
import { USER_POOL_ID, USER_POOL_CLIENT_ID } from '../../utils/config.js';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';

/**
 * Create user handler - Creates user in Cognito
 */
export const handler = async (event) => {
  try {
    const userData = JSON.parse(event.body);
    const { username, password, role } = userData;
    
    // Validate input
    if (!username || !password) {
      return error('Username and password are required', 400);
    }
    
    // Create Cognito client
    const cognitoClient = new CognitoIdentityProviderClient({
      region: 'us-east-1'
    });
    
    try {
      // Create user in Cognito
      const createParams = {
        UserPoolId: USER_POOL_ID,
        Username: username,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          {
            Name: 'email',
            Value: username
          },
          {
            Name: 'email_verified',
            Value: 'true'
          }
        ]
      };
      
      const createResult = await cognitoClient.send(new AdminCreateUserCommand(createParams));
      // Set permanent password
      const setPasswordParams = {
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: password,
        Permanent: true
      };
      
      await cognitoClient.send(new AdminSetUserPasswordCommand(setPasswordParams));
      
      return success({
        message: 'User created successfully',
        user: {
          username: username,
          email: username,
          role: role || 'user'
        }
      }, 201);
    } catch (cognitoError) {
      if (cognitoError.name === 'UsernameExistsException') {
        return error('Username already exists', 409);
      }
      return error(`Failed to create user: ${cognitoError.message}`, 500);
    }
  } catch (err) {
    return error('Internal server error', 500, err.message);
  }
};