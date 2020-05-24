const router = require('koa-router')()
const https = require('https');
const qs = require('querystring');
const { userModel } = require('../../model/userModel');
const { shoppingModel } = require('../../model/commodityModel');
const { orderModel } = require('../../model/admin/orderModel');
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
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
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
* param：userId、commodityId
* */
router.post("/payment", async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body))
  if (!commons.judgeParamExists(['code', 'iv', 'encryptedData'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  }
  const userItem = await userModel.findOne({ userId: param.userId });
  const commodItem = await shoppingModel.findOne({ id: param.commodityId });
  const money = commodItem.overPrice;
  const appid = commons.wx_appid;
  const openid = userItem.openId;
  const orderId = commons.generateId();
  const mch_id = commons.mchid;
  const mchkey = commons.mchkey;
  const nonce_str = commons.createNonceStr();
  const timestamp = commons.createTimeStamp();
  const body = '测试微信支付';
  const attach = commons.raw({
    commodityId: commodItem.id,
    userId: userItem.userId
  });
  const out_trade_no = commons.setOrderCode();
  const total_fee = commons.getmoney(money);
  const spbill_create_ip = "119.3.77.140"; //服务器IP
  const notify_url = commons.wxurl; // 回传地址
  const trade_type = 'JSAPI';  // 'APP';公众号：'JSAPI'或'NATIVE'
  const sign = commons.paysignjsapi(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, mchkey, attach);
  console.log('sign==', sign);

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
            console.log(errors);
            reject("")
          }
          console.log(response.xml.return_msg.text());
          console.log('长度===', response.xml.prepay_id.text().length);
          var prepay_id = response.xml.prepay_id.text();
          console.log('解析后的prepay_id==', prepay_id);
          resolve(prepay_id)
        });
      } else {
        console.log(err);
        reject("")
      }
    });
  })
  if (prepay_id) {
//将预支付订单和其他信息一起签名后返回给前端
    let package = "prepay_id=" + prepay_id;
    let signType = "MD5";
    let minisign = commons.paysignjsapimini(appid, nonce_str, package, signType, timestamp, mchkey);
    ctx.body = commons.jsonBack(1, {
      'appId': appid,
      'partnerId': mch_id,
      'prepayId': prepay_id,
      'nonceStr': nonce_str,
      'timeStamp': timestamp,
      'package': 'Sign=WXPay',
      'paySign': minisign
    }, "请求支付成功！");
  }

})

/* 支付成功回调 */
router.post("/paymentBack", async (ctx) => {
  const xml = ctx.request.body.xml;
  console.log(xml);
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
    const commodityId = qs.parse(xml.attach[0]).commodityId
    const userId = qs.parse(xml.attach[0]).userId
    const commodItem = await shoppingModel.findOne({ id: commodityId });
    const userDetail = await userModel.findOne({ userId: userId });
    var orderItem = {
      created_time: Date.parse(new Date()),
      out_trade_no: xml.out_trade_no[0],
      transaction_id: xml.transaction_id[0],
      time_end: xml.time_end[0],
      total_fee: xml.total_fee[0],
      commodityId: commodityId,
      userId: userId,
      commodityDetail: commodItem,
      userDetail: userDetail,
    }
    var orderItems = await orderModel.create(orderItem);
    ctx.body = successXml
  }
})

module.exports = router
