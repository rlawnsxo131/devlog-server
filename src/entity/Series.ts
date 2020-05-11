import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('series')
@Index('ix_id_postid', ['id', 'post_id'], { unique: true })
export default class Series {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Index('ix_postid')
  @Column({ unsigned: true })
  post_id!: number;

  @Column({ length: 200, type: 'varchar' })
  series_name!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
