import { gql, IResolvers } from 'apollo-server-koa';
import { getRepository } from 'typeorm';
import Series from '../entity/Series';
import { SeriesPost } from '../entity/Post';

export const typeDef = gql`
  type Series {
    id: ID!
    series_name: String!
    posts: [Post]
  }

  extend type Query {
    series: [Series]!
  }
`;

export const resolvers: IResolvers = {
  Series: {
    posts: async (parent: Series, _, { loaders }) => {
      const posts: Array<SeriesPost> = await loaders.seriesPosts.load(
        parent.id
      );
      return posts;
    },
  },
  Query: {
    series: async _ => {
      const series = await getRepository(Series).find({
        order: {
          id: 'DESC',
        },
      });
      return series;
    },
  },
  Mutation: {},
};
