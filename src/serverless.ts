import * as serverless from 'serverless-http';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyHandler,
  APIGatewayProxyHandlerV2,
  Context,
} from 'aws-lambda';
import app from './app';
import Database from './database';

const serverlessApp = serverless(app);

type EventType = APIGatewayProxyEvent | APIGatewayProxyEventV2;

export const handler:
  | APIGatewayProxyHandler
  | APIGatewayProxyHandlerV2 = async (event: EventType, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = true;
  const database = new Database();
  const connection = await database.getConnection();
  const response = await serverlessApp(event, context);

  try {
    await Promise.all([connection.close()]);
  } catch (e) {}

  return response;
};
