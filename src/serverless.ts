import serverless from 'serverless-http';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyHandler,
  APIGatewayProxyHandlerV2,
  Context,
} from 'aws-lambda';
import { app, apollo } from './app';
import Database from './database';

let serverlessApp: serverless.Handler | null = null;

type EventType = APIGatewayProxyEvent | APIGatewayProxyEventV2;
type HandlerType = APIGatewayProxyHandler | APIGatewayProxyHandlerV2;

export const handler: HandlerType = async (
  event: EventType,
  context: Context,
) => {
  context.callbackWaitsForEmptyEventLoop = true;
  if (!serverlessApp) {
    await apollo.start();
    apollo.applyMiddleware({ app, cors: false });
    serverlessApp = serverless(app);
  }
  const database = new Database();
  const connection = await database.getConnection();
  const response = await serverlessApp(event, context);

  try {
    await Promise.all([connection.close()]);
  } catch (e) {
    console.log('database connection close error: ', e);
  }

  return response;
};
