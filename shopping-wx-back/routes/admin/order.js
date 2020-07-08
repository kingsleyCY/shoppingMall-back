const router = require('koa-router')();
const { orderModel } = require('../../model/admin/orderModel');
const { userModel } = require('../../model/userModel');
const { shoppingModel } = require('../../model/commodityModel');
const { addressModel } = require('../../model/addressModel');

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
  param.orderId ? search.out_trade_no = param.orderId : "";
  param.createStime && param.createEtime ? search.created_time = {
    $gte: param.createStime,
    $lte: param.createEtime
  } : "";
  param.totalFeeMin && param.totalFeeMax ? search.total_fee = {
    $gte: Number(param.totalFeeMin) * 100,
    $lte: Number(param.totalFeeMax) * 100
  } : "";
  param.phone ? search.phoneNumber = param.phone : "";

  var list = await orderModel.find(search).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 });
  var total = await orderModel.find(search);
  list = JSON.parse(JSON.stringify(list));
  // 添加订单对应详情 commodityDetail、userDetail、addressDetail
  for (let i = 0; i < list.length; i++) {
    var detail = await commons.getRedis("shop-" + list[i].commodityId);
    if (!detail) {
      detail = await shoppingModel.findOne({ id: list[i].commodityId })
    } else {
      detail = JSON.parse(detail)
    }
    list[i].commodityDetail = detail
    var addreDetail = await commons.getRedis("addre-" + list[i].addressId);
    if (!addreDetail) {
      addreDetail = await addressModel.findOne({ id: list[i].addressId })
    } else {
      addreDetail = JSON.parse(addreDetail)
    }
    list[i].addressDetail = addreDetail
    var userDetail = await userModel.findOne({ userId: list[i].userId })
    list[i].userDetail = userDetail
  }
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
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
    await commons.pushOrderStatusLog(param.out_trade_no, "undeliver", "deliver", {
      created_time: Date.parse(new Date()),
    })
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
    await commons.pushOrderStatusLog(param.out_trade_no, orderItem.orderStatus, "delivered", {
      created_time: Date.parse(new Date()),
      mailOrder: param.mailOrder,
      mailRemark: param.mailRemark,
    })
    ctx.body = commons.jsonBack(1, orderItems, "录入数据成功");
  }
})

/* 导出对应状态订单 */
/*
* param：orderStatus（isNext）
* */
router.post('/exportOrder', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['orderStatus'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  let exceldata = await orderModel.find({ orderStatus: param.orderStatus }).sort({ '_id': -1 });
  exceldata = JSON.parse(JSON.stringify(exceldata));
  for (let i = 0; i < exceldata.length; i++) {
    var detail = await commons.getRedis("shop-" + exceldata[i].commodityId);
    if (!detail) {
      detail = await shoppingModel.findOne({ id: exceldata[i].commodityId })
    } else {
      detail = JSON.parse(detail)
    }
    exceldata[i].commodityDetail = detail
    var addreDetail = await commons.getRedis("addre-" + exceldata[i].addressId);
    if (!addreDetail) {
      addreDetail = await addressModel.findOne({ id: exceldata[i].addressId })
    } else {
      addreDetail = JSON.parse(addreDetail)
    }
    exceldata[i].addressDetail = addreDetail
    var userDetail = await userModel.findOne({ userId: exceldata[i].userId })
    exceldata[i].userDetail = userDetail
  }
  var list = exceldata.map(v => {
    return {
      created_time: commons.timeTransfer(v.created_time),
      time_end: v.time_end.slice(0, 4) + "-" + v.time_end.slice(4, 6) + "-" + v.time_end.slice(6, 8) + " " + v.time_end.slice(8, 10) + ":" + v.time_end.slice(10, 12) + ":" + v.time_end.slice(12, 14),
      out_trade_no: v.out_trade_no,
      transaction_id: v.transaction_id,
      mess: v.mess,
      size: v.size,
      original_fee: v.original_fee,
      classifyName: v.commodityDetail.classifyName,
      commoditytitle: v.commodityDetail.title,
      addressUserName: v.addressDetail.userName,
      addressPhone: v.addressDetail.telNumber,
      provinceName: v.addressDetail.provinceName,
      cityName: v.addressDetail.cityName,
      countyName: v.addressDetail.countyName,
      detailInfo: v.addressDetail.detailInfo,
      userPhone: v.userDetail.phoneNumber,
      userId: v.userDetail.userId
    }
  })
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
  if (param.orderStatus === "undeliver" && param.isNext) {
    console.log(11111111111);
    exceldata.forEach(async function (v, i) {
      await orderModel.findOneAndUpdate({ out_trade_no: v.out_trade_no }, {
        orderStatus: "deliver",
      }, { new: true });
      await commons.pushOrderStatusLog(v.out_trade_no, "undeliver", "deliver", {
        created_time: Date.parse(new Date()),
      })
    })
  }
})


module.exports = router