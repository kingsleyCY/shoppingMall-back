const router = require('koa-router')();
const { userModel } = require('../../model/userModel');
const { orderModel } = require('../../model/admin/orderModel');
const { agentModel } = require('../../model/admin/agentModel');
const { extractModel } = require('../../model/extractModel');

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
  var obj = {}
  if (userItem.agentId) {
    var agentDate = await getAgentdata(userItem);
    var agentList = JSON.parse(JSON.stringify(await agentModel.find().sort({ sort: -1 })));
    var agentId = userItem.agentId;
    agentId > 3 ? agentId = 3 : "";
    const agentItem = agentList[agentId - 1];
    var agentLevel = 1;
    var agentModelData = null;
    var childProfit = agentItem.childProfit;
    for (let i = 0; i < agentItem.agentModelData.length; i++) {
      if (agentDate.sureOrderListA.length >= agentItem.agentModelData[i].min && agentDate.sureOrderListA.length < agentItem.agentModelData[i].max) {
        agentLevel = (i + 1);
        agentModelData = agentItem.agentModelData[i];
        break;
      }
    }
    var selfExtract = agentDate.sureOrderListA.length * agentModelData.price;
    var childExtract = (childProfit[0] * agentDate.sureOrderListB) + (childProfit[1] * agentDate.sureOrderListC)
    obj = {
      agentLevel: agentLevel, // 代理级别
      orderTotal: agentDate.orderListA.length, // 下单数
      sureOrderTotal: agentDate.sureOrderListA.length, // 确认订单数
      cancelOrderTotal: agentDate.cancelOrderListA.length, // 取消订单数
      selfExtract: selfExtract, // 可提取金额

      selfNormal: agentDate.normalUser.length, // 代理用户数
      childProxy: agentDate.childProxyUser.length, // 下级代理数
      childNormal: agentDate.childNormalUser.length, // 下级代理用户数
      childOrderTotal: agentDate.sureOrderListB.length, // 下级代理完成订单数
      grandProxy: agentDate.grandProxyUser.length, // 下下级代理数
      grandNormal: agentDate.grandNormalUser.length, // 下下级代理用户数
      grandOrderTotal: agentDate.sureOrderListC.length, // 下下级代理完成订单数
      childExtract: childExtract, // 下级可提取金额
      type: "proxy",
      setting: false,
    }
  } else if (userItem.extenId) {
    let userlist = await userModel.find({ recommendId: userItem.phoneNumber });
    /*let extenList = userlist.filter(v => {
      return v.extenId === 1
    });
    let extensionList = [];
    for (let i = 0; i < extenList.length; i++) {
      let childextensionList = await userModel.find({ recommendId: extenList[i].phoneNumber });
      extensionList = [...extensionList, ...childextensionList]
    }*/
    obj = {
      type: "extension",
      extensionNum: userlist.length, // 推广人数
      setting: false,
    }
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "当前用户不是代理或推广"))
  }
  ctx.body = commons.jsonBack(1, obj, "获取数据成功");
})

/* 申请提取金额 */
/*
* params: userId type
*
* */
router.post('/applyExtract', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['userId', 'type'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var userItem = await userModel.findOne({ userId: param.userId })
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户"))
  }
  var userExtractList = await extractModel.find({ userId: param.userId, type: param.type });
  for (let i = 0; i < userExtractList.length; i++) {
    if (userExtractList[i].status === "comfirming") {
      ctx.throw(200, commons.jsonBack(1003, {}, "您已提交申请，等待后天人工审核！"))
    }
  }
  var agentDate = await getAgentdata(userItem);
  var agentList = JSON.parse(JSON.stringify(await agentModel.find().sort({ sort: -1 })));
  var agentId = userItem.agentId;
  agentId > 3 ? agentId = 3 : "";
  const agentItem = agentList[agentId - 1];
  var agentLevel = 1;
  var agentModelData = null;
  var childProfit = agentItem.childProfit;
  for (let i = 0; i < agentItem.agentModelData.length; i++) {
    if (agentDate.sureOrderListA.length >= agentItem.agentModelData[i].min && agentDate.sureOrderListA.length < agentItem.agentModelData[i].max) {
      agentLevel = (i + 1);
      agentModelData = agentItem.agentModelData[i];
      break;
    }
  }
  var extractObj = {
    userId: param.userId,
    id: commons.generateIds(),
    created_time: Date.parse(new Date()),
    type: param.type,
    status: "comfirming",
  }
  if (param.type === 'self') {
    var selfOrderList = agentDate.sureOrderTotal.map(v => {
      return v.out_trade_no
    })
    extractObj.selfOrderList = selfOrderList
    extractObj.agentLevel = agentLevel
    extractObj.agentModelData = agentModelData
  } else if (param.type === 'child') {
    var childOrderList = agentDate.sureOrderListB.map(v => {
      return v.out_trade_no
    })
    var grandOrderList = agentDate.sureOrderListC.map(v => {
      return v.out_trade_no
    })
    extractObj.childOrderList = childOrderList
    extractObj.grandOrderList = grandOrderList
    extractObj.childProfit = childProfit
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var extractItem = await extractModel.create(extractObj)
  ctx.body = commons.jsonBack(1, extractItem, "申请成功!");
})

async function getAgentdata(userItem) {
  // A-用户
  var normalUser = await userModel.find({ recommendId: userItem.phoneNumber, agentId: 0 });
  // B-代理
  var childProxyUser = await userModel.find({ recommendId: userItem.phoneNumber, agentId: { $ne: 0 } });
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
  // D-代理
  var grandChildProxyUser = [];
  for (let i = 0; i < grandProxyUser.length; i++) {
    let list = await userModel.find({ recommendId: grandProxyUser[i].phoneNumber, agentId: { $ne: 0 } });
    grandChildProxyUser = [...grandChildProxyUser, ...list]
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
  // B 确认订单
  var sureOrderListB = orderListB.filter(v => {
    return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
  })

  var orderListC = [] // C 订单(C-用户 + D-代理下单)
  for (let i = 0; i < grandNormalUser.length; i++) {
    let list = await orderModel.find({ userId: grandNormalUser[i].userId });
    orderListC = [...orderListC, ...list]
  }
  for (let i = 0; i < grandChildProxyUser.length; i++) {
    let list = await orderModel.find({ userId: grandChildProxyUser[i].userId });
    orderListC = [...orderListC, ...list]
  }
  // C 确认订单
  var sureOrderListC = orderListC.filter(v => {
    return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
  });

  return {
    normalUser,
    childProxyUser,
    childNormalUser,
    grandProxyUser,
    grandNormalUser,
    grandChildProxyUser,
    orderListA,
    sureOrderListA,
    cancelOrderListA,
    orderListB,
    sureOrderListB,
    orderListC,
    sureOrderListC,
  }
}


module.exports = router
