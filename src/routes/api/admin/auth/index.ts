import * as Router from '@koa/router';
import { authCheck, signIn, signOut } from './auth.ctrl';

const auth = new Router();

auth.get('/', authCheck);
auth.post('/', signIn);
auth.put('/', signOut);

export default auth;
