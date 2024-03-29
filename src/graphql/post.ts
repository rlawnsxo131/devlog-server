import { gql, ApolloError } from 'apollo-server-koa';
import { IResolvers } from '@graphql-tools/utils';
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
  type LinkPost {
    id: ID!
    post_header: String!
    url_slug: String!
    thumbnail: String
  }
  type Post {
    id: ID!
    post_header: String!
    post_body: String!
    preview_description: String!
    thumbnail: String
    open_yn: Boolean!
    series_id: Int!
    url_slug: String!
    created_at: Date!
    updated_at: Date!
    released_at: Date
    tags: [String]!
    series_posts: [SeriesPost]
    link_posts: [LinkPost]
  }

  extend type Query {
    post(url_slug: String!, id: Int): Post!
    posts(tag: String): [Post]!
  }
`;

interface PostArgs {
  url_slug: string;
}

export const resolvers: IResolvers = {
  // parent, args, context, info
  Post: {
    tags: async (parent: Post, _, { loaders }) => {
      const tags: Array<PostTag> = await loaders.tag.load(parent.id);
      return tags.map((tag) => tag.name);
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
    link_posts: async (parent: Post) => {
      const query = getRepository(Post)
        .createQueryBuilder('p')
        .where('p.open_yn IS TRUE')
        .orderBy('p.released_at', 'DESC')
        .skip(0)
        .take(5);
      if (parent.series_id) {
        query.andWhere('p.series_id <> :series_id', {
          series_id: parent.series_id,
        });
      }
      if (!parent.series_id) {
        query.andWhere('p.id <> :post_id', { post_id: parent.id });
      }
      const link_posts = await query.getMany();
      return link_posts.map((v) => ({
        id: v.id,
        post_header: v.post_header,
        url_slug: v.url_slug,
        thumbnail: v.thumbnail,
      }));
    },
    preview_description: (parent: Post) => {
      return parent.post_body.slice(0, 200);
    },
  },
  Query: {
    post: async (_, { url_slug }: PostArgs) => {
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
        .where('open_yn IS TRUE')
        .orderBy('p.released_at', 'DESC');

      if (tag && tag !== 'undefined') {
        // better than joins
        const targetTag = await getRepository(Tag).findOne({
          name: tag,
        });
        if (!targetTag) {
          throw new ApolloError('Not Found Posts', errorCodes.NOT_FOUND);
        }
        const postHasTags = await getRepository(PostHasTag).find({
          tag_id: targetTag.id,
        });
        const postIds = postHasTags.map((v) => v.post_id);
        if (!postIds.length) {
          throw new ApolloError('Not Found Posts', errorCodes.NOT_FOUND);
        }
        query.andWhere('p.id IN (:postIds)', { postIds });
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
