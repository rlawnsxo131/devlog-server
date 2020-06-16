import * as Router from '@koa/router';
import { getPost } from './post.ctrl';

const post = new Router();

post.get('/:id', getPost);

export default post;
