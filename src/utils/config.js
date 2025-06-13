export const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';
export const JWT_EXPIRY = '1h';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/serverless-api';
export const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};