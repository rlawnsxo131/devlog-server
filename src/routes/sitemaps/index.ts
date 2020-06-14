import * as Router from '@koa/router';
import { sitemapIndex } from './sitemaps.ctrl';

const sitemaps = new Router();

sitemaps.get('/index.xml', sitemapIndex);

export default sitemaps;
