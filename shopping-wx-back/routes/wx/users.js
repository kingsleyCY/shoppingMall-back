const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
var baseConfig = require('../../common/baseConfig');
const userModel = require('../../model/userModel');
const jwt = require('jsonwebtoken');

/* 绑定用户获取openID */
/*
* params: code: 小程序登录时获取的 code
* recommendId
*
* */
router.post('/loginWx', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['code'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    var content = qs.stringify({
      appid: commons.wx_appid,
      secret: commons.wx_secret,
      js_code: param.code,
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
      let user = {
        userId: commons.generateId(),
        created_time: Date.parse(new Date()),
        openId: openid,
        recommendId: (param.recommendId || "")
      }
      var oldUser = await userModel.findUser({ openId: openid })
      var userDeatil = null
      if (!oldUser) {
        userDeatil = await userModel.creatUser(user)
      } else {
        userDeatil = oldUser
      }
      const token = jwt.sign({
        openId: openid,
        userId: userDeatil.userId
      }, commons.jwtScret);
      ctx.res.setHeader('authorization', token);
      ctx.body = commons.jsonBack(1, userDeatil, "用户登陆成功！");
    } else {
      ctx.body = commons.jsonBack(1004, {}, "获取OpenID失败！");
    }
  }
})

module.exports = router
