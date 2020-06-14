import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  getRepository,
} from 'typeorm';
import * as DataLoader from 'dataloader';

@Entity('comment')
export default class Comment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Index('ix_postid')
  @Column({ unsigned: true })
  post_id!: number;

  @Index('ix_level')
  @Column({ unsigned: true, default: 0 })
  level!: number;

  @Column({ default: false })
  has_replies!: boolean;

  @Index('ix_replycommentid')
  @Column({ unsigned: true, nullable: true })
  reply_comment_id?: number;

  @Index('ix_deleted')
  @Column({ default: false })
  deleted!: boolean;

  @Column({ type: 'varchar', length: 127 })
  writer!: string;

  @Column({ length: 127, type: 'varchar' })
  salt!: string;

  @Column({ length: 127, type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar', length: 127, nullable: true })
  email?: string;

  @Column({ length: 1000, type: 'varchar' })
  comment!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  edited_at?: Date;
}

export const createCommentsLoader = () =>
  new DataLoader<number, Array<Comment>>(async commentIds => {
    const subComments = await getRepository(Comment)
      .createQueryBuilder('c')
      .where('c.reply_comment_id IN (:commentIds)', { commentIds })
      .andWhere('(c.deleted = false or c.has_replies = true)')
      .orderBy('c.id', 'ASC')
      .getMany();

    const obj: {
      [key: number]: Array<Comment>;
    } = {};
    commentIds.forEach(v => {
      obj[v] = [];
    });
    subComments.forEach(v => {
      return v.reply_comment_id && obj[v.reply_comment_id].push(v);
    });

    return commentIds.map(v => obj[v]);
  });
