import * as Router from '@koa/router';
import api from './api';

const routes = new Router();

routes.use('/api', api.routes());

routes.get('/', ctx => {
  console.log(ctx.request.origin);
  ctx.body = 'hello world';
});

export default routes;
