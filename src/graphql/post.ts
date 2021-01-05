import { gql, IResolvers, ApolloError } from 'apollo-server-koa';
import { getRepository } from 'typeorm';
import Tag, { PostTag } from '../entity/Tag';
import Post, { SeriesPost } from '../entity/Post';
import PostHasTag from '../entity/PostHasTag';
import Series from '../entity/Series';
import errorCodes from '../lib/errorCodes';

export const typeDef = gql`
  type SeriesPost {
    series_id: ID!
    series_name: String!
    post_id: ID!
    url_slug: String!
    post_header: String!
  }
  type Post {
    id: ID!
    post_header: String!
    post_body: String!
    short_description: String
    preview_description: String!
    thumnail: String
    open_yn: Boolean!
    series_id: Int!
    url_slug: String!
    created_at: Date!
    updated_at: Date!
    released_at: Date
    tags: [String]!
    comments_count: Int!
    series_posts: [SeriesPost]
  }

  extend type Query {
    post(url_slug: String!): Post!
    posts(tag: String): [Post]!
  }
`;

type PostQueryParams = {
  url_slug: string;
};

export const resolvers: IResolvers = {
  // parent, args, context, info
  Post: {
    tags: async (parent: Post, _, { loaders }) => {
      const tags: Array<PostTag> = await loaders.tag.load(parent.id);
      return tags.map((tag) => tag.name);
    },
    comments_count: async (parent: Post, _, { loaders }) => {
      const commentsCount = await loaders.commentsCount.load(parent.id);
      return commentsCount;
    },
    series_posts: async (parent: Post) => {
      let seriesPosts: Array<SeriesPost> = [];
      if (parent.series_id) {
        seriesPosts = await getRepository(Series)
          .createQueryBuilder('s')
          .select([
            'p.series_id, s.series_name, p.id as post_id, p.url_slug, p.post_header',
          ])
          .innerJoin(Post, 'p', 's.id = p.series_id')
          .where('p.series_id = :series_id', { series_id: parent.series_id })
          .andWhere('p.open_yn IS TRUE')
          .getRawMany();
      }
      return seriesPosts;
    },
    preview_description: (parent: Post) => {
      return parent.post_body.slice(0, 150);
    },
  },
  Query: {
    post: async (_, { url_slug }: PostQueryParams) => {
      if (!url_slug) {
        throw new ApolloError('Not Found Url Slug', errorCodes.BAD_REQUEST);
      }
      const post = await getRepository(Post).findOne({ url_slug });
      if (!post || !post.open_yn) {
        throw new ApolloError('Not Found Post', errorCodes.NOT_FOUND);
      }
      return post;
    },
    posts: async (_, { tag }: { tag?: string }) => {
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
        throw new ApolloError('Not Found Posts', errorCodes.NOT_FOUND);
      }

      return posts;
    },
  },
  Mutation: {},
};
