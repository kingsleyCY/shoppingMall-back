/* admin端主要接口 */
const qs = require('querystring');
const url = require('url');
const https = require('https');
const baseConfig = require('../../common/baseConfig');
const router = require('koa-router')();
const { classifyModel } = require('../../model/admin/classifyModel');
const { userModel } = require('../../model/userModel');
const { orderModel } = require('../../model/admin/orderModel');

/* 添加商品分类 */
/* param: title
 * optitle: parentId
 * */
router.post('/addClassify', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['title'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const list = await classifyModel.find({ parentId: param.parentId || "0" }).sort({ "_id": -1 })
  const lastItem = list[0]
  var newId
  var parentItem
  if (param.parentId) {
    parentItem = await classifyModel.findOne({ id: param.parentId })
    if (parentItem.level >= 3) {
      ctx.throw(200, commons.jsonBack(1004, {}, "最多添加三级"))
    }
    newId = lastItem ? param.parentId + "-" + String(Number(lastItem.id.split("-")[parentItem.level]) + 1) : param.parentId + "-" + "1"
  } else {
    newId = lastItem ? String(Number(lastItem.id) + 1) : "1"
  }
  let classify = await classifyModel.create({
    title: param.title,
    created_time: Date.parse(new Date()),
    update_time: Date.parse(new Date()),
    id: newId,
    parentId: param.parentId || "0",
    level: param.parentId ? parentItem.level + 1 : 1,
  })
  ctx.body = commons.jsonBack(1, classify, "添加成功");
})

/* 查询分类列表 */
router.get('/getClassify', async (ctx) => {
  var list = await classifyModel.find()
  list = JSON.parse(JSON.stringify(list))
  function jsonToTree(jsonData, id, pid) {
    let result = [],
      temp = {};
    for (let i = 0; i < jsonData.length; i++) {
      temp[jsonData[i][id]] = jsonData[i];
    }
    for (let j = 0; j < jsonData.length; j++) {
      let currentElement = jsonData[j];
      let tempCurrentElementParent = temp[currentElement[pid]];
      if (tempCurrentElementParent) {
        // 如果存在父元素
        if (!tempCurrentElementParent["children"]) {
          tempCurrentElementParent["children"] = [];
        }
        tempCurrentElementParent["children"].push(currentElement);
      } else {
        result.push(currentElement);
      }
    }
    return result;
  }
  var tree = jsonToTree(list, "id", "parentId")
  ctx.body = commons.jsonBack(1, tree, "获取成功");
})

/* 删除商品分类 */
/*
* param: id
* */
router.post('/deleteClassify', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var item = await classifyModel.findOne({ id: param.id });
  await classifyModel.deleteOne({ id: param.id })
  if (item.level === 3) {

  } else if (item.level === 2) {
    await classifyModel.deleteMany({ parentId: param.id })
  } else if (item.level === 1) {
    var list = await classifyModel.find({ parentId: param.id });
    for (let i = 0; i < list.length; i++) {
      await classifyModel.deleteMany({ parentId: list[i].id })
    }
    await classifyModel.deleteMany({ parentId: param.id })
  }
  ctx.body = commons.jsonBack(1, {}, "操作成功");
})

/* 修改商品分类 */
/*
* param:title/logo、id
* */
router.post('/editClassify', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.title) {
    await classifyModel.findOneAndUpdate({ id: param.id }, { title: param.title, update_time: Date.parse(new Date()) })
    ctx.body = commons.jsonBack(1, {}, "操作成功");
  } else if (param.logo) {
    await classifyModel.findOneAndUpdate({ id: param.id }, { logo: param.logo, update_time: Date.parse(new Date()) })
    ctx.body = commons.jsonBack(1, {}, "操作成功");
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
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
    appid: baseConfig.wx_appid,
    secret: baseConfig.wx_secret,
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