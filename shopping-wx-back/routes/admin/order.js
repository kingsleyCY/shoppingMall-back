const router = require('koa-router')()
const { orderModel } = require('../../model/admin/orderModel');

/* 创建订单 */
/* param: userId、price
 * */
router.post('/creatOrder', async (ctx) => {
  var param = ctx.request.body;
  console.log(param);
  if (!commons.judgeParamExists(['userId', 'price'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  param.created_time = Date.parse(new Date());
  param.update_time = Date.parse(new Date());
  var item = await orderModel.create(param)
  ctx.body = commons.jsonBack(1, item, "");
})


module.exports = router