import * as Router from '@koa/router';
import { getSeries, enrollSeries } from './series.ctrl';

const series = new Router();

series.get('/', getSeries);
series.patch('/', enrollSeries);

export default series;
