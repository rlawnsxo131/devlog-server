import * as Router from '@koa/router';
import rss from './rss';
import sitemaps from './sitemaps';

const routes = new Router();

routes.use('/(rss|atom)', rss.routes());
routes.use('/sitemaps', sitemaps.routes());

routes.get('/', ctx => {
  ctx.body = 'hello world';
});

export default routes;
