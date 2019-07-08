const Koa = require('koa');
const koaBody = require('koa-body');
const koaRouter = require('koa-router');
const cors = require('@koa/cors');
const aws = require('aws-sdk');
const busboy = require('async-busboy');
const fs = require('fs');
const fileType = require('file-type');

aws.config.update({
  accessKeyId: 'AKIAITVG6JQ6CCPVGXZA',
  secretAccessKey: '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'
});

const router = new koaRouter();
const s3 = new aws.S3();

const uploadFile = async (buffer, name, type) => {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: 'koa-uploader',
    ContentType: type.mime,
    Key: `${name}.${type.ext}`
  };
  return await s3.upload(params).promise();
};

router.post('/upload', async ctx => {
  try {
    const { fields, files } = await busboy(ctx.req);
    const path = files[0].path;
    const buffer = fs.readFileSync(path);
    const type = fileType(buffer);
    const timestamp = Date.now().toString();
    const fileName = `${timestamp}`;
    const { Location } = await uploadFile(buffer, fileName, type);
    ctx.body = { url: Location };
  } catch (err) {
    ctx.body = err.message;
  }
});

const app = new Koa();

app.use(koaBody());
app.use(cors());
app.use(router.routes());
app.listen(3000, () => console.log('LISTENING ON PORT 3000'));
