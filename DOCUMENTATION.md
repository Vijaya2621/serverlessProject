# Serverless Project Documentation

## Project Overview

This document provides a comprehensive explanation of our serverless project architecture, request/response lifecycle, authentication mechanism, and the rationale behind our chosen structure.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Request/Response Lifecycle](#requestresponse-lifecycle)
3. [Authentication](#authentication)
4. [API Versioning](#api-versioning)
5. [AWS Services Implementation](#aws-services-implementation)
6. [Serverless TypeScript Configuration](#serverless-typescript-configuration)
7. [Dependency Layer](#dependency-layer)

## Project Structure

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         SERVERLESS ARCHITECTURE                           │
└───────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                  │
└───────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                            LAMBDA FUNCTIONS                               │
├───────────────┬───────────────┬───────────────────┬─────────────────────┬─┘
│               │               │                   │                     │
▼               ▼               ▼                   ▼                     ▼
┌───────────┐ ┌───────────┐ ┌───────────┐     ┌───────────┐       ┌───────────┐
│  hello    │ │  loginV1  │ │  loginV2  │     │getAllUsers│       │createUser │
└───────────┘ └───────────┘ └───────────┘     └───────────┘       └───────────┘
                    │             │                 │                   │
                    └─────────────┼─────────────────┼───────────────────┘
                                  │                 │
                                  ▼                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE & SERVICES                             │
├────────────────────┬────────────────────┬────────────────────────────────┬┘
│                    │                    │                                │
▼                    ▼                    ▼                                ▼
┌───────────┐    ┌───────────┐       ┌───────────┐                   ┌───────────┐
│ Auth      │    │ Auth      │       │ User      │                   │ Utils     │
│ Middleware│    │ Service   │       │ Service   │                   │           │
└───────────┘    └───────────┘       └───────────┘                   └───────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              DATABASE                                     │
└───────────────────────────────────────────────────────────────────────────┘
```

Our serverless project follows a modular, service-oriented architecture designed for scalability and maintainability:

```
serverlessprojects/
├── src/
│   ├── functions/       # Lambda function handlers
│   │   ├── auth/        # Authentication functions
│   │   ├── hello/       # Simple hello world function
│   │   └── users/       # User management functions
│   ├── middleware/      # Middleware components
│   ├── models/          # Data models
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
├── layer/               # Lambda layers for dependencies
└── serverless.ts        # Serverless framework configuration
```

### Detailed Project Structure Explanation

#### 1. `src/` Directory
The source directory contains all the application code organized into logical modules:

- **`functions/`**: Contains Lambda function handlers that serve as entry points
  - `auth/`: Authentication-related functions (login.js)
  - `hello/`: Simple hello world function for testing (hello.js)
  - `users/`: User management functions (getAll.js, create.js)
  
  Each function file exports a handler that AWS Lambda invokes when triggered by API Gateway.

- **`middleware/`**: Contains reusable middleware components
  - `auth.js`: Authentication middleware that verifies JWT tokens

- **`models/`**: Contains data schemas and database models
  - `user.js`: Defines the User schema for MongoDB using Mongoose

- **`services/`**: Contains business logic separated from handlers
  - `authService.js`: Handles authentication logic (login, token generation/verification)
  - `userService.js`: Handles user-related operations (create, find, list users)

- **`utils/`**: Contains helper functions and configuration
  - `config.js`: Environment variables and configuration settings
  - `db.js`: Database connection management with connection pooling
  - `moduleLoader.js`: Dynamically loads dependencies from Lambda layers
  - `moduleResolver.js`: Resolves module paths for layer dependencies
  - `passwordUtils.js`: Password hashing and verification utilities
  - `response.js`: Standardized HTTP response formatting

#### 2. `layer/` Directory
The layer directory contains shared dependencies that are deployed as AWS Lambda Layers:

```
layer/
└── nodejs/
    ├── package.json      # Dependencies for the layer
    └── node_modules/     # Installed dependencies
```

- **Purpose**: Lambda Layers allow sharing code and dependencies across multiple functions
- **Content**: Contains common libraries like mongoose, bcryptjs, and jsonwebtoken
- **Deployment**: Deployed as a separate layer that functions can reference
- **Benefits**: Reduces function package size and improves deployment speed

#### 3. `serverless.ts` File
The serverless.ts file is the configuration file for the Serverless Framework:


The serverless.ts file defines:
- Service name and provider settings
- Environment variables for different deployment stages
- Function definitions with their handlers and HTTP endpoints
- Package configurations for optimized deployments
- Lambda layer configurations
- Custom plugin settings for local development

### Why This Structure?

1. **Separation of Concerns**: Each directory has a specific responsibility
2. **Scalability**: The application can grow by adding new functions without modifying existing code
3. **Maintainability**: Smaller, focused modules are easier to understand and maintain
4. **Reusability**: Services and utilities can be reused across multiple functions
5. **Optimized Deployment**: Individual function packaging and shared layers reduce deployment size and time

## Request/Response Lifecycle

### Request Flow Diagram

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│         │     │             │     │              │     │             │     │         │
│ Client  │────▶│ API Gateway │────▶│ Lambda       │────▶│ Database    │     │ Client  │
│ Request │     │             │     │ Function     │     │             │     │ Response│
│         │     │             │     │              │     │             │     │         │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └─────────┘
                       │                    │                   ▲                  ▲
                       │                    │                   │                  │
                       │                    ▼                   │                  │
                       │             ┌──────────────┐          │                  │
                       │             │ Middleware   │          │                  │
                       │             │ (Auth, etc.) │          │                  │
                       │             └──────────────┘          │                  │
                       │                    │                   │                  │
                       │                    ▼                   │                  │
                       │             ┌──────────────┐          │                  │
                       │             │ Service      │──────────┘                  │
                       │             │ Layer        │                             │
                       │             └──────────────┘                             │
                       │                    │                                      │
                       │                    ▼                                      │
                       │             ┌──────────────┐                             │
                       └─────────────│ Response     │─────────────────────────────┘
                                     │ Formatting   │
                                     └──────────────┘
```

### Request Flow Steps

1. **API Gateway Receives Request**:
   - The client sends an HTTP request to the API Gateway endpoint
   - API Gateway logs the request (enabled via `logs: { apiGateway: true }`)

2. **Lambda Function Invocation**:
   - API Gateway routes the request to the appropriate Lambda function based on the path and method
   - The Lambda function is initialized (cold start) or reused (warm start)

3. **Function Handler Processing**:
   - The handler parses the incoming event
   - For protected routes, authentication middleware validates the JWT token
   - The handler delegates business logic to service layer
   - Services interact with models for data operations

4. **Response Generation**:
   - The handler formats the response using utility functions
   - Responses include appropriate status codes and headers
   - Error handling provides meaningful error messages

5. **API Gateway Returns Response**:
   - The Lambda function returns the response to API Gateway
   - API Gateway forwards the response to the client

### Example Flow for Login Request:

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│         │     │             │     │              │     │                 │     │                 │
│ Client  │────▶│ API Gateway │────▶│ loginV1      │────▶│ authService     │────▶│ userService     │
│ Request │     │ /v1/auth/   │     │ Lambda       │     │ .login()        │     │ .findByUsername │
│         │     │ login       │     │              │     │                 │     │                 │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘     └─────────────────┘
                                                                                          │
                                                                                          ▼
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│         │     │             │     │              │     │                 │     │                 │
│ Client  │◀────│ API Gateway │◀────│ Response     │◀────│ authService     │◀────│ userService     │
│ Response│     │             │     │ with Token   │     │ .generateToken()│     │ .verifyPassword │
│         │     │             │     │              │     │                 │     │                 │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘     └─────────────────┘

```

### Example Flow for Protected Route:

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│         │     │             │     │              │     │                 │     │                 │
│ Client  │────▶│ API Gateway │────▶│ getAllUsers  │────▶│ authService     │────▶│ userService     │
│ Request │     │ /v1/users   │     │ Lambda       │     │ .authenticate() │     │ .getAllUsers()  │
│ +Token  │     │             │     │              │     │                 │     │                 │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘     └─────────────────┘
                                                                                          │
┌─────────┐     ┌─────────────┐     ┌──────────────┐                                      │
│         │     │             │     │              │                                      │
│ Client  │◀────│ API Gateway │◀────│ Response     │◀─────────────────────────────────────┘
│ Response│     │             │     │ with Data    │
│         │     │             │     │              │
└─────────┘     └─────────────┘     └──────────────┘

```

## Authentication

Our project implements JWT (JSON Web Token) based authentication:

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGIN PROCESS                                     │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│         │     │             │     │              │     │                 │
│ Client  │────▶│ API Gateway │────▶│ Login Lambda │────▶│ authService     │
│         │     │             │     │              │     │                 │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘
                                                                  │
                                                                  ▼
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│         │     │             │     │              │     │                 │
│ Client  │◀────│ API Gateway │◀────│ JWT Token    │◀────│ JWT Generation  │
│         │     │             │     │              │     │                 │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROTECTED ENDPOINT ACCESS                              │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Client  │     │             │     │              │     │                 │
│ Request │────▶│ API Gateway │────▶│ Lambda       │────▶│ JWT            │
│ +Token  │     │             │     │ Function     │     │ Verification    │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘
                                                                  │
                                                                  ▼
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│         │     │             │     │              │     │ If valid token: │
│ Client  │◀────│ API Gateway │◀────│ Response     │◀────│ Process request │
│         │     │             │     │              │     │ Else: 401 error │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────────┘

```

### Authentication Flow Steps

1. **User Login**:
   - User provides username and password
   - `authService.login()` verifies credentials against stored user data
   - If valid, a JWT token is generated with user ID and expiration time

2. **Token Storage**:
   - The client stores the JWT token (typically in localStorage or secure cookie)
   - The token is included in subsequent requests in the Authorization header

3. **Request Authentication**:
   - Protected endpoints use the `authenticate` middleware
   - The middleware extracts the token from the Authorization header
   - `authService.verifyToken()` validates the token signature and expiration
   - If valid, the request proceeds; otherwise, a 401 error is returned

### Security Considerations

- JWT tokens are signed using a secret key stored in environment variables
- Tokens have a configurable expiration time (default: 1 hour)
- Passwords are hashed before storage using bcrypt
- Authentication errors provide minimal information to prevent information leakage

## API Versioning

Our project implements API versioning to ensure backward compatibility while allowing the API to evolve:

### API Versioning Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         API VERSIONING STRUCTURE                          │
└───────────────────────────────────────────────────────────────────────────┘
                                     │
                 ┌─────────────────────────────────────┐
                 │                                     │
        ┌────────▼─────────┐                 ┌─────────▼────────┐
        │                  │                 │                  │
        │  Version 1 (v1)  │                 │  Version 2 (v2)  │
        │                  │                 │                  │
        └──────────────────┘                 └──────────────────┘
                 │                                     │
     ┌───────────┴───────────┐             ┌───────────┴───────────┐
     │                       │             │                       │
┌────▼─────┐           ┌────▼─────┐   ┌────▼─────┐           ┌────▼─────┐
│          │           │          │   │          │           │          │
│ /v1/auth │           │ /v1/users│   │ /v2/auth │           │ /v2/users│
│          │           │          │   │          │           │          │
└──────────┘           └──────────┘   └──────────┘           └──────────┘
     │                       │             │                       │
┌────▼─────┐           ┌────▼─────┐   ┌────▼─────┐           ┌────▼─────┐
│          │           │          │   │          │           │          │
│ /login   │           │ GET, POST│   │ /login   │           │ GET, POST│
│          │           │          │   │ (Updated)│           │ (Updated)│
└──────────┘           └──────────┘   └──────────┘           └──────────┘

```

### Versioning Strategy

We use URI path versioning where the version is included in the endpoint path (e.g., `/v1/users`, `/v2/auth/login`). This approach provides:

1. **Clear Version Visibility**: Clients can easily see which API version they're using
2. **Independent Evolution**: Different versions can coexist and evolve separately
3. **Simple Routing**: API Gateway can route to different Lambda functions based on the version path

### Implementation

In our `serverless.ts` configuration, we define separate functions for different API versions:

```typescript

functions: {
  loginV1: {
    handler: 'src/functions/auth/login.handler',
    events: [{ http: { path: '/v1/auth/login', method: 'post' }}]
  },
  loginV2: {
    handler: 'src/functions/auth/login.handler',
    events: [{ http: { path: '/v2/auth/login', method: 'post' }}]
  }
}

```

### Version Management

1. **Shared Code**: Common functionality is shared between versions via service layers
2. **Version-Specific Logic**: When needed, version-specific logic can be implemented in the handler
3. **Deprecation Strategy**: Older versions can be marked as deprecated with appropriate headers
4. **Documentation**: Each version is documented separately with clear migration paths

### Benefits

- **Client Stability**: Existing clients can continue using a specific version
- **Gradual Migration**: Clients can migrate to newer versions at their own pace
- **Testing Isolation**: New versions can be tested without affecting existing clients
- **Feature Segregation**: New features can be added to newer versions without breaking changes

## AWS Services Implementation

### API Gateway

API Gateway serves as the entry point for all HTTP requests and provides:

1. **Request Routing**: Maps HTTP methods and paths to specific Lambda functions
2. **Logging**: Captures detailed request/response logs for monitoring and debugging
3. **Tracing**: Integrates with AWS X-Ray for distributed tracing

Configuration in `serverless.ts`:
```typescript
provider: {
  logs: {
    apiGateway: true
  },
  tracing: {
    apiGateway: true,
    lambda: true
  }
}
```

### Lambda Functions

Each API endpoint is implemented as a separate Lambda function with:

1. **Individual Packaging**: Each function is packaged separately with only its required dependencies
2. **Optimized Cold Start**: Dependency layers reduce package size and improve cold start times
3. **Environment Variables**: Configuration via environment variables for different deployment stages

## Serverless TypeScript Configuration

We use `serverless.ts` instead of the traditional YAML format for several advantages:

### serverless.ts vs serverless.yml

1. **Type Safety**: TypeScript provides type checking, preventing configuration errors
2. **IntelliSense Support**: Better IDE support with auto-completion and documentation
3. **Code Reuse**: Ability to use variables, functions, and imports for DRY configuration
4. **Programmatic Configuration**: Dynamic configuration based on environment or other factors
5. **Validation**: Compile-time validation of the serverless configuration

Example from our configuration:
```typescript
const serverlessConfiguration: AWS = {
  service: 'serverlessprojects',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    // Configuration with type checking
  }
};
```

## Dependency Layer

Lambda layers are used to share code and dependencies across functions:

### Dependency Layer Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         LAMBDA LAYERS ARCHITECTURE                        │
└───────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         DEPENDENCIES LAMBDA LAYER                         │
├───────────────────────┬───────────────────────┬───────────────────────────┤
│                       │                       │                           │
│     bcryptjs          │     jsonwebtoken      │      mongoose             │
│                       │                       │                           │
└───────────────────────┴───────────────────────┴───────────────────────────┘
                                     ▲
                                     │
                 ┌─────────────────────────────────────┐
                 │                                     │
        ┌────────▼─────────┐                 ┌─────────▼────────┐
        │                  │                 │                  │
        │  Lambda          │                 │  Lambda          │
        │  Function 1      │                 │  Function 2      │
        │                  │                 │                  │
        └──────────────────┘                 └──────────────────┘
                 │                                     │
                 │                                     │
        ┌────────▼─────────┐                 ┌─────────▼────────┐
        │  Function-       │                 │  Function-       │
        │  specific code   │                 │  specific code   │
        │  and resources   │                 │  and resources   │
        └──────────────────┘                 └──────────────────┘
```

### Benefits of Dependency Layers

1. **Reduced Package Size**: Each function package only includes function-specific code
2. **Faster Deployments**: Smaller packages deploy faster
3. **Dependency Sharing**: Common dependencies are packaged once and shared
4. **Improved Cold Start**: Smaller function packages can reduce cold start times

### Implementation

1. **Layer Structure**:
   ```
   layer/
   └── nodejs/
       ├── package.json      # Dependencies for the layer
       └── node_modules/     # Installed dependencies
   ```

2. **Module Resolution**:
   - Custom module resolver (`moduleResolver.js`) dynamically loads modules from the layer
   - Fallback mechanism tries local modules if not found in the layer

3. **Configuration**:
   ```typescript
   layers: {
     dependencies: {
       path: 'layer',
       name: '${self:service}-${sls:stage}-dependencies',
       compatibleRuntimes: ['nodejs20.x'],
     },
   }
   ```

4. **Function Association**:
   ```typescript
   provider: {
     layers: [
       { Ref: 'DependenciesLambdaLayer' }
     ]
   }
   ```

## Conclusion

Our serverless architecture provides a scalable, maintainable foundation for building cloud-native applications. The modular structure, combined with AWS services like API Gateway and Lambda, enables rapid development while maintaining good practices for security, performance, and code organization.

The use of TypeScript for configuration, dependency layers for optimization, and a service-oriented architecture allows the project to grow while keeping complexity manageable.