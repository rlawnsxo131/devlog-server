import { createTagsLoader } from '../entity/Tag';
import { createCommentsLoader } from '../entity/Comment';

function createLoaders() {
  return {
    tag: createTagsLoader(),
    comment: createCommentsLoader()
  };
}

export type Loders = ReturnType<typeof createLoaders>;
export default createLoaders;
