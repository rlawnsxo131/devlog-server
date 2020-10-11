import { Middleware } from 'koa';
import Post from '../../entity/Post';
import { getRepository } from 'typeorm';
import { Feed } from 'feed';
import { Item } from 'feed/lib/typings';
import * as marked from 'marked';
import PostHasTag from '../../entity/PostHasTag';
import Tag from '../../entity/Tag';

function createFeedFormat(post: Post): Item {
  const link = `https://devlog.juntae.kim/post/${post.post_header}?id=${post.id}`;
  return {
    link,
    title: post.post_header,
    description: marked(post.post_body).replace(/[\u001C-\u001F\u0008]/gu, ''),
    id: link,
    date: post.updated_at,
    author: [
      {
        name: 'juntae',
        link: 'https://devlog.juntae.kim/info',
      },
    ],
  };
}

export const getAllFeed: Middleware = async ctx => {
  const posts = await getRepository(Post).find({
    where: {
      open_yn: true,
    },
    order: {
      id: 'DESC',
    },
    skip: 0,
    take: 20,
  });

  const feed = new Feed({
    title: 'DevLog',
    description: 'DevLog',
    link: 'https://devlog.juntae.kim/',
    id: 'https://devlog.juntae.kim/',
    image: 'https://image-devlog.juntae.kim/logo/devlog.png',
    updated: posts[0]?.updated_at,
    copyright: 'Copyright (C) 2020. DevLog. All rights reserved.',
    feed: 'https://api-devlog.juntae.kim/rss',
  });

  const postFeeds = posts.map(createFeedFormat);
  postFeeds.forEach(feed.addItem);
  ctx.type = 'text/xml; charset=UTF-8';
  ctx.body = feed.rss2();
};

export const getTagFeed: Middleware = async ctx => {
  const tag = ctx.params.tag;
  const posts = await getRepository(Post)
    .createQueryBuilder('p')
    .select(['p.*, t.name as tag_name'])
    .innerJoin(PostHasTag, 'pht', 'p.id = pht.post_id')
    .innerJoin(Tag, 't', 'pht.tag_id = t.id')
    .where('p.open_yn IS TRUE')
    .andWhere('t.name = :tag', { tag })
    .orderBy('p.id', 'DESC')
    .limit(20)
    .getRawMany();

  const feed = new Feed({
    title: 'DevLog',
    description: 'DevLog',
    link: `https://devlog.juntae.kim/posts/${tag}`,
    id: `https://devlog.juntae.kim/posts/${tag}`,
    image: 'https://image-devlog.juntae.kim/logo/devlog.png',
    updated: posts[0]?.updated_at,
    copyright: 'Copyright (C) 2020. DevLog. All rights reserved.',
    feed: 'https://api-devlog.juntae.kim/rss',
  });

  const postFeeds = posts.map(createFeedFormat);
  postFeeds.forEach(feed.addItem);
  ctx.type = 'text/xml; charset=UTF-8';
  ctx.body = feed.rss2();
};
