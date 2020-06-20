import { Middleware } from 'koa';

export const getPost: Middleware = ctx => {
  const { id } = ctx.params;
  ctx.body = `${id} - getPost`;
};

export const getPosts: Middleware = ctx => {
  ctx.body = 'getPosts';
};

export const createPost: Middleware = ctx => {
  ctx.body = 'createPosts';
};

export const updatePost: Middleware = ctx => {
  ctx.body = 'updatePosts';
};

export const deletePost: Middleware = ctx => {
  ctx.body = 'deletePosts';
};
