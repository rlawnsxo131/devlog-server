import * as Router from '@koa/router';
import admin from './admin';
import { checkUserRoll } from '../../lib/middlewares/checkUserRoll';

const api = new Router();

api.use(checkUserRoll);
api.use('/admin', admin.routes());

export default api;
