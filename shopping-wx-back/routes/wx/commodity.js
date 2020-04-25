const router = require('koa-router')()
const { shoppingModel } = require('../../model/commodityModel');
const { baseConfigModel } = require('../../model/baseConfigModel')

/* 获取商品分类及列表 */
router.get('/getBaseClassify', async (ctx) => {
  var classifyList = await baseConfigModel.findOne({ "classify": "shoppingClassify" })
  var comClassify = classifyList.content
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
