import { createTagsLoader } from '../entity/Tag';
import { createCommentsLoader } from '../entity/Comment';
import {
  createCommentsCountLoader,
  createSeriesPostsLoader,
} from '../entity/Post';

function createLoaders() {
  return {
    tag: createTagsLoader(),
    comment: createCommentsLoader(),
    seriesPosts: createSeriesPostsLoader(),
    commentsCount: createCommentsCountLoader(),
  };
}

export type Loders = ReturnType<typeof createLoaders>;
export default createLoaders;
