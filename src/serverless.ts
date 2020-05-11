import * as serverless from 'serverless-http';
import { APIGatewayProxyHandler } from 'aws-lambda';
import app from './app';
import Database from './database';

const serverlessApp = serverless(app);

export const handler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = true;
  const database = new Database();
  const connection = await database.getConnection();
  const response = await serverlessApp(event, context);

  try {
    await Promise.all([connection.close()]);
  } catch (e) {}

  return response;
};
