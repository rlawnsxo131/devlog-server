import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import routes from './routes';
import schema from './graphql/schema';
import { ApolloServer, ApolloError } from 'apollo-server-koa';
import createLoaders from './lib/createLoaders';
import initializeConfig from './env';
import cors from './lib/middlewares/cors';
import compress from './lib/middlewares/compress';

initializeConfig();
const app = new Koa();

/* set up middlewares */
app.use(logger());
app.use(cors);
app.use(bodyParser());
app.use(compress);
app.use(routes.routes()).use(routes.allowedMethods());

const apollo = new ApolloServer({
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
});
apollo.applyMiddleware({ app, cors: false });

export default app;
