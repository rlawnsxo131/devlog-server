import { Middleware } from 'koa';

export const checkUser: Middleware = async (ctx, next) => {
  if (/^\/api\/admin\/auth/.test(ctx.path)) {
    return await next();
  }
  if (!ctx.state.user_id) {
    ctx.cookies.set('access_token', '', { maxAge: 0, httpOnly: true });
    ctx.status = 400;
    return;
  }
  return await next();
};
