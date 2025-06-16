import '../../utils/moduleResolver.js';
import { success, error } from '../../utils/response.js';
import { USER_POOL_ID, USER_POOL_CLIENT_ID } from '../../utils/config.js';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

export const handler = async (event) => {
  try {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: 'us-east-1'
    });
    
    return success({
      message: 'Cognito configuration',
      userPoolId: USER_POOL_ID,
      clientId: USER_POOL_CLIENT_ID,
      region: 'us-east-1'
    });
  } catch (err) {
    return error('Internal server error', 500, err.message);
  }
};