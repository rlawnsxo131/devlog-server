// 크롤러랑 외부 몇몇 api 만 허용하게 해서 추가 작업할까?

import { Middleware } from 'koa';

const checkUrl: Middleware = (ctx, next) => {
  const allowedHosts = [
    /^https:\/\/devlog.juntae.kim$/,
    /^https:\/\/john-admin.juntae.kim$/,
  ];

  if (process.env.NODE_ENV === 'development') {
    allowedHosts.push(/^http:\/\/localhost/);
  }

  const { origin } = ctx.headers;
  const valid = allowedHosts.some((regex) => regex.test(origin));

  if (!valid) {
    if (/^\/graphql/.test(ctx.path)) {
      ctx.staus = 400;
      return;
    }
    const allowUrl = [/^\/health/, /^\/rss/, /^\/atom/, /^\/sitemaps/];
    const validUrl = allowUrl.some((regex) => regex.test(ctx.path));
    if (!validUrl) {
      ctx.status = 400;
      return;
    }
  }
  return next();
};

export default checkUrl;
