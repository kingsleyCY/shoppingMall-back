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

/* 获取首页数据 */
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
  var singleDetail = await shoppingModel.findOne({ id })
  ctx.body = commons.jsonBack(1, singleDetail, "获取数据成功");
})

module.exports = router
