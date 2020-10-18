import { Middleware } from 'koa';
import { getRepository, EntityManager, getConnection } from 'typeorm';
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
    const post = await getRepository(Post)
      .createQueryBuilder('p')
      .select(['p.*, group_concat(t.name) as tags'])
      .leftJoin(PostHasTag, 'pht', 'p.id = pht.post_id')
      .leftJoin(Tag, 't', 'pht.tag_id = t.id')
      .where('p.id = :id', { id })
      .groupBy('p.id')
      .getRawOne();
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
      .select(['p.*, group_concat(t.name) as tags'])
      .leftJoin(PostHasTag, 'pht', 'p.id = pht.post_id')
      .leftJoin(Tag, 't', 'pht.tag_id = t.id')
      .where('1 = 1')
      .groupBy('p.id')
      .orderBy('p.id', 'DESC')
      .getRawMany();
    // limit content length
    const result = posts.map(v => {
      return { ...v, post_body: v.post_body.slice(0, 200) };
    });
    ctx.body = {
      posts: result,
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
  series_id?: number;
  tags: Array<string>;
};
export const enrollPost: Middleware = async ctx => {
  const {
    id,
    post_header,
    post_body,
    short_description,
    open_yn,
    series_id,
    tags,
  } = ctx.request.body as EnrollPostArgs;

  // start transaction
  await getConnection().transaction(async (tm: EntityManager) => {
    try {
      const postRepo = tm.getRepository(Post);
      const postHasTagRepo = tm.getRepository(PostHasTag);
      const post = id ? await postRepo.findOne(id) : new Post();
      if (!post) {
        ctx.status = 400;
        return;
      }
      let released_at = undefined;
      if (open_yn && !post.released_at) {
        released_at = new Date();
      }
      if (post.released_at) {
        released_at = post.released_at;
      }

      post.post_header = post_header;
      post.short_description = short_description;
      post.post_body = post_body;
      post.open_yn = open_yn;
      post.released_at = released_at;
      post.series_id = series_id ? series_id : 0;
      await postRepo.save(post);

      if (!tags.length) {
        await postHasTagRepo
          .createQueryBuilder()
          .delete()
          .where('post_id = :id', { id: post.id })
          .execute();
      }

      if (tags.length) {
        const prevTags = await tm
          .getRepository(Tag)
          .createQueryBuilder('t')
          .select('t.id, t.name, pht.id as post_has_tag_id')
          .innerJoin(PostHasTag, 'pht', 't.id = pht.tag_id')
          .where('pht.post_id = :id', { id: post.id })
          .getRawMany();

        // insert tag, post_has_tag
        const tagsData = await Promise.all(tags.map(Tag.findOrCreate));
        const insertPostHasTagList = tagsData.map(tag => {
          return {
            post_id: post.id,
            tag_id: tag.id,
          };
        });
        await Promise.all(insertPostHasTagList.map(PostHasTag.findOrCreate));

        // delete post_has_tag
        const deletePostHasTagIds = prevTags
          .filter(v => !tags.includes(v.name))
          .map(v => v.post_has_tag_id);

        if (deletePostHasTagIds.length) {
          await postHasTagRepo
            .createQueryBuilder()
            .delete()
            .where('id IN (:ids)', { ids: deletePostHasTagIds })
            .execute();
        }
      }

      // delete tag
      await tm.query(
        `
        DELETE
        FROM t USING tag t
        LEFT OUTER JOIN post_has_tag pht ON t.id = pht.tag_id
        WHERE pht.id IS NULL
        `
      );

      ctx.body = {
        post,
      };
    } catch (e) {
      ctx.throw(500, e);
    }
  });
};
