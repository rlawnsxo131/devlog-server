import * as jwt from 'jsonwebtoken';

export function generateToken(
  payload: any,
  options?: jwt.SignOptions
): Promise<string> {
  const secretKey = process.env.SECRET_KEY || undefined;
  const jwtOptions: jwt.SignOptions = {
    issuer: 'development-log',
    // 이건 나중에 분기
    subject: 'auth',
    expiresIn: '7d',
    ...options
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
