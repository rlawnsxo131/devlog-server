import { Middleware } from 'koa';
import { format, lastDayOfMonth, subMonths } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import { Between, getRepository } from 'typeorm';
import Post from '../../entity/Post';

type SitemapLink = {
  location: string;
  lastmod?: string;
  changefreq?: string;
};

function getAllMonths() {
  let date = new Date();
  const months: Array<string> = [];

  while (format(date, 'yyyy-MM') !== '2020-09') {
    months.push(format(date, 'yyyy-MM'));
    date = subMonths(date, 1);
  }

  return months;
}

function generateSitemap(links: Array<SitemapLink>) {
  console.log(links);
  const urls = links
    .map(
      link => `<url>
  <loc>${link.location}</loc>
    ${link.lastmod ? `<lastmod>${link.lastmod}</lastmod>` : ''}
    ${link.changefreq ? `<changefreq>${link.changefreq}</changefreq>` : ''}
  </url>`
    )
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return xml;
}

export const sitemapIndex: Middleware = ctx => {
  const months = getAllMonths();
  const sitemaps = months
    .map(month => `https://api-devlog.juntae.kim/sitemaps/posts-${month}.xml`)
    .concat('https://api-devlog.juntae.kim/sitemaps/general.xml')
    .map(location => `<sitemap><loc>${location}</loc></sitemap>`)
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps}
  </sitemapindex>`;

  ctx.set('Content-Type', 'text/xml');
  ctx.body = xml;
};

export const generalSitemap: Middleware = ctx => {
  const links: SitemapLink[] = [
    {
      location: 'https://devlog.juntae.kim/',
      changefreq: 'always',
    },
    {
      location: 'https://devlog.juntae.kim/series',
      changefreq: 'daily',
    },
    {
      location: 'https://devlog.juntae.kim/tags',
      changefreq: 'weekly',
    },
  ];
  ctx.set('Content-Type', 'text/xml');
  ctx.body = generateSitemap(links);
};

export const postsSitemap: Middleware = async ctx => {
  const month = ctx.params.month;
  const startDate = new Date(`${month}-01`);
  const endDate = lastDayOfMonth(startDate);

  try {
    const posts = await getRepository(Post).find({
      where: {
        open_yn: true,
        released_at: Between(
          `${format(startDate, 'yyyy-MM-dd')} 00:00:00`,
          `${format(endDate, 'yyyy-MM-dd')} 23:59:59`
        ),
      },
      order: {
        released_at: 'DESC',
      },
    });
    const links: Array<SitemapLink> = posts.map(post => ({
      location: `https://devlog.juntae.kim/post/${post.post_header}?id=${post.id}`,
      lastmod:
        post.released_at &&
        `${format(post.released_at, 'yyyy-MM-dd HH:mm:ss', {
          locale: koLocale,
        })}`,
      changefreq: 'weekly',
    }));
    ctx.set('Content-Type', 'text/xml');
    ctx.body = generateSitemap(links);
  } catch (e) {
    ctx.throw(500, e);
  }
};
