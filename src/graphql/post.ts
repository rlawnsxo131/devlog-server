import { gql, IResolvers, ApolloError } from 'apollo-server-koa';
import { getRepository } from 'typeorm';
import Tag, { PostTag } from '../entity/Tag';
import Post from '../entity/Post';
import PostHasTag from '../entity/PostHasTag';
import Comment from '../entity/Comment';

export const typeDef = gql`
  type Post {
    id: ID!
    post_header: String!
    post_body: String!
    short_description: String
    open_yn: Boolean!
    series_id: Int!
    created_at: Date!
    updated_at: Date!
    tags: [String]!
    comments_count: Int!
  }

  extend type Query {
    post(id: ID!): Post!
    posts(tag: String): [Post]!
  }
`;

export const resolvers: IResolvers = {
  // parent, args, context, info
  Post: {
    tags: async (parent: Post, _, { loaders }) => {
      const tags: Array<PostTag> = await loaders.tag.load(parent.id);
      return tags.map(tag => tag.name);
    },
    comments_count: async (parent: Post) => {
      const commentsCount = await getRepository(Comment)
        .createQueryBuilder('c')
        .where('c.post_id = :post_id', { post_id: parent.id })
        .andWhere('(c.deleted = false or c.has_replies = true)')
        .orderBy('c.id', 'ASC')
        .getCount();

      return commentsCount;
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
        throw new ApolloError('GET_POST ERROR');
      }
    },
    posts: async (_, { tag }: { tag?: string }) => {
      try {
        const query = getRepository(Post)
          .createQueryBuilder('p')
          .leftJoin(PostHasTag, 'pht', 'p.id = pht.post_id')
          .leftJoin(Tag, 't', 't.id = pht.tag_id')
          .where('open_yn = true')
          .groupBy('p.id')
          .orderBy('p.id', 'DESC');

        if (tag && tag !== 'undefined') {
          query.andWhere('t.name = :tag', { tag });
        }
        const posts = await query.getMany();
        return posts;
      } catch (e) {
        throw new ApolloError('GET_POSTS ERROR');
      }
    },
  },
  Mutation: {},
};
