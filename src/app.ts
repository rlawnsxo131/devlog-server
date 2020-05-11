import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as cors from '@koa/cors';
import { ApolloServer, ApolloError } from 'apollo-server-koa';
import { config } from 'dotenv';
import schema from './graphql/schema';
import createLoaders from './lib/createLoaders';
import routes from './routes';
import { checkToken } from './lib/middlewares/jwtMiddleware';

config();
const app = new Koa();

/* set up middlewares */
app.use(logger());
app.use(bodyParser());
app.use(checkToken);
app.use(cors({ credentials: true }));
app.use(routes.routes()).use(routes.allowedMethods());

const apollo = new ApolloServer({
  schema,
  context: async ({ ctx }: { ctx: Koa.Context }) => {
    try {
      return {
        loaders: createLoaders(),
        ip: ctx.request.ip,
        cookies: ctx.cookies,
        user_id: ctx.state.user_id
      };
    } catch (e) {
      console.error(e);
      throw new ApolloError('Apollo Server Context Error');
    }
  }
});
apollo.applyMiddleware({ app });

export default app;
