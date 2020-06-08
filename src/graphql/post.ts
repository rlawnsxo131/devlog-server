import { gql, IResolvers, ApolloError } from 'apollo-server-koa';
import { getRepository, createQueryBuilder } from 'typeorm';
import Tag, { PostTag } from '../entity/Tag';
import Post from '../entity/Post';
import PostHasTag from '../entity/PostHasTag';
import Comment from '../entity/Comment';

export const typeDef = gql`
  type Post {
    id: ID!
    post_header: String
    post_body: String
    short_description: String
    open_yn: Boolean!
    series_id: Int!
    created_at: Date!
    updated_at: Date!
    tags: [String]!
    comments: [Comment]!
  }

  extend type Query {
    post(id: ID!): Post!
    posts(tag: String, all: Boolean!): [Post]!
  }

  extend type Mutation {
    enrollPost(
      id: ID
      post_header: String!
      post_body: String!
      short_description: String
      open_yn: Boolean!
      tags: [String]!
    ): Post!
  }
`;

type EnrollPostArgs = {
  id?: number;
  post_header: string;
  post_body: string;
  short_description: string;
  open_yn: boolean;
  tags: Array<string>;
};

export const resolvers: IResolvers = {
  // parent, args, context, info
  Post: {
    tags: async (parent: Post, _, { loaders }) => {
      const tags: Array<PostTag> = await loaders.tag.load(parent.id);
      return tags.map(tag => tag.name);
    },
    comments: async (parent: Post) => {
      const comments = await getRepository(Comment)
        .createQueryBuilder('c')
        .where('c.post_id = :post_id', { post_id: parent.id })
        .andWhere('c.level = 0')
        .andWhere('(c.deleted = false or c.has_replies = true)')
        .orderBy('c.id', 'ASC')
        .getMany();

      return comments;
    },
  },
  Query: {
    post: async (_, { id }: { id: number }) => {
      if (!id) {
        throw new ApolloError('NOT FOUND post_id');
      }
      try {
        const post = await getRepository(Post).findOne(id);
        if (!post) {
          throw new ApolloError('NOT FOUND POST');
        }
        return post;
      } catch (e) {
        console.error(e);
        throw new ApolloError('GET_POST ERROR');
      }
    },
    posts: async (_, { tag, all }: { tag?: string; all: boolean }) => {
      try {
        const query = getRepository(Post)
          .createQueryBuilder('p')
          .leftJoin(PostHasTag, 'pht', 'p.id = pht.post_id')
          .leftJoin(Tag, 't', 't.id = pht.tag_id')
          .where(all ? '1=1' : 'open_yn = true')
          .groupBy('p.id')
          .orderBy('p.id', 'DESC');

        if (tag && tag !== 'undefined') {
          query.andWhere('t.name = :tag', { tag });
        }
        const posts = await query.getMany();
        return posts;
      } catch (e) {
        console.error(e);
        throw new ApolloError('GET_POSTS ERROR');
      }
    },
  },
  Mutation: {
    enrollPost: async (_, args) => {
      const {
        id,
        post_header,
        post_body,
        short_description,
        open_yn,
        tags,
      } = args as EnrollPostArgs;
      try {
        // insert or update post
        const postRepo = getRepository(Post);
        const post = id ? await postRepo.findOne(id) : new Post();
        if (!post) throw new ApolloError('Not Found Update Target Post');
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

          // insert post_has_tag(tags)
          const insertPostHasTagList: Array<{
            post_id?: number;
            tag_id?: number;
          }> = await Promise.all(
            tags.map(async v => {
              const tag = await getRepository(Tag)
                .createQueryBuilder('t')
                .where('t.name = :name', { name: v })
                .getOne();
              return {
                post_id: post.id,
                tag_id: tag?.id,
              };
            })
          );
          await createQueryBuilder()
            .insert()
            .into(PostHasTag)
            .orIgnore()
            .values(insertPostHasTagList)
            .execute();
        }
        return post;
      } catch (e) {
        console.error(e);
        throw new ApolloError('CREATE POST ERROR');
      }
    },
  },
};
