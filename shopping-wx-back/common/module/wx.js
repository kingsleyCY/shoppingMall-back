var WXBizDataCrypt = require('../WXBizDataCrypt');
var xmlreader = require("xmlreader");
const request = require('request');
const path = require('path');
const fs = require("fs");

var wx = {
  /* 解析手机号 */
  decryptData(session_key, iv, encryptedData) {
    var appId = this.wx_appid
    var sessionKey = session_key
    var encryptedData = encryptedData
    var iv = iv

    var pc = new WXBizDataCrypt(appId, sessionKey)

    var data = pc.decryptData(encryptedData, iv)

    console.log('解密后 data: ', data)
    return data.phoneNumber
  },
  //把金额转为分
  getmoney: function (money) {
    return parseFloat(money) * 100;
  },
  // 随机字符串产生函数
  createNonceStr: function () {
    return Math.random().toString(36).substr(2, 15);
  },
  // 时间戳产生函数
  createTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000) + '';
  },
  //签名加密算法
  paysignjsapi: function (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, mchkey, attach) {
    var ret = {
      appid: appid,
      mch_id: mch_id,
      nonce_str: nonce_str,
      body: body,
      notify_url: notify_url,
      openid: openid,
      out_trade_no: out_trade_no,
      spbill_create_ip: spbill_create_ip,
      total_fee: total_fee,
      trade_type: trade_type,
      attach: attach
    };
    var string = this.raw(ret);
    var key = mchkey;
    string = string + '&key=' + key;
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
  },
  // 小程序签名
  paysignjsapimini: function (appId, nonceStr, package, signType, timestamp, mchkey) {
    var ret = {
      appId: appId,
      nonceStr: nonceStr,
      package: package,
      signType: signType,
      timeStamp: timestamp,
    };
    var string = this.raw(ret);
    var key = mchkey;
    string = string + '&key=' + key;
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
  },
  getXMLNodeValue: function (xml) {
    xmlreader.read(xml, function (errors, response) {
      if (null !== errors) {
        console.log(errors)
        return;
      }
      console.log('长度===', response.xml.prepay_id.text().length);
      var prepay_id = response.xml.prepay_id.text();
      console.log('解析后的prepay_id==', prepay_id);
      return prepay_id;
    });
  },
  raw: function (args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
      newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  },
  /* 生成商户订单号 out_trade_no */
  setOrderCode() {
    const en_arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'e', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'w', 'v', 'u', 'x', 'y', 'z']
    let num1 = Math.floor(Math.random() * en_arr.length + 1);
    let num2 = Math.floor(Math.random() * en_arr.length + 1);
    return Math.random().toString().substr(2, 10) + (en_arr[num1] ? en_arr[num1] : 'a') + (new Date()).getTime().toString().substr(0, 10) + (en_arr[num2] ? en_arr[num2] : 'a') + Math.random().toString().substr(2, 10);
  },
  /* 申请退款 */
  async applyRefound(orderId, userId, refundDesc) {
    const { orderModel } = require('../../model/admin/orderModel');
    const orderItem = await orderModel.findOne({ out_trade_no: orderId })
    if (!orderItem) {
      return "未查询到订单"
    } else if (orderItem.orderStatus === "unpaid") {
      return "该订单还未支付"
    }
    const appid = this.wx_appid;
    const mch_id = this.mchid;
    const nonce_str = this.createNonceStr();
    // const sign = orderItem.sign;
    const transaction_id = orderItem.transaction_id; // 微信订单号
    const out_trade_no = orderItem.out_trade_no; // 商户订单号
    const out_refund_no = this.setOrderCode();
    const total_fee = orderItem.total_fee;
    const refund_fee = orderItem.total_fee;
    const refund_desc = refundDesc || "";
    const notify_url = this.wxrefundurl;
    const sign = this.paysignjsapi(appid, mch_id, nonce_str, transaction_id, out_trade_no, out_refund_no, total_fee, refund_fee, refund_desc, notify_url, notify_url);

    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    formData += "<transaction_id>" + transaction_id + "</transaction_id>";
    formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>";
    formData += "<out_refund_no>" + out_refund_no + "</out_refund_no>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<refund_fee>" + refund_fee + "</refund_fee>";
    formData += "<refund_desc>" + refund_desc + "</refund_desc>";
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<sign>" + sign + "</sign>";
    formData += "</xml>";
    const url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';
    var res = await new Promise((resolve, reject) => {
      request({
        url: url,
        method: 'POST',
        body: formData,
        agentOptions: {
          cert: fs.readFileSync(path.join(__dirname, '../../../../WXcert/apiclient_cert.pem')),
          key: fs.readFileSync(path.join(__dirname, '../../../../WXcert/apiclient_key.pem'))
        }
      }, function (err, response, body) {
        console.log("response==" + JSON.stringify(response));
        if (!err && response.statusCode == 200) {
          xmlreader.read(body.toString("utf-8"), function (errors, response) {
            if (null !== errors) {
              console.log("errors==" + errors);
              reject("")
            }
            resolve(response)
          });
        } else {
          console.log("err==" + err);
          reject("")
        }
      });
    })
    return res
  }
}
module.exports = wx