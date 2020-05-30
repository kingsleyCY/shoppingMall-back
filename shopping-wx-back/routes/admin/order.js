const router = require('koa-router')();
const { orderModel } = require('../../model/admin/orderModel');

/* 查询订单 */
/*
* param: page、pageSize
* opparam：userId、orderStatus
* orderId、createStime、createEtime、orderStime、orderEtime、totalFeeMin、totalFeeMax、phone
* */
router.post('/orderList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  let search = {}
  param.userId ? search.userId = param.userId : "";
  param.orderStatus ? search.orderStatus = param.orderStatus : "";
  param.orderId ? search.orderId = param.orderId : "";
  param.createStime && param.createEtime ? search.created_time = {
    $gte: param.createStime,
    $lte: param.createEtime
  } : "";
  param.totalFeeMin && param.totalFeeMax ? search.total_fee = {
    $gte: Number(param.totalFeeMin) * 100,
    $lte: Number(param.totalFeeMax) * 100
  } : "";
  param.phone ? search['userDetail.phoneNumber'] = param.phone : "";
  console.log(search);

  const list = await orderModel.find(search).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 });
  var total = await orderModel.find(search);
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
})

/* 创建订单 */
/* param: userId、price
 * */
router.post('/creatOrder', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId', 'price'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  param.created_time = Date.parse(new Date());
  param.update_time = Date.parse(new Date());
  var item = await orderModel.create(param)
  ctx.body = commons.jsonBack(1, item, "");
})

/* 确认提交订单给商家 undeliver => deliver */
/* param: out_trade_no
 * */
router.post('/checkOrderToBus', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  if (orderItem.orderStatus !== "undeliver") {
    ctx.throw(200, commons.jsonBack(1003, {}, "当前订单不是待发货状态"))
  }
  var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
    orderStatus: "deliver",
  }, { new: true });
  if (!orderItems) {
    ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
  } else {
    ctx.body = commons.jsonBack(1, orderItems, "录入数据成功");
  }
})

/* 订单录入快递号 deliver => delivered */
/* param: out_trade_no、mailOrder、mailRemark
 * */
router.post('/setMail', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no', "mailOrder", "mailRemark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  if (orderItem.orderStatus !== "deliver" && orderItem.orderStatus !== "delivered") {
    ctx.throw(200, commons.jsonBack(1003, {}, "当前订单不是发货状态"))
  }
  var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
    mailOrder: param.mailOrder,
    mailRemark: param.mailRemark,
    orderStatus: "delivered",
  }, { new: true });
  if (!orderItems) {
    ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
  } else {
    ctx.body = commons.jsonBack(1, orderItems, "录入数据成功");
  }
})


module.exports = router