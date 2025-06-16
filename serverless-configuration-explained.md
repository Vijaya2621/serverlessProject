# Serverless.ts Configuration File Explained

This document provides a detailed explanation of the `serverless.ts` configuration file used in this project.

## Overview

The `serverless.ts` file is a TypeScript configuration file for the Serverless Framework that defines how your serverless application is deployed to AWS. It serves as the infrastructure-as-code blueprint for your entire application architecture.

## File Structure Breakdown

### Import Statement
```typescript
import type { AWS } from '@serverless/typescript';
```
- Imports the AWS type definition from the Serverless Framework TypeScript package
- Provides TypeScript type checking and autocompletion for the configuration

### Service Definition
```typescript
service: 'serverlessprojects'
```
- Defines the name of your service
- Used as a prefix for naming AWS resources
- Helps with resource organization and identification in AWS console

### Provider Configuration

```typescript
provider: {
  name: 'aws',
  runtime: 'nodejs20.x',
  region: 'us-east-1',
  // ...
}
```

#### Basic Settings
- **name**: Specifies AWS as the cloud provider
- **runtime**: Sets Node.js 20.x as the Lambda runtime
- **region**: Deploys resources to US East 1 (N. Virginia)

#### Environment Variables
```typescript
environment: {
  NODE_ENV: "${opt:stage, 'dev'}",
  JWT_SECRET: "${env:JWT_SECRET, 'secretKey'}",
  USER_POOL_ID: { Ref: 'UserPool' },
  USER_POOL_CLIENT_ID: { Ref: 'UserPoolClient' }
}
```
- **NODE_ENV**: Sets environment based on deployment stage (defaults to 'dev')
- **JWT_SECRET**: Uses environment variable or falls back to 'secretKey'
  - This is a critical security configuration used for signing and verifying JSON Web Tokens (JWTs)
  - In production, you should always set this as an environment variable and never use the default value
  - The JWT_SECRET is used for authentication and authorization across your application
- **USER_POOL_ID**: References the Cognito User Pool created in resources section
- **USER_POOL_CLIENT_ID**: References the Cognito User Pool Client created in resources section

#### Lambda Layers
```typescript
layers: [
  { Ref: 'DependenciesLambdaLayer' }
]
```
- Attaches the dependencies layer to all Lambda functions
- Allows sharing common dependencies across functions

#### Logging and Tracing
```typescript
logs: {
  apiGateway: true
},
tracing: {
  apiGateway: true,
  lambda: true
}
```
- Enables CloudWatch logging for API Gateway
- Enables AWS X-Ray tracing for both API Gateway and Lambda functions

#### IAM Permissions
```typescript
iam: {
  role: {
    statements: [
      {
        Effect: 'Allow',
        Action: [
          'cognito-idp:AdminInitiateAuth',
          'cognito-idp:AdminCreateUser',
          'cognito-idp:AdminSetUserPassword',
          'cognito-idp:ListUsers',
          'cognito-idp:AdminGetUser'
        ],
        Resource: '*'
      }
    ]
  }
}
```
- Grants Lambda functions permissions to interact with AWS Cognito
- Allows functions to authenticate users, create users, and manage user data

### Plugins
```typescript
plugins: ['serverless-offline']
```
- **serverless-offline**: Enables local testing of the API before deployment

### Package Configuration
```typescript
package: {
  individually: true,
  patterns: [
    '!node_modules/**',
    '!.serverless/**',
    '!.git/**',
    '!layer/**',
    '!src/**'
  ]
}
```
- **individually**: Packages each function separately for optimal size
- **patterns**: Global exclusion patterns for all functions
  - Excludes node_modules, .serverless, .git, layer, and src directories by default
  - Each function will specify its own include patterns

### Function
Each function defines:
A handler (the entry point to your code)
API Gateway events that trigger the function
Package patterns that specify which files to include/exclude for each function

### Lambda Layers
```typescript
layers: {
  dependencies: {
    path: 'layer',
    name: '${self:service}-${sls:stage}-dependencies',
    description: 'Dependencies for ${self:service}',
    compatibleRuntimes: ['nodejs20.x'],
  },
}
```
- Creates a Lambda Layer for shared dependencies
- Layer name includes service name and stage (e.g., serverlessprojects-dev-dependencies)
- Compatible with Node.js 20.x runtime
- Located in the 'layer' directory

### Custom Settings
```typescript
custom: {
  'serverless-offline': {
    httpPort: 3000,
    layersDir: './layer'
  },
  logs: {
    restApi: {
      accessLogging: true,
      executionLogging: true,
      level: 'INFO',
      fullExecutionData: true
    }
  }
}
```
- **serverless-offline**: Configures local development server
  - Sets HTTP port to 3000
  - Points to the layers directory
- **logs**: Configures detailed API Gateway logging

### AWS Resources
```typescript
resources: {
  Resources: {
    UserPool: {
      Type: 'AWS::Cognito::UserPool',
      Properties: {
        UserPoolName: '${self:service}-${sls:stage}-user-pool',
        AutoVerifiedAttributes: ['email'],
        UsernameAttributes: ['email'],
        Schema: [
          {
            Name: 'email',
            Required: true,
            Mutable: true
          }
        ],
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireLowercase: true,
            RequireNumbers: true,
            RequireSymbols: false,
            RequireUppercase: true
          }
        }
      }
    },
    UserPoolClient: {
      Type: 'AWS::Cognito::UserPoolClient',
      Properties: {
        ClientName: '${self:service}-${sls:stage}-user-pool-client',
        UserPoolId: { Ref: 'UserPool' },
        ExplicitAuthFlows: [
          'ALLOW_ADMIN_USER_PASSWORD_AUTH',
          'ALLOW_USER_PASSWORD_AUTH',
          'ALLOW_REFRESH_TOKEN_AUTH'
        ],
        GenerateSecret: false
      }
    }
  }
}
```

#### Cognito User Pool
- Creates an AWS Cognito User Pool for user authentication
- Configures email as the username
- Sets password policy requirements
- Name includes service and stage (e.g., serverlessprojects-dev-user-pool)

#### Cognito User Pool Client
- Creates a client application for the User Pool
- Enables various authentication flows
- Links to the User Pool using CloudFormation Ref
- Does not generate a client secret

## Variable References

- **${self:service}**: References the service name (serverlessprojects)
- **${sls:stage}**: References the deployment stage (dev, prod, etc.)
- **${opt:stage, 'dev'}**: Uses command line stage option or defaults to 'dev'
- **${env:JWT_SECRET, 'secretKey'}**: Uses environment variable or defaults to 'secretKey'
- **{ Ref: 'ResourceName' }**: CloudFormation reference to another resource

## Deployment Process

When you deploy this configuration:

1. Serverless Framework converts this TypeScript configuration to CloudFormation
2. AWS CloudFormation creates/updates all the defined resources
3. Lambda functions are packaged according to their individual patterns
4. API Gateway endpoints are created and connected to Lambda functions
5. Cognito resources are provisioned for authentication
6. Environment variables are set with appropriate values

## Local Development

Using the serverless-offline plugin:

```
serverless offline start
```

This will:
- Start a local API Gateway emulator on port 3000
- Load the Lambda layers from the ./layer directory
- Allow testing the API endpoints locally before deployment