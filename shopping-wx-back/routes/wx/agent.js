const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
const { userModel } = require('../../model/userModel');
const { orderModel } = require('../../model/admin/orderModel');

/* 获取代理数据 */
/*
* params: userId
*
* */
router.post('/getAgentDetail', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var userItem = await userModel.findOne({ userId: param.userId })
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户"))
  }
  var obj = {
    agentLevel: 1, // 代理级别
    orderTotal: 100, // 下单数
    sureOrderTotal: 80, // 确认订单数
    cancelOrderTotal: 20, // 取消订单数
    selfExtract: 500, // 可提取金额

    selfNormal: 20, // 代理用户数
    childProxy: 4, // 下级代理数
    childNormal: 20, // 下级代理用户数
    childOrderTotal: 50, // 下级代理完成订单数
    grandProxy: 10, // 下下级代理数
    grandNormal: 40, // 下级代理用户数
    grandOrderTotal: 100, // 下级代理完成订单数
    childExtract: 500, // 下级可提取金额
    setting: true
  }
  var normalOrderList = [] // A用户
  var childNormalUser = userModel.find({ recommendId: userItem.phoneNumber, agentId: 0 })
  for (let i = 0; i < childNormalUser.length; i++) {
    let list = await orderModel.find({ userId: childNormalUser[i].userId });
    normalOrderList = [...normalOrderList, ...list]
  }


  ctx.body = commons.jsonBack(1, obj, "获取数据成功");
})

/* 申请提取金额 */
/*
* params: userId type
*
* */
router.post('/applyExtract', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['userId', 'type'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  ctx.body = commons.jsonBack(1, {}, "申请成功，");
})


module.exports = router
