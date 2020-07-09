const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
const { userModel } = require('../../model/userModel');
const { couponModel } = require('../../model/admin/couponModel');
const jwt = require('jsonwebtoken');

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
  ctx.body = commons.jsonBack(1, {
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
  }, "获取数据成功");
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
