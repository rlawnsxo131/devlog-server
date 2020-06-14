import { makeExecutableSchema, gql, IResolvers } from 'apollo-server-koa';
import { merge } from 'lodash';
import * as post from './post';
import * as tag from './tag';
import * as comment from './comment';

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
  typeDefs: [typeDef, post.typeDef, tag.typeDef, comment.typeDef],
  resolvers: merge(resolvers, post.resolvers, tag.resolvers, comment.resolvers),
});

export default schema;
