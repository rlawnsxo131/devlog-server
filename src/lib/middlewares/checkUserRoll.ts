import { Middleware } from 'koa';
import { getRepository } from 'typeorm';
import AdminUser, { UserRoll } from '../../entity/AdminUser';

export const checkUserRoll: Middleware = async (ctx, next) => {
  if (/^\/api\/admin\/auth/.test(ctx.path)) {
    return await next();
  }

  if (!ctx.state.user_id) {
    ctx.status = 400;
    return;
  }

  // 이걸 그냥 token에 넣은상태에서 check token을 할까?
  const user = await getRepository(AdminUser).findOne(ctx.state.user_id);
  if (!user || user.user_roll !== UserRoll.MASTER) {
    ctx.status = 400;
    return;
  }
  return await next();
};
