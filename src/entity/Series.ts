import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('series')
export default class Series {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 200, type: 'varchar' })
  series_name!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
