import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('post_has_tag')
@Index('ix_postid_tagid', ['post_id', 'tag_id'], { unique: true })
export default class PostHasTag {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Index('ix_postid')
  @Column({ unsigned: true })
  post_id!: number;

  @Index('ix_tagid')
  @Column({ unsigned: true })
  tag_id!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
