import { Middleware } from 'koa';
import { getRepository } from 'typeorm';
import AdminUser from '../../../../entity/AdminUser';
import { normalizedString, decrypt } from '../../../../lib/utils';
import { generateToken, setTokenCookie } from '../../../../lib/token';

export const authCheck: Middleware = async ctx => {
  if (!ctx.state.user_id) {
    ctx.status = 400;
    return;
  }

  try {
    const adminRepo = getRepository(AdminUser);
    const adminUser = await adminRepo.findOne(ctx.state.user_id);
    if (!adminUser || !adminUser.confirm_yn) {
      ctx.status = 400;
      return;
    }
    ctx.body = {
      email: adminUser.email,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

type SignInParams = {
  email: string;
  password: string;
};
export const signIn: Middleware = async ctx => {
  const { email, password }: SignInParams = ctx.request.body;
  if (!normalizedString(email) || !normalizedString(password)) {
    ctx.status = 400;
    return;
  }

  try {
    const adminUserRepo = getRepository(AdminUser);
    const adminUser = await adminUserRepo.findOne({ email });
    const decryptPassword = adminUser
      ? await decrypt(password, adminUser.salt)
      : undefined;

    // compare hash value
    if (!adminUser || decryptPassword !== adminUser.password) {
      ctx.status = 400;
      return;
    }

    if (!adminUser.confirm_yn) {
      ctx.status = 400;
      return;
    }

    const token = await generateToken({
      user_id: adminUser.id,
      email,
    });
    setTokenCookie(ctx, token);

    ctx.body = {
      email,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const signOut: Middleware = async ctx => {
  if (!ctx.state.user_id) {
    ctx.status = 400;
    return;
  }
  ctx.cookies.set('access_token', '', { maxAge: 0, httpOnly: true });
  ctx.status = 204;
};
