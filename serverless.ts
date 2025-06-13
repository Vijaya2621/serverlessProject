import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverlessprojects',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    environment: {
      NODE_ENV: "${opt:stage, 'dev'}",
      JWT_SECRET: "${env:JWT_SECRET, 'secretKey'}",
      MONGODB_URI: "${env:MONGODB_URI, 'mongodb://localhost:27017/serverless-api'}"
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
          'src/models/**',
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
          'src/models/**',
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
          'src/models/**',
          'src/services/userService.js',
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
          'src/models/**',
          'src/services/userService.js',
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
    esbuild: {
      external: ['bcryptjs', 'jsonwebtoken', 'mongoose'],
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
};

export default serverlessConfiguration;