import * as Router from '@koa/router';
import auth from './auth';
import post from './post';

const admin = new Router();

admin.use('/auth', auth.routes());
admin.use('/post', post.routes());

export default admin;
