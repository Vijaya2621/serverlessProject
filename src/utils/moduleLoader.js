/**
 * Module loader for external dependencies
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

export {
  jwt,
  bcrypt,
  mongoose,
  CognitoIdentityProviderClient,
  CognitoJwtVerifier
};