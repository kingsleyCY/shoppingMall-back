const Koa = require('koa')
const app = new Koa()
// const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser');
const KoaXmlBody = require('koa-xml-body');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const { loggers, accessLogger } = require('./logger');
var baseCommon = require('./common/common');
app.use(accessLogger());
global.logger = loggers;

global.commons = baseCommon;

var baseConfig = require('./common/baseConfig');
/* 连接数据库 */
require("./common/connect-database")
const router = require('./routes/index')
const userModel = require('./model/userModel');
const jwt = require('jsonwebtoken');

/* 跨域设置 */
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

// error handler
// onerror(app)
app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 200 && err.message === "OK") {
      ctx.status = 200;
      ctx.body = baseCommon.jsonBack(err.code, err.data, err.mess);
    } else {
      commons.logger("err", err)
      ctx.body = baseCommon.jsonBack(1009, {}, "服务器响应失败");
    }
  });
})

// 中间件对token进行验证
app.use(async (ctx, next) => {
  var param = ctx.method === "GET" ? ctx.query : ctx.request.body;
  var needValidUrl = baseConfig.needValidUrl
  if (needValidUrl.indexOf(ctx.request.path) >= 0) {
    const token = ctx.header.Authorization;
    if (token) {
      try {
        var decoded = jwt.verify(token, commons.jwtScret);
        const user = await userModel.findOne({
          openId: decoded.openId,
          userId: decoded.userId
        })
        if (!user) {
          ctx.throw(200, commons.jsonBack(1006, {}, "token验证失效"))
        } else {
          if (param.userId === decoded.userId) {
            await next();
          } else {
            ctx.body = commons.jsonBack(1006, {}, "当前Token不属于此用户！");
          }
        }
      } catch (err) {
        ctx.throw(200, commons.jsonBack(1006, {}, "token验证失效"))
      }
    } else {
      ctx.throw(200, commons.jsonBack(1006, {}, "参数缺少token"))
    }
  } else if (ctx.url.indexOf("/admin/") === 0 && ctx.url !== "/admin/userList/loginAdmin") {
    try {
      var token = ctx.header.authorization;
      var decoded = jwt.verify(token, commons.jwtScret);
    } catch (err) {
      // commons.logger("err", err);
      if (err.status === 200 && err.message === "OK") {
        ctx.throw(200, commons.jsonBack(err.code, {}, err.mess))
      } else {
        ctx.throw(200, commons.jsonBack(1006, {}, "token验证失效"))
      }
    }
    await next();
  } else {
    await next();
  }
});

app.use(KoaXmlBody());
app.use(bodyparser());
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

/*app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))*/

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(router.routes()).use(router.allowedMethods());

/* 执行定时任务 */
commons.setSchedule()

// error-handling
/*app.on('error', (err, ctx) => {
  console.log(err)
  ctx.body = commons.jsonBack(1, {}, "");
});*/

module.exports = app
