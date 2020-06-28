const router = require('koa-router')();
const { userModel } = require('../../model/userModel');
const { shoppingModel } = require('../../model/commodityModel');
const { orderModel } = require('../../model/admin/orderModel');
const { couponModel } = require('../../model/admin/couponModel');
const addressModel = require('../../model/addressModel');
const request = require('request');
const xmlreader = require("xmlreader");

/* 支付 */
/*
* param：userId、out_trade_no（无此参数毕传commodityId、size、addressId）
* params: mess、couponId
* */
router.post("/payment", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  var orderItem = null
  if (param.out_trade_no) {
    if (!commons.judgeParamExists(['out_trade_no', 'userId'], param)) {
      ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
    }
    orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no, userId: param.userId });
    if (!orderItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此订单"))
    }
  } else {
    if (!commons.judgeParamExists(['userId', 'commodityId', 'size', 'addressId'], param)) {
      ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
    }
  }

  const userItem = await userModel.findOne({ userId: param.userId });
  const commodItem = await shoppingModel.findOne({ id: orderItem ? orderItem.commodityId : param.commodityId });
  const addressItem = await addressModel.model.findOne({ id: param.addressId || orderItem.addressId });
  if (!userItem || !commodItem || !addressItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "传递参数查询数据失败"))
  }
  var money = commodItem.overPrice;
  // 判断优惠券可用性
  const nowDate = Date.parse(new Date());
  const couponId = orderItem ? orderItem.couponId : param.couponId;
  if (couponId) {
    const couponItem = await couponModel.findOne({ _id: mongoose.Types.ObjectId(couponId) });
    if (!couponItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此优惠券信息"));
    }
    // 优惠券时间限制判断
    if (couponItem.timeRange && couponItem.timeRange.sTime && couponItem.timeRange.eTime) {
      if (nowDate < couponItem.timeRange.sTime) {
        ctx.throw(200, commons.jsonBack(1003, {}, "该优惠券未到使用时间"));
      } else if (nowDate > couponItem.timeRange.eTime) {
        ctx.throw(200, commons.jsonBack(1003, {}, "该优惠券已过期"));
      }
    }
    // 判断优惠券合法性
    var couponList = JSON.parse(JSON.stringify(userItem.couponList));
    if (couponList.indexOf(couponId) >= 0) {
      if (couponItem.useType === 1) {
        if (money >= couponItem.fullDecre.fullFee) {
          money = commons.subtract(money, couponItem.fullDecre.decre);
          // 删除该用户指定优惠券可用性
          couponList.splice(couponList.indexOf(couponId), 1);
          await userModel.findOneAndUpdate({ userId: param.userId }, { couponList });
          logger.error("删除用户优惠券成功：" + userModel.phoneNumber + "," + couponItem.title)
        }
      }
    } else if (orderItem) {
      if (money >= couponItem.fullDecre.fullFee) {
        money = commons.subtract(money, couponItem.fullDecre.decre);
      }
    } else {
      ctx.throw(200, commons.jsonBack(1003, {}, "该用户无此优惠券"));
    }
  }

  logger.error("获取支付订单信息：价格=" + money + ", 手机号=" + userItem.phoneNumber)
  // 计算微信参数
  const original_fee = commodItem.overPrice;
  const appid = commons.wx_appid;
  const openid = userItem.openId;
  const mch_id = commons.mchid;
  const mchkey = commons.mchkey;
  const nonce_str = commons.createNonceStr();
  const timestamp = commons.createTimeStamp();
  const body = '测试微信支付';
  const out_trade_no = orderItem ? orderItem.out_trade_no : commons.setOrderCode(); // 商户订单
  const attach = out_trade_no;
  const total_fee = commons.getmoney(money);
  const spbill_create_ip = commons.spbill_create_ip; // 服务器IP
  const notify_url = commons.wxurl; // 回传地址
  const trade_type = 'JSAPI';  // 'APP';公众号：'JSAPI'或'NATIVE'
  const sign = commons.paysignjsapi(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, mchkey, attach);

  //组装xml数据
  var formData = "<xml>";
  formData += "<appid>" + appid + "</appid>";  //appid
  formData += "<body><![CDATA[" + "测试微信支付" + "]]></body>";
  formData += "<mch_id>" + mch_id + "</mch_id>";  //商户号
  formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串，不长于32位。
  formData += "<notify_url>" + notify_url + "</notify_url>";
  formData += "<openid>" + openid + "</openid>";
  formData += "<attach>" + attach + "</attach>";
  formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>";
  formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>";
  formData += "<total_fee>" + total_fee + "</total_fee>";
  formData += "<trade_type>" + trade_type + "</trade_type>";
  formData += "<sign>" + sign + "</sign>";
  formData += "</xml>";

  const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

  var prepay_id = await new Promise((resolve, reject) => {
    request({ url: url, method: 'POST', body: formData }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        xmlreader.read(body.toString("utf-8"), function (errors, response) {
          if (null !== errors) {
            logger.error(errors);
            reject("")
          }
          var prepay_id = response.xml.prepay_id.text();
          resolve(prepay_id)
        });
      } else {
        logger.error(err);
        reject("")
      }
    });
  })
  if (prepay_id) {
//将预支付订单和其他信息一起签名后返回给前端
    let package = "prepay_id=" + prepay_id;
    let signType = "MD5";
    let minisign = commons.paysignjsapimini(appid, nonce_str, package, signType, timestamp, mchkey);
    const unpidData = {
      appId: appid,
      partnerId: mch_id,
      prepayId: prepay_id,
      nonceStr: nonce_str,
      timeStamp: timestamp,
      package: 'Sign=WXPay',
      paySign: minisign
    }
    if (orderItem) {
      var orderObj = {
        total_fee,
        original_fee,
        sign,
        addressId: addressItem.id,
        addressDetail: addressItem,
        mess: param.mess || orderItem.mess,
        size: param.size || orderItem.size,
      }
      await orderModel.findOneAndUpdate({
        out_trade_no: param.out_trade_no,
        userId: param.userId
      }, orderObj, { new: true });
      await commons.pushOrderStatusLog(param.out_trade_no, "none", "unpaid", {
        total_fee,
        original_fee,
        size: param.size || orderItem.size,
        addressId: addressItem.id,
        created_time: Date.parse(new Date()),
      })
    } else {
      var newOrderItem = {
        created_time: Date.parse(new Date()),
        out_trade_no,
        total_fee,
        original_fee,
        couponId,
        sign,
        commodityId: commodItem.id,
        userId: userItem.userId,
        addressId: addressItem.id,
        // commodityDetail: commodItem,
        // userDetail: userItem,
        // addressDetail: addressItem,
        orderStatus: "unpaid",
        mess: param.mess || (orderItem && orderItem.mess) || "",
        size: param.size || (orderItem && orderItem.size) || ""
      }
      await orderModel.create(newOrderItem);
      await commons.pushOrderStatusLog(out_trade_no, "none", "unpaid", {
        total_fee,
        original_fee,
        size: param.size || (orderItem && orderItem.size) || "",
        addressId: addressItem.id,
        created_time: Date.parse(new Date()),
      })
    }
    ctx.body = commons.jsonBack(1, unpidData, "请求支付参数成功！");
  }
})

