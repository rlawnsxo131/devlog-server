import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  getRepository,
} from 'typeorm';
import * as DataLoader from 'dataloader';
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

  static async findOrCreate(name: string) {
    const tagRepo = getRepository(Tag);
    const tag = await tagRepo.findOne({ name });
    if (tag) {
      return tag;
    }
    const newTag = new Tag();
    newTag.name = name;
    await tagRepo.save(newTag);
    return newTag;
  }
}

export type PostTag = { post_id: number; name: string };
export const createTagsLoader = () =>
  new DataLoader<Readonly<number>, Array<PostTag>>(async (postIds) => {
    const tags = await getRepository(Tag)
      .createQueryBuilder('t')
      .select(['t.name, pht.post_id'])
      .innerJoin(PostHasTag, 'pht', 't.id = pht.tag_id')
      .where('pht.post_id IN (:postIds)', { postIds })
      .getRawMany();

    const groupingObj = groupByObjectId<PostTag>(
      postIds,
      tags,
      (tag) => tag.post_id
    );
    return postIds.map((id) => groupingObj[id]);
  });
