const router = require('koa-router')();
const { orderModel } = require('../../model/admin/orderModel');

/* 查询订单 */
/*
* param: page、pageSize、id
* */
router.post('/orderList', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['page', 'pageSize', 'id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const list = await orderModel.find({}).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 })
  var total = await orderModel.find({})
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


module.exports = router