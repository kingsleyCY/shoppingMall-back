const router = require('koa-router')();
const { shoppingModel } = require('../../model/commodityModel');
const { classifyModel } = require('../../model/admin/classifyModel');

/* 商品列表-admin */
/*
* param: page、pageSize
* opparam: title、classifyId
* */
router.post('/commodityList', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const reg = new RegExp(param.title, 'i') //不区分大小写
  var search = {
    $or: [
      { title: { '$regex': reg } }
    ],
  }
  param.classifyId ? search.classifyId = param.classifyId : ""
  const list = await shoppingModel.find(search).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 })
  var total = await shoppingModel.find(search)
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
})

/* 添加商品-admin */
/*
* param: title、logo、introduction、classifyId、imgList、originPrice、presentPrice、overPrice、sizeCollet
* opparam：id、isHot、isExplosive、isNews、isRebate
* await client.incr('addressId');
* */
router.post('/addCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  const id = param.id
  delete param['id']
  if (!commons.judgeParamExists(['title', 'logo', 'introduction', 'classifyId', 'imgList', 'originPrice', 'sizeCollet'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (Object.keys(param.sizeCollet).length === 0) {
    ctx.throw(200, commons.jsonBack(1003, {}, "商品码数集合不能为空！"))
  }
  param.isHot ? param.isHot = 1 : param.isHot = 0
  param.isExplosive ? param.isExplosive = 1 : param.isExplosive = 0
  param.isNews ? param.isNews = 1 : param.isNews = 0
  param.isRebate ? param.isRebate = 1 : param.isRebate = 0
  if (param.classifyId) {
    var classifyItem = await classifyModel.findOne({ id: param.classifyId })
    classifyItem ? param.classifyName = classifyItem.title : ""
  }
  if (id) {
    param.update_time = Date.parse(new Date())
    await shoppingModel.findOneAndUpdate({ id }, param)
    var item = await shoppingModel.findOne({ id })
    ctx.body = commons.jsonBack(1, item, "修改成功！");
  } else {
    await client.incr('commodityId');
    param.id = await new Promise((resolve, reject) => {
      client.get("commodityId", function (err, data) {
        resolve(data);
      })
    })
    param.created_time = Date.parse(new Date())
    var item = await shoppingModel.create(param)
    ctx.body = commons.jsonBack(1, item, "添加成功！");
  }
})

/* 商品详情 */
router.get('/commodityDetail', async (ctx) => {
  var param = ctx.query;
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const item = await shoppingModel.findOne({ id: param.id })
  ctx.body = commons.jsonBack(1, item, "获取成功！");
})

/* 删除商品 */
router.post('/deleCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  // const item = await shoppingModel.deleteOne({ id: param.id })
  const item = await shoppingModel.remove({ id: { $in: param.id } })
  ctx.body = commons.jsonBack(1, item, "操作成功！");
})

/* 更新首页数据 */
/*
* param：type、ids:[{id,index}]
* */
router.post('/updateIndexList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['type', 'ids'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.ids.length <= 0) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  let idArr = param.ids.map(v => {
    return v.id
  })
  let key = ""
  if (param.type === 'banner') {
    key = "isBanner"
  } else if (param.type === 'hot') {
    key = "isHot"
  } else if (param.type === 'explosive') {
    key = "isExplosive"
  } else if (param.type === 'news') {
    key = "isNews"
  } else if (param.type === 'rebate') {
    key = "isRebate"
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  await shoppingModel.updateMany({ [key]: 1 }, { $set: { [key]: 0 } })
  await shoppingModel.updateMany({ id: { $in: idArr } }, { $set: { [key]: 1 } })
  ctx.body = commons.jsonBack(1, {}, "操作成功！");
})


module.exports = router