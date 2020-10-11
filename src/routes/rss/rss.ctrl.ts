import { Middleware } from 'koa';
import Post from '../../entity/Post';
import { getRepository } from 'typeorm';
import { Feed } from 'feed';
import { Item } from 'feed/lib/typings';
import * as marked from 'marked';

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

export const getTagFeed: Middleware = ctx => {
  ctx.body = 'getTagFeed';
};
