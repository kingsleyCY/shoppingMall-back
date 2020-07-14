const router = require('koa-router')();
const { shoppingModel } = require('../../model/commodityModel');
const { classifyModel } = require('../../model/admin/classifyModel');
const { baseConfigModel } = require('../../model/baseConfigModel');
const { messageModel } = require('../../model/admin/messageModel');

/* 获取商品分类列表 */
router.get('/getBaseClassify', async (ctx) => {
  var comClassify = JSON.parse(JSON.stringify(await classifyModel.find({ id: { $ne: "-1" } }).sort({ sort: -1 })));
  ctx.body = commons.jsonBack(1, {
    classifyList: comClassify
  }, "获取数据成功");
});

/* 分类获取列表 */
/*
* param：classifyId、page、pageSize
* opparam: sortBy、sortType
* */
router.post('/getWareByClassify', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['classifyId', 'page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"));
  }
  const sortObj = commons.sortList(param.sortBy, param.sortType);
  var list = await shoppingModel.find({
    classifyId: param.classifyId,
    isDelete: { $ne: 1 },
  }).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort(sortObj);
  var total = await shoppingModel.find({
    classifyId: param.classifyId,
    isDelete: { $ne: 1 },
  });
  list = totalNum(list)
  ctx.body = commons.jsonBack(1, {
    list: list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
});

/* 获取首页数据 */
/* banner 热款 爆款 */
router.get('/getIndexData', async (ctx) => {
  var data = await baseConfigModel.findOne({ type: "commodity" });
  var obj = {
    bannerList: [], hotList: [], explosiveList: []
  }
  var keyList = ["bannerList", "hotList", "explosiveList"];
  if (data) {
    for (let key in keyList) {
      for (let i = 0; i < data[keyList[key]].length; i++) {
        var shopItem = await commons.getRedis("shop-" + data[keyList[key]][i]);
        if (!shopItem) {
          shopItem = await shoppingModel.findOne({ isDelete: { $ne: 1 }, id: data[keyList[key]][i] });
          shopItem ? commons.setRedis("shop-" + shopItem.id, JSON.stringify(shopItem)) : ""
        } else {
          shopItem = JSON.parse(shopItem);
        }
        if (shopItem) {
          obj[keyList[key]].push(shopItem);
        }
      }
    }
  }
  var messList = await messageModel.find({ isDel: 0, isShow: 1 }, { content: 1, id: 1, _id: 0 });
  if (messList.length > 0) {
    obj.broadcast = messList[0].content
  } else {
    obj.broadcast = ""
  }

  ctx.body = commons.jsonBack(1, obj, "获取数据成功");
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
  }
  var data = await baseConfigModel.findOne({ type: "commodity" });
  var list = [];
  if (data) {
    const ids = data.newsList.slice(param.pageSize * (param.page - 1), param.page * param.pageSize)
    for (let i = 0; i < ids.length; i++) {
      var shopItem = await commons.getRedis("shop-" + ids[i]);
      if (!shopItem) {
        shopItem = await shoppingModel.findOne({ isDelete: { $ne: 1 }, id: ids[i] });
        shopItem ? commons.setRedis("shop-" + shopItem.id, JSON.stringify(shopItem)) : ""
      } else {
        shopItem = JSON.parse(shopItem);
      }
      if (shopItem) {
        list.push(shopItem);
      }
    }
  }

  list = totalNum(list)

  ctx.body = commons.jsonBack(1, {
    list: list,
    page: param.page,
    pageSize: param.pageSize,
    total: data.newsList.length
  }, "获取数据成功");
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
  }
  var data = await baseConfigModel.findOne({ type: "commodity" });
  var list = [];
  if (data) {
    const ids = data.rebateList.slice(param.pageSize * (param.page - 1), param.page * param.pageSize)
    for (let i = 0; i < ids.length; i++) {
      var shopItem = await commons.getRedis("shop-" + ids[i]);
      if (!shopItem) {
        shopItem = await shoppingModel.findOne({ isDelete: { $ne: 1 }, id: ids[i] });
        shopItem ? commons.setRedis("shop-" + shopItem.id, JSON.stringify(shopItem)) : ""
      } else {
        shopItem = JSON.parse(shopItem);
      }
      if (shopItem) {
        list.push(shopItem);
      }
    }
  }

  list = totalNum(list)

  ctx.body = commons.jsonBack(1, {
    list: list,
    page: param.page,
    pageSize: param.pageSize,
    total: data.rebateList.length
  }, "获取数据成功");
})

/* 获取单个商品详情 */
/*
* parama：id
* */
router.post('/getSingleDetail', async (ctx) => {
  const id = ctx.request.body.id
  if (!id) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var shopItem = await commons.getRedis("shop-" + id);
  if (!shopItem) {
    shopItem = await shoppingModel.findOne({ id });
    shopItem ? commons.setRedis("shop-" + shopItem.id, JSON.stringify(shopItem)) : ""
  }
  // var singleDetail = await shoppingModel.findOneAndUpdate({ id }, { $inc: { consultNum: 1 } })
  if (shopItem.isDelete === 1) {
    ctx.throw(200, commons.jsonBack(1003, {}, "该商品已被删除"))
  }
  shopItem = totalNum(shopItem)
  ctx.body = commons.jsonBack(1, shopItem, "获取数据成功");
})

/* 搜索商品 */
/*
* param: page、pageSize
* opparam: title、sortBy、sortType
* */
router.post('/searchCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const reg = new RegExp(param.title, 'i') //不区分大小写
  var search = {
    isDelete: { $ne: 1 },
    classifyId: { $ne: "-1" },
    $or: [
      { title: { '$regex': reg } }
    ],
  }
  var sortObj = commons.sortList(param.sortBy, param.sortType);
  var list = await shoppingModel.find(search).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort(sortObj)
  var total = await shoppingModel.find(search)
  list = totalNum(list)
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
})

function totalNum(list) {
  var lists = JSON.parse(JSON.stringify(list))
  if (Array.isArray(lists)) {
    lists.forEach(v => {
      v.totalSale = v.saleNum + v.addSaleNum;
      v.totalConsult = v.consultNum + v.addConsultNum;
    })
  } else {
    lists.totalSale = lists.saleNum + lists.addSaleNum;
    lists.totalConsult = lists.consultNum + lists.addConsultNum;
  }

  return lists
}


module.exports = router
