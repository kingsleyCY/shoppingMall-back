const router = require('koa-router')();
const { classifyModel } = require('../../model/admin/classifyModel');
const { shoppingModel } = require('../../model/commodityModel');

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
    if (!parentItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "父节点不存在"))
    }
    if (parentItem.level >= 3) {
      ctx.throw(200, commons.jsonBack(1004, {}, "最多添加三级"))
    }
    newId = lastItem ? param.parentId + "-" + String(Number(lastItem.id.split("-")[parentItem.level]) + 1) : param.parentId + "-" + "1";
  } else {
    newId = lastItem ? String(Number(lastItem.id) + 1) : "1";
  }
  let classify = await classifyModel.create({
    title: param.title,
    created_time: Date.parse(new Date()),
    update_time: Date.parse(new Date()),
    id: newId,
    parentId: param.parentId || "0",
    level: param.parentId ? parentItem.level + 1 : 1,
  })
  // 父节点下如有商品转移到添加的子节点
  if (!lastItem && !param.parentId) {
    var commodityCount = await shoppingModel.count({ classifyId: param.parentId });
    if (commodityCount > 0) {
      await moveCommodity(param.parentId)
    }
  }
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
  await classifyModel.deleteOne({ id: param.id });
  if (item.level === 3) {
    await moveCommodity(item.id)
  } else if (item.level === 2) {
    // await classifyModel.deleteMany({ parentId: param.id })

  } else if (item.level === 1) {
    var list = await classifyModel.find({ parentId: param.id });
    for (let i = 0; i < list.length; i++) {
      await classifyModel.deleteMany({ parentId: list[i].id })
    }
    await classifyModel.deleteMany({ parentId: param.id })
  }
  ctx.body = commons.jsonBack(1, {}, "操作成功");
})

/* 修改分类 */
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


/* 指定节点下商品移动到特殊分类 */
async function moveCommodity(classifyId) {
  var zeroItem = await classifyModel.findOne({ id: "-1" });
  if (!allClassify) {
    zeroItem = await classifyModel.create({
      title: "补全分类",
      created_time: Date.parse(new Date()),
      update_time: Date.parse(new Date()),
      id: "-1",
      level: 1,
    });
  }
  console.log(zeroItem);
  await shoppingModel.updateMany({ classifyId: classifyId }, { classifyId: "-1" })
}


module.exports = router