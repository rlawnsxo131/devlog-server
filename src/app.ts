import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import routes from './routes';
import schema from './graphql/schema';
import { ApolloServer, ApolloError } from 'apollo-server-koa';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import http from 'http';
import createLoaders from './lib/createLoaders';
import initializeConfig from './env';
import cors from './lib/middlewares/cors';
import compress from './lib/middlewares/compress';

initializeConfig();
const isProduction = process.env.NODE_ENV === 'production';
const httpServer = http.createServer();
const app = new Koa();

/* set up middlewares */
app.use(logger());
app.use(cors);
app.use(bodyParser());
app.use(compress);
app.use(routes.routes()).use(routes.allowedMethods());

const apollo = new ApolloServer({
  debug: !isProduction,
  schema,
  context: async ({ ctx }: { ctx: Koa.Context }) => {
    try {
      return {
        loaders: createLoaders(),
        ip: ctx.request.ip,
      };
    } catch (e) {
      throw new ApolloError('Apollo Server Context Error');
    }
  },
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    isProduction
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
});

apollo.start().then(() => {
  apollo.applyMiddleware({ app, cors: false });
});

export default app;
