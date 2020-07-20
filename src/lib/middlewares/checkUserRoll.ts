import { Middleware } from 'koa';
import { UserRoll } from '../../entity/AdminUser';

export const checkUserRoll: Middleware = async (ctx, next) => {
  if (/^\/api\/admin\/auth/.test(ctx.path)) {
    return await next();
  }
  if (!ctx.state.user_id || ctx.state.user_roll !== UserRoll.MASTER) {
    ctx.status = 400;
    return;
  }
  return await next();
};
