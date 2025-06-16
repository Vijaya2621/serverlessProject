import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverlessprojects',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    environment: {
      NODE_ENV: "${opt:stage, 'dev'}",
      USER_POOL_ID: { Ref: 'UserPool' },
      USER_POOL_CLIENT_ID: { Ref: 'UserPoolClient' }
    },
    layers: [
      { Ref: 'DependenciesLambdaLayer' }
    ],
    logs: {
      apiGateway: true
    },
    tracing: {
      apiGateway: true,
      lambda: true
    },
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
  },
  plugins: ['serverless-offline'],
  package: {
    individually: true,
    patterns: [
      '!node_modules/**',
      '!.serverless/**',
      '!.git/**',
      '!layer/**',
      '!src/**'
    ]
  },
  functions: {
    hello: {
      handler: 'src/functions/hello/hello.handler',
      events: [
        {
          http: {
            path: '/v1',
            method: 'get'
          }
        }
      ],
      package: {
        patterns: [
          'src/functions/hello/**',
          'src/utils/**',
          '!src/functions/auth/**',
          '!src/functions/users/**'
        ]
      }
    },
    testCognito: {
      handler: 'src/functions/auth/test-cognito.handler',
      events: [
        {
          http: {
            path: '/test-cognito',
            method: 'get'
          }
        }
      ],
      package: {
        patterns: [
          'src/functions/auth/test-cognito.js',
          'src/utils/**'
        ]
      }
    },
    loginV1: {
      handler: 'src/functions/auth/login.handler',
      events: [
        {
          http: {
            path: '/v1/auth/login',
            method: 'post'
          }
        }
      ],
      package: {
        patterns: [
          'src/functions/auth/**',
          'src/utils/**',
          'src/middleware/**',
          'src/services/authService.js',
          '!src/functions/hello/**',
          '!src/functions/users/**'
        ]
      }
    },
    loginV2: {
      handler: 'src/functions/auth/login.handler',
      events: [
        {
          http: {
            path: '/v2/auth/login',
            method: 'post'
          }
        }
      ],
      package: {
        patterns: [
          'src/functions/auth/**',
          'src/utils/**',
          'src/middleware/**',
          'src/services/authService.js',
          '!src/functions/hello/**',
          '!src/functions/users/**'
        ]
      }
    },
    getAllUsersV1: {
      handler: 'src/functions/users/getAll.handler',
      events: [
        {
          http: {
            path: '/v1/users',
            method: 'get'
          }
        }
      ],
      package: {
        patterns: [
          'src/functions/users/getAll.js',
          'src/utils/**',
          'src/middleware/**',
          '!src/functions/hello/**',
          '!src/functions/auth/**',
          '!src/functions/users/create.js'
        ]
      }
    },
    createUserV1: {
      handler: 'src/functions/users/create.handler',
      events: [
        {
          http: {
            path: '/v1/users',
            method: 'post'
          }
        }
      ],
      package: {
        patterns: [
          'src/functions/users/create.js',
          'src/utils/**',
          'src/middleware/**',
          '!src/functions/hello/**',
          '!src/functions/auth/**',
          '!src/functions/users/getAll.js'
        ]
      }
    }
  },
  layers: {
    dependencies: {
      path: 'layer',
      name: '${self:service}-${sls:stage}-dependencies',
      description: 'Dependencies for ${self:service}',
      compatibleRuntimes: ['nodejs20.x'],
    },
  },
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
  },
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
};

export default serverlessConfiguration;