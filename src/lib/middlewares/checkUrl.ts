import { Middleware } from 'koa';

const checkUrl: Middleware = (ctx, next) => {
  if (/^\/graphql/.test(ctx.path)) {
    return next();
  }
  const allowUrl = [/^\/health/, /^\/rss/, /^\/atom/, /^\/sitemaps/];
  const valid = allowUrl.some((regex) => regex.test(ctx.path));
  if (!valid) {
    ctx.status = 400;
    return;
  }
  return next();
};

export default checkUrl;
