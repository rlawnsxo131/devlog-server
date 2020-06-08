import { gql, IResolvers, ApolloError } from 'apollo-server-koa';
import { getRepository } from 'typeorm';
import { decrypt } from '../lib/utils';
import { generateToken } from '../lib/token';
import AdminUser from '../entity/AdminUser';

export const typeDef = gql`
  type AdminUser {
    id: ID!
    email: String!
    token: String!
  }

  extend type Query {
    authCheck: AdminUser!
  }

  extend type Mutation {
    signIn(email: String!, password: String!): AdminUser!
    signOut: Boolean!
  }
`;

export const resolvers: IResolvers = {
  Query: {
    authCheck: async (_, __, ctx) => {
      if (!ctx.user_id) {
        throw new ApolloError('Not Found user_id');
      }
      const adminRepo = getRepository(AdminUser);
      const adminUser = adminRepo.findOne(ctx.user_id);
      if (!adminUser) {
        throw new ApolloError('Not Found admin_user');
      }
      return adminUser;
    },
  },
  Mutation: {
    signIn: async (_, { email, password }, ctx) => {
      if (!email || !password) {
        throw new ApolloError('Need Email and Password');
      }
      const adminUserRepo = getRepository(AdminUser);
      const adminUser = await adminUserRepo.findOne({ email });
      const decryptPassword = adminUser
        ? await decrypt(password, adminUser.salt)
        : undefined;
      if (!adminUser || decryptPassword !== adminUser.password) {
        throw new ApolloError('Wrong Email or Password');
      }
      try {
        const token = await generateToken({ user_id: adminUser.id, email });
        ctx.cookies.set('access_token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return {
          email,
          token,
        };
      } catch (e) {
        console.error(e);
        throw new ApolloError('Admin Auth Error');
      }
    },
    signOut: async (_, __, ctx) => {
      if (!ctx.user_id) {
        throw new ApolloError('Not Found user_id');
      }
      ctx.cookies.set('access_token', null);
      return true;
    },
  },
};
