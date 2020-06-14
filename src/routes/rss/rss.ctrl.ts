import { Middleware } from 'koa';

export const getAllFeed: Middleware = ctx => {
  ctx.body = 'getAllFeed';
};

export const getTagFeed: Middleware = ctx => {
  ctx.body = 'getTagFeed';
};
