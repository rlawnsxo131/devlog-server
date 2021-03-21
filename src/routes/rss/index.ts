import Router from '@koa/router';
import { getAllFeed, getTagFeed } from './rss.ctrl';

const rss = new Router();

rss.get('/', getAllFeed);
rss.get('/:tag', getTagFeed);

export default rss;
