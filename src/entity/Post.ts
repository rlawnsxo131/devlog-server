import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('post')
export default class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column()
  post_header!: string;

  @Column({ type: 'text' })
  post_body!: string;

  @Column()
  short_description!: string;

  @Index('ix_openyn')
  @Column({ default: false })
  open_yn!: boolean;

  @Index('ix_seriesid')
  @Column({ unsigned: true, default: 0 })
  series_id!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
