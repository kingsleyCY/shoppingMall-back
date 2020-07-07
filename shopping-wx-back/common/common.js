var fs = require("fs");
const schedule = require("node-schedule");
const { v1 } = require("uuid");

var localData = fs.readFileSync("./common/data.json", 'utf-8');
var reg = new RegExp(/\/\*(.|\r\n)*\*\//, "g")
localData = JSON.parse(localData.replace(reg, ""))

var wx = require("./module/wx");
var redis = require("./module/redis");
var floatObj = require("./module/floatObj");

class baseCommon {
  constructor() {
    for (let key in localData) {
      this[key] = localData[key]
    }
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
    ]
    this.sizeArr = [35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5, 40, 40.5, 41, 41.5, 42, 42.5, 43, 43.5, 44, 44.5, 45, 45.5, 46, 46.5, 47]
  }
  jsonBack(code, date, mess) {
    return {
      code: code,
      data: date,
      mess: mess
    }
  }
  /* 生成随机ID */
  generateIds() {
    return v1();
  }
  /* 生成活动码 */
  activityCode() {
    const en_arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'e', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'w', 'v', 'u', 'x', 'y', 'z']
    let num1 = Math.floor(Math.random() * en_arr.length + 1);
    let num2 = Math.floor(Math.random() * en_arr.length + 1);
    let num3 = Math.floor(Math.random() * en_arr.length + 1);
    let num4 = Math.floor(Math.random() * en_arr.length + 1);
    let num5 = Math.floor(Math.random() * en_arr.length + 1);
    let num6 = Math.floor(Math.random() * en_arr.length + 1);
    let num7 = Math.floor(Math.random() * en_arr.length + 1);
    let num8 = Math.floor(Math.random() * en_arr.length + 1);
    return (en_arr[num1] ? en_arr[num1] : 'a') + (en_arr[num2] ? en_arr[num2] : 'a') + (en_arr[num3] ? en_arr[num3] : 'a') + (en_arr[num4] ? en_arr[num4] : 'a') + (new Date()).getTime().toString().substr(0, 10) + (en_arr[num5] ? en_arr[num5] : 'a') + (en_arr[num6] ? en_arr[num6] : 'a') + (en_arr[num7] ? en_arr[num7] : 'a') + (en_arr[num8] ? en_arr[num8] : 'a')
  }
  /* 生成订单号 */
  random_No() {
    var randomLen = 6
    var random_no = "";
    for (var i = 0; i < randomLen; i++) {
      random_no += Math.floor(Math.random() * 10);
    }
    random_no = new Date().getTime().toString(16) + random_no;
    return random_no;
  }
  /* 判断参数存在性 */
  judgeParamExists(arr, body) {
    let flag = true
    for (let i = 0; i < arr.length; i++) {
      if (typeof body[arr[i]] === "undefined") {
        flag = false
      }
      if (Array.isArray(body[arr[i]]) && body[arr[i]].length === 0) {
        flag = false
      }
    }
    return flag
  }
  /* 删除对象指定key */
  deleteKey(obj, arr) {
    let newObj = JSON.parse(JSON.stringify(obj))
    for (let i = 0; i < arr.length; i++) {
      delete newObj[arr[i]]
    }
    return newObj
  }
  async getAccesstoken() {
    var content = qs.stringify({
      appid: commons.wx_appid,
      secret: commons.wx_secret,
      grant_type: 'client_credential'
    });
    const options = 'https://api.weixin.qq.com/cgi-bin/token?' + content;
    let access_token = await new Promise((resolve, reject) => {
      https.get(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
          resolve(JSON.parse(d));
        });
      }).on('error', (e) => {
        reject("")
      });
    })
    return access_token
  }
  async setQrcode(access_token, scene, catalog) {
    const post_data = JSON.stringify({
      scene: String(scene)
    });
    let options = url.parse(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`);
    options = Object.assign(options, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': post_data.length,
      }
    });
    const imgBuffer = await new Promise((resolve, reject) => {
      let req = https.request(options, (res) => {
        let resData = '';
        res.setEncoding("binary");
        res.on('data', data => {
          resData += data;
        });
        res.on('end', () => {
          const imgBuffer = Buffer.from(resData, 'binary')
          var fileName = catalog + (Date.parse(new Date()) / 1000) + '-' + scene + '.jpg';
          ossClient.put(fileName, imgBuffer).then(res => {
            resolve(res)
          })
        });
      });
      req.on('error', (e) => {
        reject("")
      });
      req.write(post_data);
      req.end();
    })
    return imgBuffer
  }
  timeTransfer(data, arr) {
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
  /* 定时任务-活动 */
  async setSchedule() {
    const { activityModel } = require('../model/admin/activityModel');
    const list = await activityModel.find({ isDelete: 0 }).sort({ '_id': -1 });
    for (let i = 0; i < list.length; i++) {
      if (list[i].status === 1) {
        this.createdStartSchedule(list[i])
        this.createdEndSchedule(list[i])
      } else if (list[i].status === 2) {
        this.createdEndSchedule(list[i])
      }
    }
  }
  /* 设置活动开始定时任务 */
  async createdStartSchedule(item) {
    const { activityModel } = require('../model/admin/activityModel');
    if (item.scheduleStartModel) {
      this.repeatSchedule(item.scheduleStartModel)
    }
    var stimeArr = this.timeTransfer(item.sTime, true)
    var sdate = new Date(stimeArr[0], stimeArr[1] - 1, stimeArr[2], stimeArr[3], stimeArr[4], stimeArr[5]);
    var jobId = "start" + item.id;
    schedule.scheduleJob(jobId, sdate, async function () {
      logger.error("定时任务-start：" + jobId);
      var a = await activityModel.findOneAndUpdate({ id: item.id }, {
        update_time: Date.parse(new Date()),
        status: 2
      }, { new: true })
    }, function () {
      console.log("开始执行1。。。");
    });
    await activityModel.findOneAndUpdate({ id: item.id }, {
      status: 1,
      scheduleStartModel: jobId
    })
  }
  /* 设置活动结束定时任务 */
  async createdEndSchedule(item) {
    let that = this
    const { activityModel } = require('../model/admin/activityModel');
    if (item.scheduleEndModel) {
      this.repeatSchedule(item.scheduleEndModel)
    }
    var etimeArr = this.timeTransfer(item.eTime, true)
    var edate = new Date(etimeArr[0], etimeArr[1] - 1, etimeArr[2], etimeArr[3], etimeArr[4], etimeArr[5]);
    var jobId = "end" + item.id;
    schedule.scheduleJob(jobId, edate, async function () {
      logger.error("定时任务-end：" + jobId);
      var actItem = await activityModel.findOneAndUpdate({ id: item.id }, {
        update_time: Date.parse(new Date()),
        status: 3
      })
      that.setActivityCode(actItem.id)
    }, function () {
      console.log("结束执行1。。。");
    });
    await activityModel.findOneAndUpdate({ id: item.id }, {
      scheduleEndModel: jobId
    })
  }
  /* 删除定时任务 */
  repeatSchedule(str) {
    schedule.scheduledJobs[str] ? schedule.scheduledJobs[str].cancel() : ""
  }
  /* 结束活动，生成抽奖码 */
  async setActivityCode(id) {
    let that = this
    const { userModel } = require('../model/userModel');
    const { activityModel } = require('../model/admin/activityModel');
    const end_time = Date.parse(new Date());
    var endCode = "";
    // var actItem = await activityModel.findOne({ id });
    var userList = await userModel.find();
    var winUser = null;
    function getwinUser() {
      endCode = that.activityCode()
      for (let i = 0; i < userList.length; i++) {
        if (
          userList[i].activityList &&
          userList[i].activityList[id] &&
          userList[i].activityList[id].code &&
          userList[i].activityList[id].joinStatus &&
          userList[i].activityList[id].code === endCode
        ) {
          winUser = userList[i];
          break;
        }
      }
      if (winUser) {
        getwinUser();
      }
    }
    getwinUser();
    console.log(endCode);
    var actItems = await activityModel.findOneAndUpdate({ id }, {
      end_time,
      endCode,
      winUerId: winUser ? winUser.userId : "",
      status: 3
    }, { new: true });
  }
  /* 排序商品列表 */
  sortList(sortBy, sortType) {
    var key = "_id"
    switch (sortBy) {
      case "sortIndex":
        key = "sortIndex";
        break;
      case "saleNume":
        key = "saleNum";
        break;
      case "seeNum":
        key = "consultNum";
        break;
      default:
        key = "_id"
    }
    var sortTypeKey = -1 // sequence 由近到远 由大到小
    switch (sortType) {
      case "sequence":
        sortTypeKey = -1;
        break;
      case "reverse":
        sortTypeKey = 1;
        break;
      default:
        sortTypeKey = -1;
    }

    return { [key]: sortTypeKey }
  }
  /* 修改用户数据 */
  async setUserData(userId, obj) {
    const { userModel } = require('../model/userModel');
    let data = {}
    if (!obj) {
      data.lastActTime = Date.parse(new Date())
    } else {
      data = obj;
    }
    await userModel.findOneAndUpdate({ userId }, data)
  }
  /* logger */
  logger(key, val) {
    logger.error(key + "：" + val + "-" + this.timeTransfer(Date.parse(new Date())))
  }
}
for (let key in redis) {
  baseCommon.prototype[key] = redis[key]
}
for (let key in wx) {
  baseCommon.prototype[key] = wx[key]
}
for (let key in floatObj) {
  baseCommon.prototype[key] = floatObj[key]
}

module.exports = new baseCommon()
/* code 说明 */
const codeObj = {
  1: "操作成功",
  1001: "用户未登录绑定",
  1002: "查询数据库失败，无此项",
  1003: "参数错误",
  1004: "请求错误",
  1005: "该操作已执行",
  1006: "token验证失效",
  1009: "服务器响应失败",
}
/* ctx.throw(200, commons.jsonBack(1001, {}, "测试文字")) */