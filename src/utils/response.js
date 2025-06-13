import { HEADERS } from './config.js';

export const success = (body, statusCode = 200) => {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(body)
  };
};

export const error = (message, statusCode = 500, errorDetails = null) => {
  const body = { message };
  if (errorDetails && process.env.NODE_ENV !== 'production') {
    body.error = errorDetails;
  }

  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(body)
  };
};