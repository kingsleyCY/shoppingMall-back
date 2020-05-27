const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
const { userModel } = require('../../model/userModel');
const { shoppingModel } = require('../../model/commodityModel');
const { orderModel } = require('../../model/admin/orderModel');
const addressModel = require('../../model/addressModel');
const jwt = require('jsonwebtoken');
const request = require('request');
const xmlreader = require("xmlreader");

/* 绑定用户获取openID */
/*
* params: code: 小程序登录时获取的 code、iv、encryptedData
* recommendId
*
* */
router.post('/loginWx', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['code', 'iv', 'encryptedData'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    var content = qs.stringify({
      appid: commons.wx_appid,
      secret: commons.wx_secret,
      js_code: param.code,
      grant_type: 'authorization_code'
    });
    const options = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
    let { openid, session_key } = await new Promise((resolve, reject) => {
      https.get(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
          console.log(JSON.parse(d));
          resolve({
            openid: JSON.parse(d).openid,
            session_key: JSON.parse(d).session_key
          });
        });
      }).on('error', (e) => {
        reject("")
      });
    })
    if (openid && session_key) {
      const phoneNumber = commons.decryptData(session_key, param.iv, param.encryptedData)
      let user = {
        userId: commons.generateId(),
        created_time: Date.parse(new Date()),
        openId: openid,
        phoneNumber: phoneNumber,
        recommendId: (param.recommendId || "")
      }
      var oldUser = await userModel.findOne({ openId: openid, phoneNumber })
      var userDeatil = null
      if (!oldUser) {
        userDeatil = await userModel.create(user)
      } else {
        userDeatil = oldUser
      }
      const token = jwt.sign({
        openId: openid,
        phoneNumber: phoneNumber,
        userId: userDeatil.userId
      }, commons.jwtScret);
      ctx.res.setHeader('Authorization', token);
      ctx.body = commons.jsonBack(1, userDeatil, "用户登陆成功！");
    } else {
      ctx.body = commons.jsonBack(1004, {}, "获取OpenID失败！");
    }
  }
})

/* 支付 */
/*
* param：userId、commodityId、size、addressId
* params: mess
* */
router.post("/payment", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body))
  if (!commons.judgeParamExists(['userId', 'commodityId', 'size', 'addressId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const userItem = await userModel.findOne({ userId: param.userId });
  const commodItem = await shoppingModel.findOne({ id: param.commodityId });
  const addressItem = await addressModel.model.findOne({ id: param.addressId });
  if (!userItem || !commodItem || !addressItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "传递参数查询数据失败"))
  }
  const money = commodItem.overPrice;
  const appid = commons.wx_appid;
  const openid = userItem.openId;
  const mch_id = commons.mchid;
  const mchkey = commons.mchkey;
  const nonce_str = commons.createNonceStr();
  const timestamp = commons.createTimeStamp();
  const body = '测试微信支付';
  const out_trade_no = commons.setOrderCode(); // 商户订单
  const attach = out_trade_no;
  const total_fee = commons.getmoney(money);
  const spbill_create_ip = "119.3.77.140"; // 服务器IP
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
    var orderItem = {
      created_time: Date.parse(new Date()),
      out_trade_no,
      total_fee,
      sign,
      commodityId: commodItem.id,
      userId: userItem.userId,
      addressId: addressItem.id,
      commodityDetail: commodItem,
      userDetail: userItem,
      addressDetail: addressItem,
      orderStatus: "unpaid",
      mess: param.mess || "",
      size: param.size || "",
      unpidData
    }
    await orderModel.create(orderItem);
    ctx.body = commons.jsonBack(1, unpidData, "请求支付参数成功！");
  }

})

/* 支付未付款订单 */
/*
* param：out_trade_no、userId
* */
router.post("/paymentOrder", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body))
  if (!commons.judgeParamExists(['out_trade_no', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const orderItem = await orderModel.findOne({ out_trade_no: param.out_trade_no, userId: param.userId });
  if (orderItem) {
    const userItem = await userModel.findOne({ userId: param.userId });
    const appid = commons.wx_appid;
    const openid = userItem.openId;
    const mch_id = commons.mchid;
    const mchkey = commons.mchkey;
    const nonce_str = commons.createNonceStr();
    const timestamp = commons.createTimeStamp();
    const body = '测试微信支付';
    const out_trade_no = param.out_trade_no; // 商户订单
    const attach = out_trade_no;
    const total_fee = orderItem.total_fee;
    const spbill_create_ip = "119.3.77.140"; // 服务器IP
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
      var orderObj = {
        out_trade_no,
        total_fee,
        sign,
        unpidData
      }
      await orderModel.findOneAndUpdate({
        out_trade_no: param.out_trade_no,
        userId: param.userId
      }, orderObj, { new: true });
      ctx.body = commons.jsonBack(1, unpidData, "请求支付参数成功！");
    } else {
      logger.error("paymentOrder=>获取prepay_id参数失败")
    }
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "传递参数查询数据失败"))
  }

})

/* 支付成功回调 */
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
    if (orderItem) {
      var userItem = userModel.findOne({ userId: orderItem.userId });
      var integral = (userItem.integral || 0) + orderItem.total_fee / 100;
      await userModel.findOneAndUpdate({ userId: orderItem.userId }, { integral }, { new: true })
      logger.error(orderItem.commodityId);
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

/* 取消订单/退款 */
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
  var res = await commons.applyRefound(param.out_trade_no, param.userId, "测试退款")
  if (typeof res === "string") {
    ctx.body = commons.jsonBack(1003, {}, res);
  } else {
    if (res.out_refund_no) {
      ctx.body = commons.jsonBack(1, {}, "退款成功！");
    } else {
      ctx.body = commons.jsonBack(1003, {}, "退款失败！");
    }
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
* param：status、userId
* */
router.post("/getOrderList", async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['status', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var list = await orderModel.find({ userId: param.userId, orderStatus: param.status }).sort({ "_id": -1 })
  ctx.body = commons.jsonBack(1, list, "");
})


module.exports = router