/* 支付成功回调 */
/* unpaid => undeliver */
router.post("/paymentBack", async (ctx) => {
  const xml = ctx.request.body.xml;
  /*var a = {
    appid: ['wx406339775ba0e0fd'],
    attach: ['1'],
    bank_type: ['OTHERS'],
    cash_fee: ['1'],
    fee_type: ['CNY'],
    is_subscribe: ['N'],
    mch_id: ['1593690681'],
    nonce_str: ['kh1wnh11h5k'],
    openid: ['oJ0-n5F_OsfiHYxBFq6k-5oR0xI8'],
    out_trade_no: ['4861420008k1590309450l6641178517'],
    result_code: ['SUCCESS'],
    return_code: ['SUCCESS'],
    sign: ['7C0F4F5DC55047C4923AAFF806F7DCF9'],
    time_end: ['20200524163737'],
    total_fee: ['1'],
    trade_type: ['JSAPI'],
    transaction_id: ['4200000562202005246914701329']
  }*/
  const successXml = "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
  if (xml.result_code[0] === 'SUCCESS') {
    var obj = {
      transaction_id: xml.transaction_id[0],
      time_end: xml.time_end[0],
      orderStatus: "undeliver",
      // orderStatus: "paid",
    }
    const out_trade_no = xml.attach[0];
    var orderItem = await orderModel.findOneAndUpdate({ out_trade_no }, obj, { new: true });
    await commons.pushOrderStatusLog(out_trade_no, "unpaid", "undeliver", {
      created_time: Date.parse(new Date()),
    })
    if (orderItem) {
      await shoppingModel.findOneAndUpdate({
        id: orderItem.commodityId
      }, { $inc: { saleNum: 1 } }, { new: true });
    }
    ctx.body = successXml
  } else {
    var obj = {
      orderStatus: "paiderror"
    }
    const out_trade_no = xml.attach[0];
    var orderItem = await orderModel.findOneAndUpdate({ out_trade_no }, obj, { new: true });
  }
})

