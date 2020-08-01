import { Middleware } from 'koa';
import { decodeToken } from '../token';

export const checkToken: Middleware = async (ctx, next) => {
  let token = ctx.cookies.get('access_token');
  const { authorization } = ctx.request.headers;

  if (!token && authorization) {
    token = authorization.split(' ')[1];
  }
  if (!token) return next();

  try {
    const { user_id } = await decodeToken(token);
    ctx.state.user_id = user_id;
  } catch (e) {
    ctx.state.user_id = null;
  }
  return next();
};
