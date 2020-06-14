import { Middleware } from 'koa';

export const sitemapIndex: Middleware = ctx => {
  ctx.body = 'sitemap index';
};
