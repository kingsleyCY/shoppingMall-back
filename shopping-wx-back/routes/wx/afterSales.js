const router = require('koa-router')();
const { orderModel } = require('../../model/admin/orderModel');

/* 申请售后 */
/*
* param：out_trade_no、applyType、applyRemark
* */
router.post('/applyAfter', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no', "applyType", "applyRemark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  } else if (orderItem.orderStatus !== "delivered" && orderItem.orderStatus !== "over") {
    ctx.throw(200, commons.jsonBack(1003, {}, "该订单现无法申请售后！"))
  }
  if (param.applyType !== 1 && param.applyType !== 2) {
    ctx.throw(200, commons.jsonBack(1003, {}, "申请售后状态错误！"))
  }

  var applyAfterDetail = {
    applyType: param.applyType,
    applyRemark: param.applyRemark,
  }
  if (param.applyType === 1) {
    applyAfterDetail.returnGoods = {}
  } else if (param.applyType === 2) {
    applyAfterDetail.exchangeGoods = {}
  }
  var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
    applyAfterDetail,
    orderStatus: "applyAfter",
    applyAfterStatus: "applying"
  }, { new: true });
  if (!orderItems) {
    ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
  } else {
    await commons.pushOrderStatusLog(param.out_trade_no, orderItem.orderStatus, "applyAfter", {
      created_time: Date.parse(new Date()),
      applyType: param.applyType,
      applyRemark: param.applyRemark,
    })
    ctx.body = commons.jsonBack(1, orderItems, "申请售后成功！");
  }
})

module.exports = router