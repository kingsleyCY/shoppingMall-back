const router = require('koa-router')()
const { shoppingModel } = require('../../model/commodityModel');
const { baseConfigModel } = require('../../model/baseConfigModel')

/* 获取商品分类配置数据 */
router.get('/getBaseConfig', async (ctx) => {
  var classifyList = await baseConfigModel.findOne({ "classify": "shoppingClassify" })
  ctx.body = commons.jsonBack(1, {
    classifyList: classifyList.content
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
