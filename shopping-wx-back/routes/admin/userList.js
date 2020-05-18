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
      }, commons.jwtScret, { expiresIn: '1h' }
    )
    ctx.body = commons.jsonBack(1, { token }, "登录成功！");
  } else {
    ctx.body = commons.jsonBack(1003, {}, "登录失败，账号密码错误");
  }
})

/* 获取用户列表 */
/* listType: null => 全部  proxy=>代理列表  recommend=> 指定代理人下的列表 */
router.post('/getCustomer', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  var params = {
    page: param.page,
    pageSize: param.pageSize
  }
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  let obj = {}
  if (param.listType === "proxy") {
    obj.isProxy = 1
  } else if (param.listType === "recommend") {
    obj.recommendId = param.id
  }
  const list = await userModel.find(obj).skip((params.page - 1) * params.pageSize).limit(Number(params.pageSize)).sort({ '_id': -1 })
  var total = await userModel.find(obj)
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
})

/* 生成代理人二维码 */
/*
* param:id
* */
router.post('/setQrcode', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var access_token = await getAccesstoken();
  var qrCode = await setQrcode(access_token.access_token, param.id);
  await userModel.findOneAndUpdate({ userId: param.id }, { qrCode: qrCode.url, isProxy: 1 });
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


module.exports = router