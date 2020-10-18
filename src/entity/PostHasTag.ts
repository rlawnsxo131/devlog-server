import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  getRepository,
} from 'typeorm';

@Entity('post_has_tag')
@Index('ix_postid_tagid', ['post_id', 'tag_id'], { unique: true })
export default class PostHasTag {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ unsigned: true })
  post_id!: number;

  @Column({ unsigned: true })
  tag_id!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  static async findOrCreate({
    post_id,
    tag_id,
  }: {
    post_id: number;
    tag_id: number;
  }) {
    const postHasTagRepo = getRepository(PostHasTag);
    const postHasTag = await postHasTagRepo.findOne({ post_id, tag_id });
    if (postHasTag) {
      return postHasTag;
    }
    const newPostHasTag = new PostHasTag();
    newPostHasTag.post_id = post_id;
    newPostHasTag.tag_id = tag_id;
    await postHasTagRepo.save(newPostHasTag);
    return newPostHasTag;
  }
}
