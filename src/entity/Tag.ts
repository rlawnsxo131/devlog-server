import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  getRepository,
} from 'typeorm';
import DataLoader from 'dataloader';
import { groupByObjectId } from '../lib/utils';
import PostHasTag from './PostHasTag';

@Entity('tag')
export default class Tag {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Index('ix_name', { unique: true })
  @Column({ length: 50, type: 'varchar' })
  name!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

export type PostTag = { post_id: number; name: string };
export const createTagsLoader = () =>
  new DataLoader<Readonly<number>, Array<PostTag>>(async (postIds) => {
    const tags = await getRepository(PostHasTag)
      .createQueryBuilder('pht')
      .select(['t.name, pht.post_id'])
      .innerJoin(Tag, 't', 'pht.tag_id = t.id')
      .where('pht.post_id IN (:postIds)', { postIds })
      .getRawMany();

    const groupingObj = groupByObjectId<PostTag>(
      postIds,
      tags,
      (tag) => tag.post_id,
    );
    return postIds.map((id) => groupingObj[id]);
  });
