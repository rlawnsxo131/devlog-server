import * as Router from '@koa/router';
import admin from './admin';
import { checkUser } from '../../lib/middlewares/checkUser';

const api = new Router();

api.use(checkUser);
api.use('/admin', admin.routes());

export default api;
