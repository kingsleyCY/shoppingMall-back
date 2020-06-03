const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
const { userModel } = require('../../model/userModel');
const { couponModel } = require('../../model/admin/couponModel');
const jwt = require('jsonwebtoken');

/* 绑定用户获取openID */
/*
* params: code: 小程序登录时获取的 code、iv、encryptedData
* recommendId
*
* */
router.post('/loginWx', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['code', 'iv', 'encryptedData'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    var content = qs.stringify({
      appid: commons.wx_appid,
      secret: commons.wx_secret,
      js_code: param.code,
      grant_type: 'authorization_code'
    });
    const options = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
    let { openid, session_key } = await new Promise((resolve, reject) => {
      https.get(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
          console.log(JSON.parse(d));
          resolve({
            openid: JSON.parse(d).openid,
            session_key: JSON.parse(d).session_key
          });
        });
      }).on('error', (e) => {
        reject("")
      });
    })
    if (openid && session_key) {
      const phoneNumber = commons.decryptData(session_key, param.iv, param.encryptedData)
      let user = {
        userId: commons.generateId(),
        created_time: Date.parse(new Date()),
        openId: openid,
        phoneNumber: phoneNumber,
        recommendId: (param.recommendId || "")
      }
      var oldUser = await userModel.findOne({ openId: openid, phoneNumber })
      var userDeatil = null
      if (!oldUser) {
        userDeatil = await userModel.create(user)
      } else {
        userDeatil = oldUser
      }
      const token = jwt.sign({
        openId: openid,
        phoneNumber: phoneNumber,
        userId: userDeatil.userId
      }, commons.jwtScret);
      ctx.res.setHeader('Authorization', token);
      ctx.body = commons.jsonBack(1, userDeatil, "用户登陆成功！");
    } else {
      ctx.body = commons.jsonBack(1004, {}, "获取OpenID失败！");
    }
  }
})

/* 同步用户信息 */
/*
* param: userId
* params：wxUserInfo
* */
router.post("/getUserInfo", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var wxUserInfo = param.wxUserInfo;
  var userItem = {}
  if (wxUserInfo) {
    userItem = await userModel.findOneAndUpdate({ userId: param.userId }, { wxUserInfo }, { new: true })
  } else {
    userItem = await userModel.findOne({ userId: param.userId })
  }
  if (userItem) {
    ctx.body = commons.jsonBack(1, userItem, "同步用户信息成功！");
  } else {
    ctx.body = commons.jsonBack(1003, {}, "未查询到此用户信息！");
  }
})

/* 获取用户可用优惠券信息 */
/*
* parama：userId
* */
router.post("/getCounponList", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var userItem = await userModel.findOne({ userId: param.userId })
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户信息!"))
  }
  var counponList = await couponModel.find({ _id: { $in: userItem.couponList } });

  ctx.body = commons.jsonBack(1, counponList, "获取优惠券信息成功！");
})

/* 用户传递code 绑定优惠券 */
/*
* parama：userId、code
* */
router.post("/bindCouponByCode", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId', 'code'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var couponItem = await couponModel.findOne({ lotteryCode: param.code })
  if (!couponItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此优惠券信息!"))
  }
  var bindUserItem = await userModel.findOne({
    couponList: { "$elemMatch": { $eq: couponItem._id } }
  });
  if (bindUserItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "此优惠券已绑定用户!"))
  }
  var userItem = await userModel.findOne({ userId: param.userId })
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户信息!"))
  }
  var couponList = JSON.parse(JSON.stringify(userItem)).couponList;
  couponList.push(couponItem._id)
  var userItems = await userModel.findOneAndUpdate({ userId: param.userId }, { couponList }, { new: true })

  ctx.body = commons.jsonBack(1, userItems, "获取优惠券信息成功！");
})


module.exports = router
