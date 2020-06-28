const router = require('koa-router')();
const { shoppingModel } = require('../../model/commodityModel');
const { classifyModel } = require('../../model/admin/classifyModel');

/* 获取商品分类及列表 */
router.get('/getBaseClassify', async (ctx) => {
  var comClassify = JSON.parse(JSON.stringify(await classifyModel.find({ id: { $ne: "-1" } }).sort({ sort: -1 })));
  ctx.body = commons.jsonBack(1, {
    classifyList: comClassify
  }, "获取数据成功");
});

/* 分类获取列表 */
/*
* param：classifyId、page、pageSize
* */
router.post('/getWareByClassify', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['classifyId', 'page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"));
  }
  var list = await shoppingModel.find({
    classifyId: param.classifyId,
    isDelete: { $ne: 1 },
  }).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 });
  var total = await shoppingModel.find({ classifyId: param.classifyId });
  ctx.body = commons.jsonBack(1, {
    list: list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
});

/* 获取首页数据 */
router.get('/getIndexData', async (ctx) => {
  var bannerList = await shoppingModel.find({ "isBanner": 1, isDelete: { $ne: 1 } }).sort({ 'bannerIndex': -1 })
  var hotList = await shoppingModel.find({ "isHot": 1, isDelete: { $ne: 1 } }).sort({ 'bannerIndex': -1 })
  var explosiveList = await shoppingModel.find({ "isExplosive": 1, isDelete: { $ne: 1 } }).sort({ 'bannerIndex': -1 })
  // var rebateList = await shoppingModel.find({ "isRebate": 1 }).sort({ 'rebateIndex': -1 })
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
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    param.page <= 0 ? ctx.throw(200, commons.jsonBack(1003, {}, "页数不能小于1")) : ""
    param.pageSize <= 0 ? ctx.throw(200, commons.jsonBack(1003, {}, "条数不能小于1")) : ""
    var commodityList = await shoppingModel.find({ "isNews": 1, isDelete: { $ne: 1 } }).sort({ 'newsIndex': -1 })
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

/* 获取折扣款数据 */
/*
* page、pageSize
*
* */
router.post('/getRebate', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    param.page <= 0 ? ctx.throw(200, commons.jsonBack(1003, {}, "页数不能小于1")) : ""
    param.pageSize <= 0 ? ctx.throw(200, commons.jsonBack(1003, {}, "条数不能小于1")) : ""
    var commodityList = await shoppingModel.find({ "isRebate": 1, isDelete: { $ne: 1 } }).sort({ 'rebateIndex': -1 })
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

/* 获取单个商品详情 */
/*
* param: page、pageSize
* opparam: title
* */
router.post('/searchCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const reg = new RegExp(param.title, 'i') //不区分大小写
  var search = {
    $or: [
      { title: { '$regex': reg } }
    ],
  }
  const list = await shoppingModel.find(search).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 })
  var total = await shoppingModel.find(search)
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
})


module.exports = router
