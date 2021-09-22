import { ApolloError, gql } from 'apollo-server-koa';
import { IResolvers } from '@graphql-tools/utils';
import { getRepository } from 'typeorm';
import { createSaltAndHash, decrypt } from '../lib/utils';
import Comment from '../entity/Comment';
import errorCodes from '../lib/errorCodes';

export const typeDef = gql`
  type Comment {
    id: ID!
    post_id: ID!
    level: Int!
    has_replies: Boolean!
    reply_comment_id: ID
    deleted: Boolean!
    writer: String!
    email: String
    comment: String!
    created_at: Date!
    updated_at: Date!
    edited_at: Date
    replies: [Comment]!
  }

  extend type Query {
    comments(post_id: ID!): [Comment]!
  }

  extend type Mutation {
    createComment(
      post_id: ID!
      reply_comment_id: ID
      writer: String!
      password: String!
      email: String
      comment: String!
    ): Boolean!
    updateComment(
      comment_id: ID!
      password: String!
      writer: String
      email: String
      comment: String!
    ): Boolean!
    removeComment(comment_id: ID!, password: String!): Boolean!
  }
`;

interface CreateCommentArgs {
  post_id: number;
  reply_comment_id?: number;
  writer: string;
  password: string;
  email?: string;
  comment: string;
}

interface UpdateCommentArgs {
  comment_id: number;
  password: string;
  writer?: string;
  email?: string;
  comment: string;
}

interface RemoveCommentArgs {
  comment_id: number;
  password: string;
}

export const resolvers: IResolvers = {
  Comment: {
    replies: async (parent: Comment, _, { loaders }) => {
      const replies = await loaders.comment.load(parent.id);
      return replies;
    },
    comment: (parent: Comment) => {
      return parent.deleted ? '삭제된 댓글입니다.' : parent.comment;
    },
  },
  Query: {
    comments: async (_, { post_id }) => {
      const comments = await getRepository(Comment)
        .createQueryBuilder('c')
        .where('c.post_id = :post_id', { post_id })
        .andWhere('c.level = 0')
        .andWhere('(c.deleted IS FALSE OR c.has_replies IS TRUE)')
        .orderBy('c.id', 'ASC')
        .getMany();
      return comments;
    },
  },
  Mutation: {
    createComment: async (_, args: CreateCommentArgs) => {
      const { post_id, reply_comment_id, writer, password, email, comment } =
        args;
      const commentRepo = getRepository(Comment);
      const newComment = new Comment();
      if (reply_comment_id) {
        const commentTarget = await commentRepo.findOne(reply_comment_id);
        if (!commentTarget) {
          throw new ApolloError('Not Found Comment Target', errorCodes.UNKNOWN);
        }
        commentTarget.has_replies = true;
        newComment.reply_comment_id = reply_comment_id;
        newComment.level = commentTarget.level + 1;
        if (newComment.level > 2) {
          throw new ApolloError(
            `Comment Level Exceeded: ${newComment.level}`,
            errorCodes.BAD_REQUEST,
          );
        }
        await commentRepo.save(commentTarget);
      }
      try {
        const { salt, hash } = await createSaltAndHash(password);
        newComment.post_id = post_id;
        newComment.writer = writer;
        newComment.salt = salt;
        newComment.password = hash;
        newComment.email = email && email;
        newComment.comment = comment;
        await commentRepo.save(newComment);
        return true;
      } catch (e) {
        throw new ApolloError(`Create Comment Error: ${e}`, errorCodes.UNKNOWN);
      }
    },
    updateComment: async (_, args) => {
      const { comment_id, password, writer, email, comment } =
        args as UpdateCommentArgs;
      const commentRepo = getRepository(Comment);
      const targetComment = await commentRepo.findOne(comment_id);
      if (!targetComment) {
        throw new ApolloError('Not Found Target Comment', errorCodes.UNKNOWN);
      }
      const decryptPassword = await decrypt(password, targetComment.salt);
      if (decryptPassword !== targetComment.password) {
        throw new ApolloError(
          'Not Matched Password',
          errorCodes.NOT_MATCHED_PASSWORD,
        );
      }
      try {
        targetComment.writer = writer ? writer : targetComment.writer;
        targetComment.email = email && email;
        targetComment.comment = comment;
        targetComment.edited_at = new Date();
        await commentRepo.save(targetComment);
        return true;
      } catch (e) {
        throw new ApolloError(`Update Comment Error: ${e}`, errorCodes.UNKNOWN);
      }
    },
    removeComment: async (_, args) => {
      const { comment_id, password } = args as RemoveCommentArgs;
      const commentRepo = getRepository(Comment);
      const targetComment = await commentRepo.findOne(comment_id);
      if (!targetComment) {
        throw new ApolloError('Not Found Target Comment', errorCodes.UNKNOWN);
      }
      const decryptPassword = await decrypt(password, targetComment.salt);
      if (decryptPassword !== targetComment.password) {
        throw new ApolloError(
          'Not Matched Password',
          errorCodes.NOT_MATCHED_PASSWORD,
        );
      }
      try {
        // targetComment
        targetComment.deleted = true;
        const repliesCount = await commentRepo
          .createQueryBuilder('c')
          .where('reply_comment_id = :id', { id: targetComment.id })
          .andWhere('deleted IS FALSE')
          .getCount();

        if (repliesCount === 0) {
          targetComment.has_replies = false;
        }
        await commentRepo.save(targetComment);
        // parentsComment
        const parentsComment = await commentRepo.findOne(
          targetComment.reply_comment_id,
        );
        if (parentsComment) {
          const parentsRepliesCount = await commentRepo
            .createQueryBuilder('c')
            .where('reply_comment_id = :id', { id: parentsComment.id })
            .andWhere('deleted IS FALSE')
            .getCount();
          if (parentsRepliesCount === 0) {
            parentsComment.has_replies = false;
          }
          await commentRepo.save(parentsComment);
        }
        return true;
      } catch (e) {
        throw new ApolloError(`Remove Comment Error: ${e}`, errorCodes.UNKNOWN);
      }
    },
  },
};
