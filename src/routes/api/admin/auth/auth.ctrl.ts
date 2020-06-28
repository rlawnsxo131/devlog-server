import { Middleware } from 'koa';
import { getRepository } from 'typeorm';
import AdminUser from '../../../../entity/AdminUser';
import { normalizedString, decrypt } from '../../../../lib/utils';
import { generateToken } from '../../../../lib/token';

export const authCheck: Middleware = async ctx => {
  if (!ctx.state.user_id) throw new Error('Not Found user_id');
  const adminRepo = getRepository(AdminUser);
  const adminUser = await adminRepo.findOne(ctx.user_id);
  if (!adminUser) throw new Error('Not Found admin_user');
  ctx.body = {
    email: adminUser.email,
  };
};

type SignInParams = {
  email: string;
  password: string;
};
export const signIn: Middleware = async ctx => {
  const { email, password }: SignInParams = ctx.request.body;

  if (!normalizedString(email) || !normalizedString(password)) {
    ctx.status = 400;
    ctx.body = { msg: 'Check Email or Password' };
    return;
  }

  const adminUserRepo = getRepository(AdminUser);
  const adminUser = await adminUserRepo.findOne({ email });
  const decryptPassword = adminUser
    ? await decrypt(password, adminUser.salt)
    : undefined;

  if (!adminUser || decryptPassword !== adminUser.password) {
    ctx.status = 400;
    ctx.body = 'Wrong Email or Password';
    return;
  }

  try {
    const token = await generateToken({ user_id: adminUser.id, email });
    ctx.cookies.set('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    ctx.body = {
      email,
      token,
    };
  } catch (e) {
    console.error(e);
    ctx.throw(e, 500);
  }
};

export const signOut: Middleware = async ctx => {
  if (!ctx.state.user_id) {
    ctx.throw(400, 'Not Logged In');
  }
  ctx.cookies.set('access_token', '', { maxAge: 0, httpOnly: true });
  ctx.status = 204;
};
