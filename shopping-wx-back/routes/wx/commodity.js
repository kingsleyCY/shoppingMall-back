const router = require('koa-router')()
const { shoppingModel } = require('../../model/commodityModel');
const { baseConfigModel } = require('../../model/baseConfigModel')

/* 获取商品分类及列表 */
router.get('/getBaseClassify', async (ctx) => {
  var classifyList = await baseConfigModel.findOne({ "classify": "shoppingClassify" })
  var comClassify = classifyList.content
  var commidityList = await shoppingModel.find()
  for (let i = 0; i < commidityList.length; i++) {
    for (let j = 0; j < comClassify.length; j++) {
      if (String(comClassify[j].id) === String(commidityList[i].classifyId)) {
        comClassify[j].list ? "" : comClassify[j].list = []
        comClassify[j].list.push(commidityList[i])
        break;
      }
    }
  }
  for (let i = 0; i < comClassify.length; i++) {
    var list = await shoppingModel.find({ "classifyId": String(comClassify[i].id) })
    comClassify[i].list = list
  }
  ctx.body = commons.jsonBack(1, {
    classifyList: comClassify
  }, "获取数据成功");
})

/* 获取首页数据 */
router.get('/getIndexData', async (ctx) => {
  var bannerList = await shoppingModel.find({ "isBanner": 1 }).sort({ 'bannerIndex': -1 })
  var hotList = await shoppingModel.find({ "isHot": 1 }).sort({ 'bannerIndex': -1 })
  var explosiveList = await shoppingModel.find({ "isExplosive": 1 }).sort({ 'bannerIndex': -1 })
  ctx.body = commons.jsonBack(1, {
    bannerList, hotList, explosiveList
  }, "获取数据成功");
})

/* 获取新品数据 */
/*
* page、pageSize
*
* */
router.post('/getNewCommodity', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    param.page <= 0 ? ctx.throw(200, commons.jsonBack(1003, {}, "页数不能小于1")) : ""
    param.pageSize <= 0 ? ctx.throw(200, commons.jsonBack(1003, {}, "条数不能小于1")) : ""
    var commodityList = await shoppingModel.find({ "isNews": 1 }).sort({ 'newsIndex': -1 })
    /*.skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize))*/
    var skipList = []
    var startIndex = (param.page - 1) * param.pageSize
    commodityList ? skipList = commodityList.slice(startIndex, startIndex + param.pageSize + 1) : ""
    ctx.body = commons.jsonBack(1, {
      list: skipList,
      page: param.page,
      pageSize: param.pageSize,
      total: commodityList.length
    }, "获取数据成功");
  }
})

/* 获取单个商品详情 */
/*
* parama：id
* */
router.post('/getSingleDetail', async (ctx) => {
  const id = ctx.request.body.id
  var singleDetail = await shoppingModel.findOneAndUpdate({ id }, { $inc: { consultNum: 1 } })
  ctx.body = commons.jsonBack(1, singleDetail, "获取数据成功");
})

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
* param: title、logo、introduction、classifyId、imgList、originPrice、presentPrice、overPrice
* opparam：id、isHot、isExplosive、isNews
* await client.incr('addressId');
* */
router.post('/addCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  const id = param.id
  delete param['id']
  if (!commons.judgeParamExists(['title', 'logo', 'introduction', 'classifyId', 'imgList', 'originPrice'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  param.isHot ? param.isHot = 1 : param.isHot = 0
  param.isExplosive ? param.isExplosive = 1 : param.isExplosive = 0
  param.isNews ? param.isNews = 1 : param.isNews = 0
  if (id) {
    console.log(id);
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

router.get('/commodityDetail', async (ctx) => {
  var param = ctx.query;
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const item = await shoppingModel.findOne({ id: param.id })
  ctx.body = commons.jsonBack(1, item, "获取成功！");
})

router.post('/deleCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  console.log(param);
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  // const item = await shoppingModel.deleteOne({ id: param.id })
  const item = await shoppingModel.remove({ id: { $in: param.id } })
  ctx.body = commons.jsonBack(1, item, "操作成功！");
})

module.exports = router
