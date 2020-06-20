import * as Router from '@koa/router';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from './post.ctrl';

const post = new Router();

post.get('/', getPosts);
post.get('/:id', getPost);
post.post('/', createPost);
post.patch('/:id', updatePost);
post.delete('/:id', deletePost);

export default post;
