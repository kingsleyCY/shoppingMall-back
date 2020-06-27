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
    applyAfterDetail.returnGoods = {
      mailOrder: "",
      mailRemark: ""
    }
  } else if (param.applyType === 2) {
    applyAfterDetail.exchangeGoods = {
      mailOrder: "",
      mailRemark: "",
      manuMail: "",
      manuMailRemark: "",
    }
  }
  var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
    applyAfterDetail,
    orderStatus: "applyAfter",
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

/* 申请售后-退/换货录入客户物流信息 */
/*
* param：out_trade_no、mailOrder、mailRemark
* */
router.post('/setMail', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no', "mailOrder", "mailRemark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  } else if (orderItem.orderStatus !== "applyAfter") {
    ctx.throw(200, commons.jsonBack(1003, {}, "该订单现无法录入客户物流信息！"))
  }
  if (orderItem.applyAfterDetail) {
    if (orderItem.applyAfterDetail.applyType === 1) {
      var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
        "applyAfterDetail.returnGoods.mailOrder": param.mailOrder,
        "applyAfterDetail.returnGoods.mailRemark": param.mailRemark
      }, { new: true });
    } else if (orderItem.applyAfterDetail.applyType === 2) {
      var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
        "applyAfterDetail.exchangeGoods.mailOrder": param.mailOrder,
        "applyAfterDetail.exchangeGoods.mailRemark": param.mailRemark
      }, { new: true });
    }
    console.log(orderItems);
    if (!orderItems) {
      ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
    } else {
      await commons.pushOrderStatusLog(param.out_trade_no, "applyAfter", "applyAfter", {
        created_time: Date.parse(new Date()),
        applyType: orderItem.applyAfterDetail.applyType,
        mailOrder: param.mailOrder,
        mailRemark: param.mailRemark,
      })
      ctx.body = commons.jsonBack(1, orderItems, "录入售后物流信息成功！");
    }
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "该订单未申请售后"))
  }
})

/* 申请售后-退货厂商确认收货并退款 */
/*
* param：out_trade_no、remark
* */
router.post('/applyRefound', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no', "remark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  if (orderItem && (orderItem.orderStatus === "applyAfter" || orderItem.orderStatus === "unrefund") && orderItem.applyAfterDetail && orderItem.applyAfterDetail.applyType === 1) {
    var res = await commons.applyRefound(param.out_trade_no, orderItem.userId, "测试退款", 15);
    if (typeof res === "string") {
      ctx.body = commons.jsonBack(1003, {}, res);
    } else {
      if (res.out_refund_no) {
        await commons.pushOrderStatusLog(param.out_trade_no, orderItem.orderStatus, "refund", {
          created_time: Date.parse(new Date()),
          remark: param.remark
        })
        ctx.body = commons.jsonBack(1, {}, "退款成功！");
      } else {
        await commons.pushOrderStatusLog(param.out_trade_no, "applyAfter", "unrefund", {
          created_time: Date.parse(new Date()),
          remark: param.remark,
          refundDes: res
        })
        ctx.body = commons.jsonBack(1003, {}, "退款失败！");
      }
    }
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "该订单状态无法退款！"))
  }
})

/* 申请售后-换货录入新的厂商物流信息 */
/*
* param：out_trade_no、mailOrder、mailRemark
* */
router.post('/setExchangeMail', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no', "mailOrder", "mailRemark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  if (orderItem && orderItem.orderStatus === "applyAfter" && orderItem.applyAfterDetail && orderItem.applyAfterDetail.applyType === 2) {
    var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
      "applyAfterDetail.exchangeGoods.manuMail": param.mailOrder,
      "applyAfterDetail.exchangeGoods.manuMailRemark": param.mailRemark
    }, { new: true });
    if (!orderItems) {
      ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
    } else {
      await commons.pushOrderStatusLog(param.out_trade_no, "applyAfter", "applyAfter", {
        created_time: Date.parse(new Date()),
        manuMail: param.manuMail,
        manuMailRemark: param.manuMailRemark
      })
      ctx.body = commons.jsonBack(1, orderItems, "录入售后物流信息成功！");
    }
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "该订单状态无法录入换货物流信息！"))
  }
})

/* 完成订单-（售后） */
/*
* param：out_trade_no、remark
* */
router.post('/overOrder', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['out_trade_no', "remark"], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  if (
    (orderItem.orderStatus === "refund" && orderItem.applyAfterDetail.applyType === 1) ||
    (orderItem.orderStatus === "applyAfter" && orderItem.applyAfterDetail.applyType === 2 && orderItem.applyAfterDetail.exchangeGoods && orderItem.applyAfterDetail.exchangeGoods.manuMail)
  ) {
    var orderItems = await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, {
      orderStatus: "over"
    }, { new: true });
    if (!orderItems) {
      ctx.body = commons.jsonBack(1003, {}, "更新数据失败！");
    } else {
      await commons.pushOrderStatusLog(param.out_trade_no, orderItem.orderStatus, "over", {
        created_time: Date.parse(new Date()),
        applyType: orderItem.applyAfterDetail.applyType,
        remark: param.applyType,
      })
      ctx.body = commons.jsonBack(1, orderItems, "完成订单成功！");
    }
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "该订单状态无法修改为已完成！"))
  }
})


module.exports = router