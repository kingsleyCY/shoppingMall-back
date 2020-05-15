// var commons = require('./common/baseCommon');
var ip = "119.3.77.140"
var mongoose = require('mongoose');
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
  const accessKeyId = await new Promise((resolve, reject) => {
    client.get("accessKeyId", function (err, data) {
      resolve(data);
    })
  })
  const accessKeySecret = await new Promise((resolve, reject) => {
    client.get("accessKeySecret", function (err, data) {
      resolve(data);
    })
  })
  global.ossClient = new OSS({
    region: "oss-cn-beijing",
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: "lioncc",
  })
}