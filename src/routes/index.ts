import * as Router from '@koa/router';
import api from './api';
import rss from './rss';
import sitemaps from './sitemaps';

const routes = new Router();

routes.use('/api', api.routes());
routes.use('/(rss|atom)', rss.routes());
routes.use('/sitemaps', sitemaps.routes());

routes.get('/', ctx => {
  ctx.body = ctx.request.header;
});

export default routes;
