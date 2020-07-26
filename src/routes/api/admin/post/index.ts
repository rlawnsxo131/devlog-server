import * as Router from '@koa/router';
import { getPosts, getPost, enrollPost, getSeriesPosts } from './post.ctrl';

const post = new Router();

post.get('/', getPosts);
post.get('/:id', getPost);
post.patch('/:id?', enrollPost);
post.get('/series', getSeriesPosts);

export default post;
