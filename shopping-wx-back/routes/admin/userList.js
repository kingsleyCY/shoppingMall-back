/* admin端主要接口 */
const qs = require('querystring');
const url = require('url');
const https = require('https');
const baseConfig = require('../../common/baseConfig');
const router = require('koa-router')();
const jwt = require('jsonwebtoken');
const { userModel } = require('../../model/userModel');
const { orderModel } = require('../../model/admin/orderModel');

/* 登录 admin */
/*
* param： username、password
* */
router.post('/loginAdmin', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['username', 'password'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.username === "admin" && param.password === "12345") {
    const token = jwt.sign({
        username: param.username,
        password: param.password,
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
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.listType === "extension" || param.listType === "extensioned") {
    const list = await userModel.find(obj).sort({ '_id': -1 })
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
  if (userItem.agentId !== 0 || userItem.extenId !== 0) {
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
* param:id、page、pageSize
* */
router.post('/getProxyOrder', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id', 'page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var proxyList = await userModel.find({ recommendId: param.id })
  var list = proxyList.map(v => {
    return v.userId
  })
  var orderList = await orderModel.find({ userId: { $in: list } }).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 });
  var total = await orderModel.find({ userId: { $in: list } })
  ctx.body = commons.jsonBack(1, {
    list: orderList,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "");
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