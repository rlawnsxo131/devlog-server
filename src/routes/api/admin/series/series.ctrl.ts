import { Middleware } from 'koa';
import { getRepository } from 'typeorm';
import Series from '../../../../entity/Series';

export const getSeries: Middleware = async ctx => {
  const series_list = await getRepository(Series).find({});
  ctx.body = {
    series_list,
  };
};

type EnrollSeriesArgs = {
  id?: number;
  series_name: string;
};
export const enrollSeries: Middleware = async ctx => {
  const seriesRepo = getRepository(Series);
  const { id, series_name } = ctx.request.body as EnrollSeriesArgs;
  const series = id ? await seriesRepo.findOne(id) : new Series();
  if (!series) {
    ctx.body = 400;
    return;
  }
  series.series_name = series_name;
  await seriesRepo.save(series);
  ctx.body = {
    series,
  };
};
