// var commons = require('./common/baseCommon');
var mongoose = require('mongoose');
var redis = require("redis");
var client = redis.createClient(8002, '127.0.0.1', {});
client.auth('12345', function () {
  // console.log('通过认证');
});
/* 连接redis */
client.on('connect', function () {
  console.log('Redis client connected');
});
client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});
/* 连接Mongo */
var mongooseIP = "mongodb://127.0.0.1:8001/shoppingMall"
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
  console.log('connected success');
});

global.mongoose = mongoose
global.db = db
global.client = client