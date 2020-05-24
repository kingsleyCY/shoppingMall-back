var WXBizDataCrypt = require('../WXBizDataCrypt');
var xmlreader = require("xmlreader");

var wx = {
  /* 解析手机号 */
  decryptData(session_key, iv, encryptedData) {
    var appId = commons.wx_appid
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
  paysignjsapi: function (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, mchkey) {
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
      trade_type: trade_type
    };
    console.log("ret===" + ret);
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
  }
}
module.exports = wx