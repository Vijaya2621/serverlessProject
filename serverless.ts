import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverlessprojects',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    environment: {
      NODE_ENV: "${opt:stage, 'dev'}",
      JWT_SECRET: "${env:JWT_SECRET, 'secretKey'}",
      MONGODB_URI: "${env:MONGODB_URI, 'mongodb://localhost:27017/serverless-api'}",
      NODE_PATH: "/opt/nodejs/node_modules"
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
    individually: true
  },
  functions: {
    hello: {
      handler: 'src/functions/hello/hello.handler',
      layers: [
        { Ref: 'DependenciesLambdaLayer' }
      ],
      events: [
        {
          http: {
            path: '/v1',
            method: 'get'
          }
        }
      ]
    },
    loginV1: {
      handler: 'src/functions/auth/login.handler',
      layers: [
        { Ref: 'DependenciesLambdaLayer' }
      ],
      events: [
        {
          http: {
            path: '/v1/auth/login',
            method: 'post'
          }
        }
      ]
    },
    loginV2: {
      handler: 'src/functions/auth/login.handler',
      layers: [
        { Ref: 'DependenciesLambdaLayer' }
      ],
      events: [
        {
          http: {
            path: '/v2/auth/login',
            method: 'post'
          }
        }
      ]
    },
    getAllUsersV1: {
      handler: 'src/functions/users/getAll.handler',
      layers: [
        { Ref: 'DependenciesLambdaLayer' }
      ],
      events: [
        {
          http: {
            path: '/v1/users',
            method: 'get'
          }
        }
      ]
    },
    createUserV1: {
      handler: 'src/functions/users/create.handler',
      layers: [
        { Ref: 'DependenciesLambdaLayer' }
      ],
      events: [
        {
          http: {
            path: '/v1/users',
            method: 'post',
          }
        }
      ]
    },
  },
  layers: {
    dependencies: {
      path: 'layer',
      name: '${self:service}-${sls:stage}-dependencies',
      description: 'Dependencies for ${self:service}',
      compatibleRuntimes: ['nodejs20.x'],
      retain: true,
    },
  },
  custom: {
    'serverless-offline': {
      httpPort: 3000,
      lambdaPort: 3003,
      layersDir: './layer'
    },
    esbuild: {
      external: ['bcryptjs', 'jsonwebtoken', 'mongoose'],
      nodeModules: ['mongoose', 'bcryptjs', 'jsonwebtoken']
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
  build: {
    packager: 'npm',
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      target: 'node20',
      platform: 'node',
      format: 'esm',
      external: ['mongoose', 'bcryptjs', 'jsonwebtoken'],
      loader: {
        '.js': 'jsx'
      },
      mainFields: ['module', 'main']
    }
  }
};

export default serverlessConfiguration;