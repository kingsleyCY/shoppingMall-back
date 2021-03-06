var WXBizDataCrypt = require('../WXBizDataCrypt');
var xmlreader = require("xmlreader");
const request = require('request');
const path = require('path');
const fs = require("fs");

var wx = {
  /* 解析手机号 */
  decryptData(session_key, i_v, encrypted_Data) {
    var appId = this.wx_appid
    var sessionKey = session_key
    var encryptedData = encrypted_Data
    var iv = i_v
    commons.logger("wx_appid", this.wx_appid)
    commons.logger("sessionKey", sessionKey)
    commons.logger("iv", iv)
    commons.logger("encryptedData", encryptedData)

    var pc = new WXBizDataCrypt(appId, sessionKey)
    commons.logger("WXBizDataCrypt", WXBizDataCrypt)
    commons.logger("pc", JSON.stringify(pc))

    var data = pc.decryptData(encryptedData, iv)

    this.logger("解密后 data: -", data)
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
  // 签名加密算法
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
  // 退单签名加密算法
  refundSignjsapi: function (mchkey, appid, mch_id, nonce_str, out_trade_no, out_refund_no, total_fee, refund_fee, refund_desc) {
    var ret = {
      appid,
      mch_id,
      nonce_str,
      out_trade_no,
      out_refund_no,
      total_fee,
      refund_fee,
      refund_desc
    };
    console.log(ret);
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
  getXMLNodeValue: function (node_name, xml) {
    let tmp = xml.split("<" + node_name + ">");
    if (tmp[1] != undefined) {
      let _tmp = tmp[1].split("</" + node_name + ">");
      let tmp1 = _tmp[0].split('[');
      if (!tmp1[2]) {
        return null
      }
      let _tmp1 = tmp1[2].split(']');
      return _tmp1[0];
    }
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
  /* 申请退款 */
  async applyRefound(orderId, userId, refundDesc, reduce_fee) {
    let that = this;
    const { orderModel } = require('../../model/admin/orderModel');
    const orderItem = await orderModel.findOne({ out_trade_no: orderId, userId: userId })
    if (!orderItem) {
      return "未查询到订单"
    } else if (orderItem.orderStatus === "unpaid") {
      return "该订单还未支付"
    }
    const appid = this.wx_appid;
    const mch_id = this.mchid;
    const mchkey = this.mchkey; // 不需要XML传递
    const nonce_str = this.createNonceStr();
    // const transaction_id = orderItem.transaction_id; // 微信订单号
    const out_trade_no = orderItem.out_trade_no; // 商户订单号
    const out_refund_no = commons.generateIds(); // 退单号
    const total_fee = orderItem.total_fee; // 交易金额
    var reduce_fee = reduce_fee || 0;
    reduce_fee = reduce_fee * 100;
    if (reduce_fee >= total_fee) {
      // return "减少运费金额小于总金额！"
      reduce_fee = 0
    }
    const refund_fee = orderItem.total_fee - reduce_fee;
    const refund_desc = refundDesc || "测试退单";
    // const notify_url = this.wxrefundurl;
    const sign = this.refundSignjsapi(mchkey, appid, mch_id, nonce_str, out_trade_no, out_refund_no, total_fee, refund_fee, refund_desc);

    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    // formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>";
    formData += "<out_refund_no>" + out_refund_no + "</out_refund_no>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<refund_fee>" + refund_fee + "</refund_fee>";
    formData += "<refund_desc>" + refund_desc + "</refund_desc>";
    formData += "<sign>" + sign + "</sign>";
    formData += "</xml>";
    const url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';
    await orderModel.findOneAndUpdate({ out_trade_no: orderId, userId: userId }, { out_refund_no }, { new: true })
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
        logger.error(response.body.toString('utf-8'));
        let return_code = that.getXMLNodeValue('return_code', response.body.toString('utf-8'));
        let return_msg = that.getXMLNodeValue('return_msg', response.body.toString('utf-8'));
        let err_code_des = that.getXMLNodeValue('err_code_des', response.body.toString('utf-8'));
        if (return_code == 'SUCCESS' && return_msg == 'OK' && err_code_des == undefined) {
          resolve({
            total_fee: that.getXMLNodeValue('total_fee', response.body.toString('utf-8')),
            refund_fee: that.getXMLNodeValue('refund_fee', response.body.toString('utf-8')),
            out_trade_no: that.getXMLNodeValue('out_trade_no', response.body.toString('utf-8')),
            out_refund_no: that.getXMLNodeValue('out_refund_no', response.body.toString('utf-8'))
          })
        } else {
          resolve(err_code_des + return_msg)
        }
      });
    })
    var orderStatus = ""
    if (res.out_refund_no) {
      if (orderItem.orderStatus === "applyAfter") {
        orderStatus = "applyAfter"
      } else {
        orderStatus = "refund"
      }
    } else {
      orderStatus = "unrefund"
    }
    var obj = {
      refoundData: res,
      orderStatus
    }
    orderItem.orderStatus === "applyAfter" && orderItem.applyAfterStatus === "backing" ? obj.applyAfterStatus = "refund" : "";
    await orderModel.findOneAndUpdate({ out_trade_no: orderId, userId: userId }, obj, { new: true })
    return res
  },
  /* 添加订单状态变化日志 */
  async pushOrderStatusLog(out_trade_no, from, to, obj) {
    const that = this
    const { orderLogModel } = require('../../model/admin/orderLogModel');
    var orderItem = await orderLogModel.findOne({ out_trade_no });
    var fromItem = that.orderStatusArr.filter(v => {
      return v.value === from
    })[0]
    var toItem = that.orderStatusArr.filter(v => {
      return v.value === to
    })[0]
    if (orderItem) {
      orderItem = JSON.parse(JSON.stringify(orderItem));
      var orderLog = orderItem.orderLog;
      orderLog.push({
        from,
        to,
        fromZh: fromItem ? fromItem.label : "--",
        toZh: toItem ? toItem.label : "--",
        detail: obj,
      });
      await orderLogModel.findOneAndUpdate({ out_trade_no }, { orderLog })
    } else {
      await orderLogModel.create({
        out_trade_no: out_trade_no,
        orderLog: [{
          from,
          to,
          fromZh: fromItem ? fromItem.label : "--",
          toZh: toItem ? toItem.label : "--",
          detail: obj,
        }]
      })
    }
  },
  /* 修改订单 orderSettlement */
  async changeOrderIntegral(orderItem) {
    var order = JSON.parse(JSON.stringify(orderItem))
    if (!order.orderSettlement || !order.orderSettlement.isIntegral) {
      const { userModel } = require('../../model/userModel');
      const { orderModel } = require('../../model/admin/orderModel');
      var userItem = await userModel.findOne({ userId: order.userId });
      if (userItem) {
        var integral = this.add((userItem.integral || 0), (order.total_fee / 100));
        await userModel.findOneAndUpdate({ userId: order.userId }, { integral }, { new: true })
        await orderModel.findOneAndUpdate({
          userId: order.userId,
          out_trade_no: order.out_trade_no
        }, { "orderSettlement.isIntegral": true, "orderSettlement.isOverOrder": true })
      }
    }
  }
}
module.exports = wx