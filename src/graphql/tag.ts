import { gql, IResolvers } from 'apollo-server-koa';
import { getRepository } from 'typeorm';
import Tag from '../entity/Tag';
import PostHasTag from '../entity/PostHasTag';

export const typeDef = gql`
  type Tag {
    id: ID
    name: String!
    updated_at: Date
    created_at: Date
    count: String
  }

  extend type Query {
    tags: [Tag]
  }
`;

export const resolvers: IResolvers = {
  Query: {
    tags: async _ => {
      const tags = await getRepository(Tag)
        .createQueryBuilder('t')
        .select(['t.*, COUNT(*) as count'])
        .innerJoin(PostHasTag, 'pht', 't.id = pht.tag_id')
        .groupBy('t.id')
        .orderBy('t.id', 'ASC')
        .getRawMany();
      return tags;
    },
  },
  Mutation: {},
};