/* 取消订单 */
/*
*param：out_trade_no、userId
* */
router.post("/applyRefound", async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['out_trade_no', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no, userId: param.userId })
  if (!orderItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到订单"))
  }
  if (orderItem.orderStatus === "unpaid") {
    await orderModel.findOneAndUpdate({ out_trade_no: param.out_trade_no }, { orderStatus: "canceled" }, { new: true });
    await commons.pushOrderStatusLog(param.out_trade_no, "unpaid", "canceled", {
      created_time: Date.parse(new Date()),
    })
    ctx.body = commons.jsonBack(1, {}, "取消订单成功！");
  } else if (orderItem.orderStatus === "undeliver") {
    var res = await commons.applyRefound(param.out_trade_no, param.userId, "测试退款")
    if (typeof res === "string") {
      ctx.body = commons.jsonBack(1003, {}, res);
    } else {
      if (res.out_refund_no) {
        await commons.pushOrderStatusLog(param.out_trade_no, "undeliver", "refund", {
          created_time: Date.parse(new Date()),
        })
        ctx.body = commons.jsonBack(1, {}, "退款成功！");
      } else {
        ctx.body = commons.jsonBack(1003, {}, "退款失败！");
      }
    }
  } else {
    ctx.body = commons.jsonBack(1003, {}, "该状态下无法退款！");
  }
})

/* 退款成功回调 */
router.post("/applyRefoundBack", async (ctx) => {
  const xml = ctx.request.body.xml;
  var param = ctx.request.body
  console.log(xml);
  console.log(param);
  ctx.body = {}
})

/* 获取不同状态订单 */
/*
* param：status、userId、page、pageSize
* status: unpaid、undeliver、delivered、over
* */
router.post("/getOrderList", async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['status', 'userId', 'page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var statusList = []
  if (param.status === "unpaid") {
    statusList = ["unpaid"]
  } else if (param.status === "undeliver") {
    statusList = ["paid", "undeliver", "deliver"]
  } else if (param.status === "delivered") {
    statusList = ["delivered"]
  } else if (param.status === "over") {
    statusList = ["over", "refund"]
  } else if (param.status === "applyAfter") {
    statusList = ["applyAfter"]
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "订单状态传递错误"))
  }
  var list = await orderModel.find({
    userId: param.userId,
    orderStatus: { $in: statusList }
  }, {
    userDetail: 0,
    unpidData: 0
  }).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 });
  var total = await orderModel.find({ userId: param.userId, orderStatus: { $in: statusList } });
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
      addreDetail = await addressModel.model.findOne({ id: list[i].addressId })
    } else {
      addreDetail = JSON.parse(addreDetail)
    }
    list[i].addressDetail = addreDetail
  }
  ctx.body = commons.jsonBack(1, {
    list: list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "");
})

/* 确认收货 */
/*
* param：out_trade_no、userId
* */
router.post("/sureReceipt", async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['out_trade_no', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var orderItem = await orderModel.findOne({
    userId: param.userId,
    out_trade_no: param.out_trade_no
  })
  if (orderItem && orderItem.orderStatus === "delivered") {
    var userItem = await userModel.findOne({ userId: param.userId });
    // var integral = (userItem.integral || 0) + (orderItem.total_fee / 100);
    var integral = commons.add((userItem.integral || 0), (orderItem.total_fee / 100));
    await userModel.findOneAndUpdate({ userId: orderItem.userId }, { integral }, { new: true })
    var orderItems = await orderModel.findOneAndUpdate({
      userId: param.userId,
      out_trade_no: param.out_trade_no
    }, { orderStatus: "over" }, { new: true });
    await commons.pushOrderStatusLog(param.out_trade_no, "delivered", "over", {
      created_time: Date.parse(new Date()),
    })
    ctx.body = commons.jsonBack(1, orderItems, "");
  } else {
    ctx.body = commons.jsonBack(1003, {}, "该订单状态错误！");
  }
})

module.exports = router
