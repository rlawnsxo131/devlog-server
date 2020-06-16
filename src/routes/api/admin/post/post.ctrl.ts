import { Middleware } from 'koa';

export const getPost: Middleware = ctx => {
  const { id } = ctx.params;
  ctx.body = `${id} - getPost`;
};
