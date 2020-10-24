import { gql, IResolvers, ApolloError } from 'apollo-server-koa';
import { getRepository } from 'typeorm';
import Tag, { PostTag } from '../entity/Tag';
import Post, { SeriesPost } from '../entity/Post';
import PostHasTag from '../entity/PostHasTag';
import Comment from '../entity/Comment';
import Series from '../entity/Series';

export const typeDef = gql`
  type SeriesPost {
    series_id: ID!
    series_name: String!
    post_id: ID!
    post_header: String!
  }
  type Post {
    id: ID!
    post_header: String!
    post_body: String!
    short_description: String
    open_yn: Boolean!
    series_id: Int!
    created_at: Date!
    updated_at: Date!
    released_at: Date
    tags: [String]!
    comments_count: Int!
    series_posts: [SeriesPost]
  }

  extend type Query {
    post(id: ID!, post_header: String!): Post!
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
        .andWhere('(c.deleted = false OR c.has_replies = true)')
        .orderBy('c.id', 'ASC')
        .getCount();

      return commentsCount;
    },
    series_posts: async (parent: Post) => {
      let seriesPosts: Array<SeriesPost> = [];
      if (parent.series_id) {
        seriesPosts = await getRepository(Series)
          .createQueryBuilder('s')
          .select([
            'p.series_id, s.series_name, p.id as post_id, p.post_header',
          ])
          .innerJoin(Post, 'p', 's.id = p.series_id')
          .where('p.series_id = :series_id', { series_id: parent.series_id })
          .andWhere('p.open_yn IS TRUE')
          .getRawMany();
      }
      return seriesPosts;
    },
  },
  Query: {
    post: async (
      _,
      { id, post_header }: { id: number; post_header: string }
    ) => {
      if (!id) {
        throw new ApolloError('Not Found post_id');
      }
      const post = await getRepository(Post).findOne(id);
      if (!post || !post.open_yn) {
        throw new ApolloError('Not Found POST');
      }

      if (post.post_header !== post_header) {
        throw new ApolloError('Not Found POST');
      }
      return post;
    },
    posts: async (_, { tag }: { tag?: string }) => {
      try {
        const query = getRepository(Post)
          .createQueryBuilder('p')
          .leftJoin(PostHasTag, 'pht', 'p.id = pht.post_id')
          .leftJoin(Tag, 't', 't.id = pht.tag_id')
          .where('open_yn IS TRUE')
          .groupBy('p.id')
          .orderBy('p.released_at', 'DESC');

        if (tag && tag !== 'undefined') {
          query.andWhere('t.name = :tag', { tag });
        }

        const posts = await query.getMany();

        if (tag && !posts.length) {
          throw new ApolloError('Not Found posts');
        }

        return posts;
      } catch (e) {
        throw new ApolloError(e);
      }
    },
  },
  Mutation: {},
};
