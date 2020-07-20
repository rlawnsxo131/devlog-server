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
    const { user_id, user_roll } = await decodeToken(token);
    ctx.state.user_id = user_id;
    ctx.state.user_roll = user_roll;
  } catch (e) {
    ctx.state.user_id = null;
    ctx.state.user_roll = null;
  }
  return next();
};
