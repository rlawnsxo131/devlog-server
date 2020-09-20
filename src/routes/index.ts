import * as Router from '@koa/router';
import api from './api';
import rss from './rss';
import sitemaps from './sitemaps';

const routes = new Router();

routes.get('/hello', ctx => {
  ctx.body = 'Hello world';
});
routes.use('/api', api.routes());
routes.use('/(rss|atom)', rss.routes());
routes.use('/sitemaps', sitemaps.routes());

export default routes;
