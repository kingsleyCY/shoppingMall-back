/* admin端主要接口 */
const qs = require('querystring');
const url = require('url');
const https = require('https');
const baseConfig = require('../../common/baseConfig');
const router = require('koa-router')();
const jwt = require('jsonwebtoken');
const md5 = require("md5");
const { userModel } = require('../../model/userModel');
const { orderModel } = require('../../model/admin/orderModel');
const { agentModel } = require('../../model/admin/agentModel');

/* 登录 admin */
/*
* param： username、password
* */
router.post('/loginAdmin', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['username', 'password'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (md5(param.username) === "37ebf12861702553bb42b113beb671e9" && md5(param.password) === "ed788dc3b3f5a35aac92a493f48bcf53") {
    const token = jwt.sign({
        username: md5(param.username),
        password: md5(param.password),
      }, commons.jwtScret, { expiresIn: '3h' }
    )
    ctx.body = commons.jsonBack(1, { token }, "登录成功！");
  } else {
    ctx.body = commons.jsonBack(1003, {}, "登录失败，账号密码错误");
  }
})

/* 获取用户列表 */
/*
* param: listType: null => 全部  proxy=>代理列表  recommend=> 指定代理人下的列表(id)
* extension=>推广 extensioned=>指定推广人下的列表
* opparam: page, pageSize, phoneNumber
* */
router.post('/getCustomer', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var params = {
    page: param.page,
    pageSize: param.pageSize
  }
  let obj = {}
  if (param.listType === "proxy") {
    obj.agentId = { $ne: 0 }
  } else if (param.listType === "recommend") {
    var userItem = await userModel.findOne({ userId: param.id })
    obj.recommendId = userItem.phoneNumber
  } else if (param.listType === "extension") {
    obj.extenId = 1
  } else if (param.listType === "extensioned") {
    var userItem = await userModel.findOne({ userId: param.id })
    obj.recommendId = userItem.phoneNumber
  } else {
    // ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.listType === "extension" || param.listType === "extensioned") {
    let userlist = await userModel.find(obj).sort({ '_id': -1 });
    userlist = JSON.parse(JSON.stringify(userlist));
    let list = [];
    userlist.forEach(v => {
      let item = userlist.filter(vs => {
        return vs.created_time === v.created_time
      });
      if (item.length === 1) {
        list.unshift(v)
      }
    })
    /*let list = [];
    userlist.forEach(v => {
      let item = list.filter(vs => {
        return vs.created_time === v.created_time
      })[0];
      if (!item) {
        list.unshift(v)
      }
    })*/

    ctx.body = commons.jsonBack(1, {
      list,
      total: list.length
    }, "获取数据成功");
  } else {
    if (param.phoneNumber) {
      const reg = new RegExp(param.phoneNumber, 'i') //不区分大小写
      obj['$or'] = [
        { phoneNumber: { '$regex': reg } }
      ]
    }
    const list = await userModel.find(obj).skip((params.page - 1) * params.pageSize).limit(Number(params.pageSize)).sort({ '_id': -1 })
    const total = await userModel.find(obj)
    ctx.body = commons.jsonBack(1, {
      list,
      total: total.length,
      page: param.page,
      pageSize: param.pageSize,
    }, "获取数据成功");
  }
})

/* 生成代理人二维码 */
/*
* param:id type(1代理、2推广)
* */
router.post('/setQrcode', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id', 'type'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"));
  }
  var userItem = await userModel.findOne({ userId: param.id })
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户"));
  }
  if (userItem.agentId || userItem.extenId) {
    ctx.throw(200, commons.jsonBack(1003, {}, "该用户非普通用户"));
  }
  var access_token = await getAccesstoken();
  var qrCode = await setQrcode(access_token.access_token, userItem.phoneNumber);
  var obj = { qrCode: qrCode.url }
  if (param.type === 1) {
    var agentId = 1;
    if (userItem.recommendId) {
      var parentUser = await userModel.findOne({ phoneNumber: userItem.recommendId })
      agentId = parentUser.agentId + 1;
    }
    obj.agentId = agentId;
    obj.proxy_time = Date.parse(new Date());
  } else if (param.type === 2) {
    obj.extenId = 1;
    obj.exten_time = Date.parse(new Date());
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"));
  }
  await userModel.findOneAndUpdate({ userId: param.id }, obj, { new: true });
  ctx.body = commons.jsonBack(1, { url: qrCode.url }, "获取数据成功");
})

