import { success } from '../../utils/response.js';

export const handler = async () => {
  const response = success({
    message: "Go Serverless v4! Your function executed successfully!"
  });
  console.log("Lambda hello message:", "Go Serverless v4! Your function executed successfully!");
  console.log("Lambda hello response:", response);
  return response;
};