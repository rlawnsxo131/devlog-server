import { gql } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { IResolvers } from '@graphql-tools/utils';
import merge from 'lodash.merge';
import * as post from './post';
import * as tag from './tag';
import * as comment from './comment';
import * as series from './series';

const typeDef = gql`
  scalar Date
  type Query {
    _version: String
  }
  type Mutation {
    _empty: String
  }
`;

const resolvers: IResolvers = {
  Query: {
    _version: () => '1.0',
  },
  Mutation: {},
};

const schema = makeExecutableSchema({
  typeDefs: [
    typeDef,
    post.typeDef,
    tag.typeDef,
    comment.typeDef,
    series.typeDef,
  ],
  resolvers: merge(
    resolvers,
    post.resolvers,
    tag.resolvers,
    comment.resolvers,
    series.resolvers,
  ),
});

export default schema;
