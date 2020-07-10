import { Middleware } from 'koa';
import { getRepository, createQueryBuilder, In } from 'typeorm';
import Post from '../../../../entity/Post';
import Tag from '../../../../entity/Tag';
import PostHasTag from '../../../../entity/PostHasTag';

export const getPost: Middleware = async ctx => {
  const { id } = ctx.params;
  if (!id) {
    ctx.status = 400;
    return;
  }

  try {
    const post = await getRepository(Post).findOne(id);
    ctx.body = {
      post,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const getPosts: Middleware = async ctx => {
  try {
    const posts = await getRepository(Post)
      .createQueryBuilder('p')
      .where('1 = 1')
      .orderBy('p.id', 'ASC')
      .getMany();
    ctx.body = {
      posts,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

type EnrollPostArgs = {
  id?: number;
  post_header: string;
  post_body: string;
  short_description: string;
  open_yn: boolean;
  tags: Array<string>;
};
export const enrollPost: Middleware = async ctx => {
  const {
    id,
    post_header,
    post_body,
    short_description,
    open_yn,
    tags,
  } = ctx.params as EnrollPostArgs;

  try {
    const postRepo = getRepository(Post);
    const post = id ? await postRepo.findOne(id) : new Post();
    if (!post) {
      ctx.status = 400;
      return;
    }
    post.post_header = post_header;
    post.short_description = short_description;
    post.post_body = post_body;
    post.open_yn = open_yn;
    await postRepo.save(post);

    // will has tags
    if (tags.length) {
      const tagList: Array<{ name: string }> = tags
        .filter(v => v.length)
        .map(v => {
          return { name: v };
        });

      // insert tags
      await createQueryBuilder()
        .insert()
        .into(Tag)
        .orIgnore()
        .values(tagList)
        .execute();

      const insertPostHasTags = await getRepository(Tag).find({
        where: {
          name: In([tags]),
        },
      });
      const insertPostHasTagList = insertPostHasTags.map(v => {
        return {
          post_id: post.id,
          tag_id: v.id,
        };
      });

      await createQueryBuilder()
        .insert()
        .into(PostHasTag)
        .orIgnore()
        .values(insertPostHasTagList)
        .execute();
    }

    ctx.body = {
      post_id: post.id,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};
