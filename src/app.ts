import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import { ApolloServer, ApolloError } from 'apollo-server-koa';
import { config } from 'dotenv';
import schema from './graphql/schema';
import createLoaders from './lib/createLoaders';
import routes from './routes';
import { checkToken } from './lib/middlewares/jwtMiddleware';
import cors from './lib/middlewares/cors';

config();
const app = new Koa();

/* set up middlewares */
app.use(logger());
app.use(bodyParser());
app.use(checkToken);
app.use(cors);
app.use(routes.routes()).use(routes.allowedMethods());

const apollo = new ApolloServer({
  schema,
  context: async ({ ctx }: { ctx: Koa.Context }) => {
    try {
      return {
        loaders: createLoaders(),
        ip: ctx.request.ip,
        cookies: ctx.cookies,
        user_id: ctx.state.user_id,
      };
    } catch (e) {
      console.error(e);
      throw new ApolloError('Apollo Server Context Error');
    }
  },
});
apollo.applyMiddleware({ app, cors: false });

export default app;
