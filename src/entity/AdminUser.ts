import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('admin_user')
export default class AdminUser {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Index('ix_email', { unique: true })
  @Column({ type: 'varchar', length: 127 })
  email!: string;

  @Column({ type: 'varchar', length: 127 })
  password!: string;

  @Column({ type: 'varchar', length: 127 })
  salt!: string;

  @Column({ default: false })
  confirm_yn!: boolean;

  @Column({ type: 'varchar', length: 127, nullable: true })
  code?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
