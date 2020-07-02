const router = require('koa-router')();
const { shoppingModel } = require('../../model/commodityModel');
const { classifyModel } = require('../../model/admin/classifyModel');
const xlsxs = require('xlsx');

/* 商品列表-admin */
/*
* param: page、pageSize
* opparam: title、classifyId、sortBy、sortType
* */
router.post('/commodityList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const reg = new RegExp(param.title, 'i') //不区分大小写
  var search = {
    isDelete: { $ne: 1 },
    $or: [
      { title: { '$regex': reg } }
    ],
  }
  param.classifyId ? search.classifyId = param.classifyId : "";
  const sortObj = commons.sortList(param.sortBy, param.sortType);
  const list = await shoppingModel.find(search).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort(sortObj)
  const total = await shoppingModel.find(search)
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "获取数据成功");
})

/* 添加商品-admin */
/*
* param: title、logo、introduction、classifyId、imgList、originPrice、presentPrice、overPrice、sizeCollet/sizeColletId
* opparam：id、isHot、isExplosive、isNews、isRebate
* await client.incr('addressId');
* */
router.post('/addCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  const id = param.id
  delete param['id']
  if (!commons.judgeParamExists(['title', 'logo', 'introduction', 'classifyId', 'imgList', 'originPrice'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  /*if (param.sizeCollet.length === 0) {
    ctx.throw(200, commons.jsonBack(1003, {}, "商品码数集合不能为空！"))
  }*/
  param.isHot ? param.isHot = 1 : param.isHot = 0
  param.isExplosive ? param.isExplosive = 1 : param.isExplosive = 0
  param.isNews ? param.isNews = 1 : param.isNews = 0
  param.isRebate ? param.isRebate = 1 : param.isRebate = 0
  if (param.sizeColletId) {
    param.sizeCollet = commons.sizeCollet.filter(v => {
      return v.id === param.sizeColletId
    })[0].data
  } else {
    param.sizeColletId = 0
  }
  var sizeCollet = param.sizeCollet.map(v => {
    return Number(v)
  })
  sizeCollet = sizeCollet.sort();
  param.sizeCollet = sizeCollet;
  if (param.classifyId) {
    var classifyItem = await classifyModel.findOne({ id: param.classifyId })
    classifyItem ? param.classifyName = classifyItem.title : ""
  }
  if (id) {
    param.update_time = Date.parse(new Date())
    var item = await shoppingModel.findOneAndUpdate({ id }, param, { new: true });
    ctx.body = commons.jsonBack(1, item, "修改成功！");
    commons.setRedis("shop-" + id, JSON.stringify(item))
  } else {
    // await client.incr('commodityId');
    /*param.id = await new Promise((resolve, reject) => {
      client.get("commodityId", function (err, data) {
        resolve(data);
      })
    })*/
    param.id = commons.generateIds();
    param.created_time = Date.parse(new Date())
    var item = await shoppingModel.create(param)
    ctx.body = commons.jsonBack(1, item, "添加成功！");
    commons.setRedis("shop-" + param.id, JSON.stringify(item))
  }
})

/* 商品详情 */
router.get('/commodityDetail', async (ctx) => {
  var param = ctx.query;
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var detail = await commons.getRedis("shop-" + param.id);
  if (!detail) {
    detail = await shoppingModel.findOne({ id: param.id })
  } else {
    detail = JSON.parse(detail)
  }
  ctx.body = commons.jsonBack(1, detail, "获取成功！");
})

/* 删除商品 */
/*
* param：id
* */
router.post('/deleCommodity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  // const item = await shoppingModel.deleteOne({ id: param.id })
  const item = await shoppingModel.updateMany({ id: { $in: param.id } }, { isDelete: 1 })
  ctx.body = commons.jsonBack(1, item, "操作成功！");
  commons.delRedis("shop", param.id);
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

/* 上传xlsx 批量导入商品 */
router.post('/bathExportCommodity', async (ctx) => {
  // 上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  /*const workSheetsFromFile = xlsx.parse(file.path);
  console.log(workSheetsFromFile[0].data);*/
  let workbook = xlsxs.readFile(file.path);
  let sheetNames = workbook.SheetNames;
  let sheet = workbook.Sheets[sheetNames[0]];
  var data = xlsxs.utils.sheet_to_json(sheet);
  console.log(data);

  ctx.body = commons.jsonBack(1, {}, "操作成功！");
})

/* 批量修改商品分类 */
/*
* param：ids、classifyId
* */
router.post('/batchMoveCommdity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['classifyId', 'ids'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var classifyItem = await classifyModel.findOne({ id: param.classifyId })
  if (!classifyItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此分类"))
  }
  await shoppingModel.updateMany({ id: { $in: param.ids } }, {
    classifyId: param.classifyId,
    classifyName: classifyItem.title
  });
  ctx.body = commons.jsonBack(1, {}, "操作成功！");
  var list = await shoppingModel.find({ id: { $in: param.ids } })
  for (let i = 0; i < list.length; i++) {
    commons.setRedis("shop-" + list[i].id, JSON.stringify(list[i]));
  }
})

/* 修改排序 */
/*
* param：classifyId、sortJson
* */
router.post('/setSortIndex', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['classifyId', 'sortJson'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var list = JSON.parse(param.sortJson);
  for (let i = 0; i < list.length; i++) {
    await shoppingModel.findOneAndUpdate({ id: list[i].id }, { sortIndex: list[i].sortIndex })
  }
  ctx.body = commons.jsonBack(1, {}, "操作成功！");
})

/* 修改销售量/查看量 增加 */
/*
* param：ids addSaleNum addConsultNum
* */
router.post('/commodityAddition', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['ids'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (!param.addSaleNum && !param.addConsultNum) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var obj = {};
  param.addSaleNum ? obj.addSaleNum = param.addSaleNum : "";
  param.addConsultNum ? obj.addConsultNum = param.addConsultNum : "";
  await shoppingModel.updateMany({ id: { $in: param.ids } }, obj);
  ctx.body = commons.jsonBack(1, {}, "操作成功！");
})


module.exports = router