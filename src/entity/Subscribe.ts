import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('subscribe')
export default class subscribe {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Index('ix_email', { unique: true })
  @Column({ type: 'varchar', length: 127 })
  email!: string;

  @Column({ type: 'varchar', length: 127 })
  code!: string;

  @Column({ default: false })
  subscribe_yn!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
