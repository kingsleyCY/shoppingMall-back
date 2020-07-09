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
    commons.logger("content", content)
    const options = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
    var { openid, session_key } = await new Promise((resolve, reject) => {
      https.get(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
          commons.logger("d-", d)
          resolve({
            openid: JSON.parse(d).openid,
            session_key: JSON.parse(d).session_key
          });
        });
      }).on('error', (e) => {
        commons.logger("e-", e)
        reject("")
      });
    })
    commons.logger("openid", openid)
    commons.logger("session_key", session_key)
    if (openid && session_key) {
      const phoneNumber = commons.decryptData(session_key, param.iv, param.encryptedData)
      commons.logger("phoneNumber", phoneNumber)
      let user = {
        userId: commons.generateIds(),
        created_time: Date.parse(new Date()),
        openId: openid,
        phoneNumber: phoneNumber,
        // recommendId: (param.recommendId || "")
      }
      var oldUser = await userModel.findOne({ openId: openid, phoneNumber })
      var userDeatil = null
      if (!oldUser) {
        if (param.recommendId) {
          user.recommendId = await setRecommend(param.recommendId)
        }
        userDeatil = await userModel.create(user)
      } else {
        userDeatil = oldUser
      }
      /*const token = jwt.sign({
        openId: openid,
        phoneNumber: phoneNumber,
        userId: userDeatil.userId
      }, commons.jwtScret);
      ctx.res.setHeader('Authorization', token);*/
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
    commons.setUserData(param.userId)
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
  commons.setUserData(param.userId)
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
  couponItem = JSON.parse(JSON.stringify(couponItem))
  if (!couponItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此优惠券信息!"))
  }
  var bindUserItem = await userModel.findOne({
    couponList: { "$elemMatch": { $eq: couponItem._id } }
  });
  if (bindUserItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "此优惠券已绑定用户!"))
  }
  var userItem = await userModel.findOne({ userId: param.userId });
  userItem = JSON.parse(JSON.stringify(userItem))
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户信息!"))
  }
  var couponList = userItem.couponList;
  couponList.push(String(couponItem._id))
  var userItems = await userModel.findOneAndUpdate({ userId: param.userId }, { couponList }, { new: true })

  var usageIds = couponItem.usageIds.concat([userItem.userId]);
  await couponModel.findOneAndUpdate({
    _id: mongoose.Types.ObjectId(couponItem._id),
    lotteryCode: param.code
  }, { usageIds })

  ctx.body = commons.jsonBack(1, userItems, "获取优惠券信息成功！");
  commons.setUserData(param.userId)
})


/* 设置推荐人 代理级别 */
/*
* recommendId => 推荐人手机号
* phoneNumber => 用户手机号
* */
async function setRecommend(recommendId) {
  var recommenUser = await userModel.findOne({ phoneNumber: recommendId });
  if (!recommenUser) {
    return ""
  }
  return recommenUser.phoneNumber
}


module.exports = router