/* 查看代理人下订单 */
/*
* param:userId
* */
router.post('/getProxyOrder', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var userItem = await userModel.findOne({ userId: param.userId })
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户"))
  }
  if (userItem.agentId) {
    // A-用户
    var normalUser = await userModel.find({ recommendId: userItem.phoneNumber, agentId: 0 });
    // B-代理
    var childProxyUser = await userModel.find({ recommendId: userItem.phoneNumber, agentId: { $ne: 0 } });
    // B-用户
    var childNormalUser = [];
    for (let i = 0; i < childProxyUser.length; i++) {
      let list = await userModel.find({ recommendId: childProxyUser[i].phoneNumber, agentId: 0 });
      childNormalUser = [...childNormalUser, ...list]
    }
    // C-代理
    var grandProxyUser = [];
    for (let i = 0; i < childProxyUser.length; i++) {
      let list = await userModel.find({ recommendId: childProxyUser[i].phoneNumber, agentId: { $ne: 0 } });
      grandProxyUser = [...grandProxyUser, ...list]
    }
    // C-用户
    var grandNormalUser = [];
    for (let i = 0; i < grandProxyUser.length; i++) {
      let list = await userModel.find({ recommendId: grandProxyUser[i].phoneNumber, agentId: 0 });
      grandNormalUser = [...grandNormalUser, ...list]
    }
    // D-代理
    var grandChildProxyUser = [];
    for (let i = 0; i < grandProxyUser.length; i++) {
      let list = await userModel.find({ recommendId: grandProxyUser[i].phoneNumber, agentId: { $ne: 0 } });
      grandChildProxyUser = [...grandChildProxyUser, ...list]
    }

    var orderListA = [] // A 订单(A-用户 + B-代理下单)
    for (let i = 0; i < normalUser.length; i++) {
      let list = await orderModel.find({ userId: normalUser[i].userId });
      orderListA = [...orderListA, ...list]
    }
    for (let i = 0; i < childProxyUser.length; i++) {
      let list = await orderModel.find({ userId: childProxyUser[i].userId });
      orderListA = [...orderListA, ...list]
    }
    // A-用户 确认订单
    var sureOrderListA = orderListA.filter(v => {
      return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
    })
    // A-用户 取消订单（canceled、refund）
    var cancelOrderListA = orderListA.filter(v => {
      return ['refund', 'canceled'].indexOf(v.orderStatus) >= 0 && v.orderSettlement && v.orderSettlement.isOverOrder
    })

    var orderListB = [] // B 订单(B-用户 + C-代理下单)
    for (let i = 0; i < childNormalUser.length; i++) {
      let list = await orderModel.find({ userId: childNormalUser[i].userId });
      orderListB = [...orderListB, ...list]
    }
    for (let i = 0; i < grandProxyUser.length; i++) {
      let list = await orderModel.find({ userId: grandProxyUser[i].userId });
      orderListB = [...orderListB, ...list]
    }
    // B 确认订单
    var sureOrderListB = orderListB.filter(v => {
      return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
    })

    var orderListC = [] // C 订单(C-用户 + D-代理下单)
    for (let i = 0; i < grandNormalUser.length; i++) {
      let list = await orderModel.find({ userId: grandNormalUser[i].userId });
      orderListC = [...orderListC, ...list]
    }
    for (let i = 0; i < grandChildProxyUser.length; i++) {
      let list = await orderModel.find({ userId: grandChildProxyUser[i].userId });
      orderListC = [...orderListC, ...list]
    }
    // C 确认订单
    var sureOrderListC = orderListC.filter(v => {
      return v.orderStatus === "over" && v.orderSettlement && v.orderSettlement.isOverOrder
    })
    var agentList = JSON.parse(JSON.stringify(await agentModel.find().sort({ sort: -1 })));
    var agentId = userItem.agentId;
    agentId > 3 ? agentId = 3 : "";
    const agentItem = agentList[agentId - 1];
    var agentLevel = 1;
    var agentModelData = null;
    var childProfit = agentItem.childProfit;
    for (let i = 0; i < agentItem.agentModelData.length; i++) {
      if (sureOrderListA.length >= agentItem.agentModelData[i].min && sureOrderListA.length < agentItem.agentModelData[i].max) {
        agentLevel = (i + 1);
        agentModelData = agentItem.agentModelData[i];
        break;
      }
    }
    var selfExtract = sureOrderListA.length * agentModelData.price;
    var childExtract = (childProfit[0] * sureOrderListB) + (childProfit[1] * sureOrderListC)


    var obj = {
      agentLevel: agentLevel, // 代理级别
      sureOrderListA: sureOrderListA, // 确认订单数
      sureOrderListB: sureOrderListB, // 下级代理完成订单数
      sureOrderListC: sureOrderListC, // 下下级代理完成订单数
    }
    ctx.body = commons.jsonBack(1, obj, "获取数据成功");
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "此用户不是代理"))
  }
})

