const router = require('koa-router')();
const { orderModel } = require('../../model/admin/orderModel');

/* 查询订单 */
/*
* param: page、pageSize
* opparam：userId
* */
router.post('/orderList', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  let search = {}
  param.userId ? search.userId = param.userId : "";
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
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['userId', 'price'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  param.created_time = Date.parse(new Date());
  param.update_time = Date.parse(new Date());
  var item = await orderModel.create(param)
  ctx.body = commons.jsonBack(1, item, "");
})

/* 订单录入快递号 */
/* param: out_trade_no、mailOrder、mailRemark
 * */
router.post('/setMail', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['out_trade_no', "mailOrder", "mailRemark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  console.log(orderItem);
  if (orderItem.orderStatus !== "undeliver" && orderItem.orderStatus !== "deliver") {
    ctx.throw(200, commons.jsonBack(1003, {}, "当前订单不是发货状态"))
  }
  var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
    mailOrder: param.mailOrder,
    mailRemark: param.mailRemark,
    orderStatus: "deliver",
  }, { new: true });
  if (!orderItems) {
    ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
  } else {
    ctx.body = commons.jsonBack(1, orderItems, "录入数据成功");
  }
})


module.exports = router