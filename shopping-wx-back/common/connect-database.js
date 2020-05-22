// var commons = require('./common/baseCommon');
var ip = "119.3.77.140"
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false)
var redis = require("redis");
var client = redis.createClient(8002, ip, {});
const OSS = require('ali-oss');
client.auth('12345', function () {
  // console.log('通过认证');
});
/* 连接redis */
client.on('connect', function () {
  console.log('Redis client connected');

  /* 配置OSS */
  setOss()
});
client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});
/* 连接Mongo */
var mongooseIP = "mongodb://" + ip + ":8001/shoppingMall"
mongoose.connect(mongooseIP, {
  useNewUrlParser: true,
  useUnifiedTopology: true //这个即是报的警告
});
var db = mongoose.connection;
db.on('error', function () {
  console.log('connect error');
});
db.once('open', function () {
  // we're connected!
  console.log('mongodb connected success');
});

global.mongoose = mongoose
global.db = db
global.client = client

async function setOss() {
  const accessKeyId = commons.accessKeyId;
  const accessKeySecret = commons.accessKeySecret;
  console.log(accessKeyId);
  console.log(accessKeySecret);
  global.ossClient = new OSS({
    region: "oss-cn-beijing",
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: "lioncc",
  })
}