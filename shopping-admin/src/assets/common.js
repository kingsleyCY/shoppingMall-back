var appData = require('../data.json')//加载本地数据文件

class baseCommon {
  constructor() {
    this.orderStatusArr = [
      {
        label: "待支付",
        value: "unpaid"
      },
      {
        label: "已支付成功",
        value: "paid"
      },
      {
        label: "已支付失败",
        value: "paiderror"
      },
      {
        label: "待发货-未提交",
        value: "undeliver"
      },
      {
        label: "待发货-已提交",
        value: "deliver"
      },
      {
        label: "已发货",
        value: "delivered"
      },
      {
        label: "已完成",
        value: "over"
      },
      {
        label: "已退款成功",
        value: "refund"
      },
      {
        label: "退款失败",
        value: "unrefund"
      },
      {
        label: "取消订单（未付款）",
        value: "canceled"
      },
      {
        label: "申请售后",
        value: "applyAfter"
      }
    ];
    for (let key in appData) {
      this[key] = appData[key]
    }
  }
  /* 时间戳转换成时间格式 */
  timeTransfer(data, arr) {
    if (!data) {
      return "--"
    }
    function add0(m) {
      return m < 10 ? '0' + m : m
    }
    var time = new Date(data);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    if (arr) {
      return [y, Number(add0(m)), Number(add0(d)), Number(add0(h)), Number(add0(mm)), Number(add0(s))]
    } else {
      return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
    }
  }
  computedStatus(type) {
    var item = this.orderStatusArr.filter(v => {
      return type === v.value
    })[0]
    if (item) {
      return item.label
    } else {
      return ""
    }
  }
  addExtensionn(qrCode, phoneNumber) {
    let relativeSrc = qrCode.replace("http://lioncc.oss-cn-beijing.aliyuncs.com/", "");
    relativeSrc += "?x-oss-process=image/resize,P_30";
    relativeSrc = new Buffer(relativeSrc).toString('base64');
    relativeSrc = relativeSrc.replace(/\//g, "_");
    relativeSrc = relativeSrc.replace(/\+/g, "-");

    let relativeNum = phoneNumber;
    relativeNum = new Buffer(relativeNum).toString('base64');
    relativeNum = relativeNum.replace(/\//g, "_");
    relativeNum = relativeNum.replace(/\+/g, "-");

    let src = ("https://lioncc.oss-cn-beijing.aliyuncs.com/shop/config/extension.png?x-oss-process=image/watermark,image_" + relativeSrc + ",g_sw,x_150,y_240/watermark,text_" + relativeNum + ",color_000000,size_18,g_sw,x_2,y_5")
    return src
  }
}
module.exports = new baseCommon()