import '../utils/moduleResolver.js';
import { USER_POOL_ID, USER_POOL_CLIENT_ID } from '../utils/config.js';
import { CognitoIdentityProviderClient, AdminInitiateAuthCommand, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

/**
 * Auth Service - Handles authentication and authorization with AWS Cognito
 */
class AuthService {
  constructor() {
    try {
      this.cognitoClient = new CognitoIdentityProviderClient({
        region: 'us-east-1'  // Explicitly use us-east-1
      });
      
      if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) {
      }
      
      this.verifier = CognitoJwtVerifier.create({
        userPoolId: USER_POOL_ID,
        clientId: USER_POOL_CLIENT_ID,
        tokenUse: 'access'
      });
    } catch (error) {
    }
  }

  /**
   * Create a user in Cognito
   * @param {string} username - Username (email)
   * @param {string} password - Password
   * @returns {Promise<Object>} - User creation result
   */
  async createUser(username, password) {
    
    try {
      if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) {
        throw new Error('Cognito configuration missing');
      }
      
      // First create the user
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
      try {
        const createResult = await this.cognitoClient.send(new AdminCreateUserCommand(createParams));
        
        // Then set the permanent password
        const setPasswordParams = {
          UserPoolId: USER_POOL_ID,
          Username: username,
          Password: password,
          Permanent: true
        };
        
        await this.cognitoClient.send(new AdminSetUserPasswordCommand(setPasswordParams));
        
        return { success: true };
      } catch (apiError) {
        if (apiError.name === 'UsernameExistsException') {
          return { success: true, message: 'User already exists' };
        }
        throw apiError;
      }
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Authenticate user with username and password using Cognito
   * @param {string} username - Username (email)
   * @param {string} password - Password
   * @returns {Promise<Object>} - Authentication result with tokens and user data
   */
  async login(username, password) {
    try {
      if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) {
        throw new Error('Cognito configuration missing');
      }
      
      const params = {
        UserPoolId: USER_POOL_ID,
        ClientId: USER_POOL_CLIENT_ID,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      };
      
      const command = new AdminInitiateAuthCommand(params);
      const response = await this.cognitoClient.send(command);
      
      if (!response || !response.AuthenticationResult) {
        throw new Error('Invalid authentication result from Cognito');
      }
      
      // Get user attributes from Cognito
      try {
        const userParams = {
          UserPoolId: USER_POOL_ID,
          Username: username
        };
        
        const userCommand = new AdminGetUserCommand(userParams);
        const userResponse = await this.cognitoClient.send(userCommand);
        
        // Extract user attributes if needed
        const userAttributes = {};
        if (userResponse.UserAttributes) {
          userResponse.UserAttributes.forEach(attr => {
            userAttributes[attr.Name] = attr.Value;
          });
        }
        
        return {
          tokens: response.AuthenticationResult,
          user: {
            username: username,
            email: userAttributes.email || username,
            // Add any other attributes you need
          }
        };
      } catch (userError) {
        // If we can't get user details, just return the tokens
        return {
          tokens: response.AuthenticationResult,
          user: {
            username: username
          }
        };
      }
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        throw new Error('User not found');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Incorrect username or password');
      } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('User is not confirmed');
      } else {
        throw new Error(`Authentication failed: ${error.message}`);
      }
    }
  }

  /**
   * Authenticate request using Cognito JWT token from headers
   * @param {Object} event - Lambda event object
   * @returns {Object} - Authentication result
   */
  async authenticate(event) {
    try {
      const authHeader = event.headers.Authorization || event.headers.authorization;
      
      if (!authHeader) {
        return { isAuth: false, error: 'No authorization header provided' };
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      try {
        // Verify the JWT token with Cognito
        const payload = await this.verifier.verify(token);
        return { 
          isAuth: true, 
          userId: payload.sub,
          username: payload.username || payload.email,
          // Add any other claims from the token that you need
          claims: payload
        };
      } catch (jwtError) {
        return { isAuth: false, error: 'Invalid or expired token' };
      }
    } catch (err) {
      return { isAuth: false, error: 'Authentication failed' };
    }
  }
}

export default new AuthService();