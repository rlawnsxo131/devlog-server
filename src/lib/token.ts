import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';

export function generateToken(
  payload: any,
  options?: jwt.SignOptions
): Promise<string> {
  const secretKey = process.env.SECRET_KEY || undefined;
  const jwtOptions: jwt.SignOptions = {
    issuer: 'devlog.juntae.kim',
    // 이건 나중에 분기
    subject: 'auth',
    expiresIn: '7d',
    ...options,
  };
  return new Promise((resolve, reject) => {
    if (!secretKey) return;
    jwt.sign(payload, secretKey, jwtOptions, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}

export function decodeToken<T>(token: string): Promise<T> {
  const secretKey = process.env.SECRET_KEY || undefined;
  return new Promise((resolve, reject) => {
    if (!secretKey) return;
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded as any);
    });
  });
}

export function setTokenCookie(ctx: Context, token: string): void {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    ctx.cookies.set('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  if (NODE_ENV === 'production') {
    ctx.cookies.set('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: '.juntae.kim',
    });
  }
}

export function removeTokenCookie(ctx: Context): void {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    ctx.cookies.set('access_token', '', {
      maxAge: 0,
      httpOnly: true,
    });
  }

  if (NODE_ENV === 'production') {
    ctx.cookies.set('access_token', '', {
      maxAge: 0,
      httpOnly: true,
      domain: '.juntae.kim',
    });
  }
}
