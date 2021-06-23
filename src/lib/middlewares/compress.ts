import compress from 'koa-compress';
import zlib from 'zlib';

export default compress({
  filter(content_type) {
    return /text/i.test(content_type);
  },
  threshold: 2048,
  gzip: {
    flush: require('zlib').constants.Z_SYNC_FLUSH,
  },
  deflate: {
    flush: require('zlib').constants.Z_SYNC_FLUSH,
  },
  br: {
    flush: zlib.constants.Z_SYNC_FLUSH,
  },
});
