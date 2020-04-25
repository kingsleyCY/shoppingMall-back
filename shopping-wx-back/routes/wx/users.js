const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
var baseConfig = require('../../common/baseConfig');
const userModel = require('../../model/userModel');
const jwt = require('jsonwebtoken');
const jwtScret = "jwt-token"

/* 绑定用户获取openID */
/*
* params:
* code: 小程序登录时获取的 code
*
* */
router.post('/bindUserInfo', async (ctx) => {
  var content = qs.stringify({
    appid: baseConfig.wx_appid,
    secret: baseConfig.wx_secret,
    js_code: ctx.request.body.code,
    grant_type: 'authorization_code'
  });
  const options = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
  let openid = await new Promise((resolve, reject) => {
    https.get(options, (result) => {
      result.setEncoding('utf8');
      result.on('data', (d) => {
        resolve(JSON.parse(d).openid);
      });
    }).on('error', (e) => {
      reject("")
    });
  })
  if (openid) {
    let param = {
      userId: commons.generateId(),
      created_time: Date.parse(new Date()),
      weUserInfo: ctx.request.body.weUserInfo || {},
      openId: openid,
      recommendId: ctx.request.body.recommendId || ""
    }
    let oldUser = await userModel.findUser({ openId: openid })
    if (!oldUser) {
      let newUser = await userModel.creatUser(param)
      const token = jwt.sign({
        openId: openid,
        userId: newUser.userId
      }, jwtScret, { expiresIn: "240h" });
      ctx.set("toekn", token);
      ctx.body = commons.jsonBack(1, newUser, "");
    } else {
      const token = jwt.sign({
        openId: openid,
        userId: oldUser.userId
      }, jwtScret, { expiresIn: "240h" });
      ctx.set("toekn", token);
      ctx.body = commons.jsonBack(1, oldUser, "该用户已绑定");
    }
  } else {
    ctx.body = commons.jsonBack(1004, {}, "获取OpenID失败！");
  }
})

module.exports = router
