import * as Router from '@koa/router';
import auth from './auth';
import post from './post';
import series from './series';

const admin = new Router();

admin.use('/auth', auth.routes());
admin.use('/post', post.routes());
admin.use('/series', series.routes());

export default admin;
