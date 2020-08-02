import * as Router from '@koa/router';
import { getSeries, enrollSeries, getSeriesPosts } from './series.ctrl';

const series = new Router();

series.get('/', getSeries);
series.patch('/', enrollSeries);
series.get('/posts', getSeriesPosts);

export default series;
