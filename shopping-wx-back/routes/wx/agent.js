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
  // A-用户
  var normalUser = userModel.find({ recommendId: userItem.phoneNumber, agentId: 0 });
  // B-代理
  var childProxyUser = userModel.find({ recommendId: userItem.phoneNumber, agentId: { $ne: 0 } });
  // B-用户
  var childNormalUser = [];
  for (let i = 0; i < childProxyUser.length; i++) {
    let list = await userModel.find({ recommendId: childProxyUser[i].phoneNumber, agentId: 0 });
    childNormalUser = [...childNormalUser, ...list]
  }
  // C-代理
  var grandProxyUser = [];
  for (let i = 0; i < childProxyUser.length; i++) {
    let list = await userModel.find({ recommendId: childProxyUser[i].phoneNumber, agentId: { $ne: 0 } });
    grandProxyUser = [...grandProxyUser, ...list]
  }
  // C-用户
  var grandNormalUser = [];
  for (let i = 0; i < grandProxyUser.length; i++) {
    let list = await userModel.find({ recommendId: grandProxyUser[i].phoneNumber, agentId: 0 });
    grandNormalUser = [...grandNormalUser, ...list]
  }

  var orderListA = [] // A 订单(A-用户 + B-代理下单)
  for (let i = 0; i < normalUser.length; i++) {
    let list = await orderModel.find({ userId: normalUser[i].userId });
    orderListA = [...orderListA, ...list]
  }
  for (let i = 0; i < childProxyUser.length; i++) {
    let list = await orderModel.find({ userId: childProxyUser[i].userId });
    orderListA = [...orderListA, ...list]
  }
  // A-用户 确认订单
  var sureOrderListA = orderListA.filter(v => {
    return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
  })
  // A-用户 取消订单（canceled、refund）
  var cancelOrderListA = orderListA.filter(v => {
    return ['refund', 'canceled'].indexOf(v.orderStatus) >= 0 && v.orderSettlement && v.orderSettlement.isOverOrder
  })


  var orderListB = [] // B 订单(B-用户 + C-代理下单)
  for (let i = 0; i < childNormalUser.length; i++) {
    let list = await orderModel.find({ userId: childNormalUser[i].userId });
    orderListB = [...orderListB, ...list]
  }
  for (let i = 0; i < grandProxyUser.length; i++) {
    let list = await orderModel.find({ userId: grandProxyUser[i].userId });
    orderListB = [...orderListB, ...list]
  }
  // B-用户 确认订单
  var sureOrderListB = orderListB.filter(v => {
    return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
  })


  var obj = {
    agentLevel: 1, // 代理级别
    orderTotal: orderListA.length, // 下单数
    sureOrderTotal: sureOrderListA.length, // 确认订单数
    cancelOrderTotal: cancelOrderListA.length, // 取消订单数
    selfExtract: 0, // 可提取金额

    selfNormal: normalUser.length, // 代理用户数
    childProxy: childProxyUser.length, // 下级代理数
    childNormal: childNormalUser.length, // 下级代理用户数
    childOrderTotal: sureOrderListB.length, // 下级代理完成订单数
    grandProxy: grandProxyUser.length, // 下下级代理数
    grandNormal: grandNormalUser.length, // 下下级代理用户数
    grandOrderTotal: 100, // 下下级代理完成订单数
    childExtract: 0, // 下级可提取金额
    extensionNum: 0, // 推广人数
    type: "proxy", // proxy、extension
    setting: true,
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
