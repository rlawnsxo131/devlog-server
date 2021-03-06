import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  getRepository,
} from 'typeorm';
import DataLoader from 'dataloader';
import Series from './Series';
import { groupByObjectId } from '../lib/utils';

@Entity('post')
export default class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column()
  post_header!: string;

  @Column({ type: 'text' })
  post_body!: string;

  @Column({ default: null, nullable: true })
  thumbnail?: string;

  @Column({ default: false })
  open_yn!: boolean;

  @Index('ix_seriesid')
  @Column({ unsigned: true, default: 0 })
  series_id!: number;

  @Column({ type: 'varchar', length: 127 })
  url_slug!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Index('ix_releasedat')
  @Column({ type: 'timestamp', nullable: true })
  released_at?: Date;
}

export type SeriesPost = { id: number; series_id: number; post_header: string };
export const createSeriesPostsLoader = () =>
  new DataLoader<Readonly<number>, Array<SeriesPost>>(async (seriesIds) => {
    const posts = await getRepository(Series)
      .createQueryBuilder('s')
      .select(['p.id, p.url_slug, p.series_id, p.post_header, p.updated_at'])
      .innerJoin(Post, 'p', 's.id = p.series_id')
      .where('p.series_id IN (:seriesIds)', { seriesIds })
      .andWhere('p.open_yn IS TRUE')
      .orderBy('p.released_at', 'ASC')
      .getRawMany();

    const groupingObj = groupByObjectId<SeriesPost>(
      seriesIds,
      posts,
      (post) => post.series_id,
    );
    return seriesIds.map((id) => groupingObj[id]);
  });
