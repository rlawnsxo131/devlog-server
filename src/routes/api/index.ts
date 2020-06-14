import * as Router from '@koa/router';
import admin from './admin';

const api = new Router();

api.use('/admin', admin.routes());

export default api;
