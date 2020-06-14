import * as Router from '@koa/router';
import auth from './auth';

const admin = new Router();

admin.use('/auth', auth.routes());

export default admin;
