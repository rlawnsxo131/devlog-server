// https://heropy.blog/2019/07/21/resizing-images-cloudfrount-lambda/
// https://medium.com/daangn/lambda-edge%EB%A1%9C-%EA%B5%AC%ED%98%84%ED%95%98%EB%8A%94-on-the-fly-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EB%A6%AC%EC%82%AC%EC%9D%B4%EC%A7%95-f4e5052d49f3

const querystring = require('querystring');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  region: 'ap-northeast-2',
});

const Sharp = require('sharp');
const BUCKET = 'image-devlog.juntae.kim'; // S3 Bucket name

async function resize(key, { format, w }) {
  const s3Object = await S3.getObject({
    Bucket: BUCKET,
    Key: key,
  }).promise();

  const info = await Sharp(s3Object.Body).metadata();
  const parsedWidth = w && parseInt(w);
  if (info.width <= parsedWidth) {
    return null;
  }
  const width = parsedWidth && Math.min(parsedWidth, 10245);

  let task = Sharp(s3Object.Body);
  if (width) {
    task = task.resize({ width });
  }
  task = task.withMetadata().toFormat(format).toBuffer();
  const image = await task;

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
