import { createTagsLoader } from '../entity/Tag';
import { createCommentsLoader } from '../entity/Comment';
import { createPostsLoader } from '../entity/Post';

function createLoaders() {
  return {
    tag: createTagsLoader(),
    comment: createCommentsLoader(),
    post: createPostsLoader(),
  };
}

export type Loders = ReturnType<typeof createLoaders>;
export default createLoaders;