/* 获取代理列表 */
/*
* param: phoneNumber、agentLevel 0全部 1自己 2子集 3孙集、agentType 1=代理 2=用户
* */
router.post('/getProxy', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['phoneNumber', 'agentLevel', 'agentType'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误1"))
  }
  const userItem = JSON.parse(JSON.stringify(await userModel.findOne({ phoneNumber: param.phoneNumber })))
  if (!userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户"))
  }
  var list = await getchildUser(userItem, param.agentLevel, param.agentType);
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
})

/* 修改用户备注 */
/*
* param: userId、mark
* */
router.post('/setMark', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId', 'mark'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  let userItem = await userModel.findOneAndUpdate({ userId: param.userId }, { mark: param.mark }, { new: true });

  ctx.body = commons.jsonBack(1, userItem, "获取数据成功");
})

async function getAccesstoken() {
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

async function setQrcode(token, scene) {
  const post_data = JSON.stringify({
    scene: String(scene),
  });
  let options = url.parse(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`);
  options = Object.assign(options, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
        const imgBuffer = Buffer.from(resData, 'binary');
        var fileName = 'shop/proxylist/' + (Date.parse(new Date()) / 1000) + '-' + scene + '.jpg'
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

async function getchildUser(userItem, agentLevel, agentType) {
  /*
    agentLevel 0全部 1自己 2子集 3孙集、
    agentType 1=代理 2=用户
  */
  var userList = JSON.parse(JSON.stringify(await userModel.find({}, {
    userId: 1,
    created_time: 1,
    recommendId: 1,
    phoneNumber: 1,
    agentId: 1,
  }).sort({ '_id': -1 })));
  var phoneNumber = userItem.phoneNumber;
  var list = []
  if ((agentLevel === 1 || agentLevel === 0) && agentType === 2) { // A的用户
    list = userList.filter(v => {
      return (v.recommendId === phoneNumber) && (v.agentId === 0)
    })
  }
  if (agentLevel === 0 || agentLevel === 2 || agentLevel === 3) {
    var childProxyList = userList.filter(v => {
      return (v.recommendId === phoneNumber) && (v.agentId !== 0)
    })
    if (agentLevel === 0 || agentLevel === 2) { // B
      if (agentType === 1) { // B代理
        list = [...list, ...childProxyList]
      } else { // B的用户
        for (let i = 0; i < childProxyList.length; i++) {
          let childNormalList = userList.filter(v => {
            return (v.recommendId === childProxyList[i].phoneNumber) && (v.agentId === 0)
          })
          list = [...list, ...childNormalList]
        }
      }
    }
    if (agentLevel === 0 || agentLevel === 3) { // C
      for (let i = 0; i < childProxyList.length; i++) {
        let grandProxyList = userList.filter(v => {
          return (v.recommendId === childProxyList[i].phoneNumber) && (v.agentId !== 0)
        })
        for (let j = 0; j < grandProxyList.length; j++) {
          if (agentType === 1) { // C代理
            list = [...list, ...grandProxyList]
          } else { // C的用户
            let grandNormaList = userList.filter(v => {
              return v.recommendId === grandProxyList[j].phoneNumber && v.agentId === 0
            })
            list = [...list, ...grandNormaList]
          }
        }
      }
    }
  }
  return list
}


module.exports = router