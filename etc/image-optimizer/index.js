const querystring = require('querystring');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  region: 'ap-northeast-2',
});

const Sharp = require('sharp');
const BUCKET = 'image-devlog.juntae.kim'; // S3 Bucket 이름

async function resize(key, { format, w }) {
  const s3Object = await S3.getObject({
    Bucket: BUCKET,
    Key: key,
  }).promise();

  const info = await Sharp(s3Object.Body).metadata();
  let parsedWidth = w && parseInt(w);
  if (info.width <= parsedWidth) {
    parsedWidth = info.width;
  }
  const width = parsedWidth && Math.min(parsedWidth, 1024);

  let task = Sharp(s3Object.Body);
  if (width) {
    task = task.resize({ width });
  }
  task = await task.withMetadata().toFormat(format).toBuffer();
  const image = task;

  return image.toString('base64');
}

exports.handler = async (event, context, callback) => {
  const response = event.Records[0].cf.response;
  const request = event.Records[0].cf.request;

  const params = querystring.parse(request.querystring);

  const { w, webp } = params;

  const uri = request.uri;
  console.log(request.uri);
  const [, imageName, extension] = uri.match(/\/(.*)\.(.*)/);

  // no params given -> return original data OR gif
  if (Object.values(params).every(value => !value) || extension === 'gif') {
    callback(null, response);
    return;
  }

  const originalFormat = extension == 'jpg' ? 'jpeg' : extension.toLowerCase();
  const format = webp === '1' ? 'webp' : originalFormat;

  response.headers['content-type'] = [
    {
      key: 'Content-type',
      value: 'image/' + format,
    },
  ];

  if (!response.headers['cache-control']) {
    response.headers['cache-control'] = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=86400',
      },
    ];
  }

  try {
    const originalKey = decodeURI(imageName) + '.' + extension;
    const image = await resize(originalKey, { format, w });
    if (image === null) {
      callback(null, response);
    }

    response.status = 200;
    response.body = image;
    response.bodyEncoding = 'base64';

    return callback(null, response);
  } catch (error) {
    console.log(error);
    return callback(null, response);
  }
};
