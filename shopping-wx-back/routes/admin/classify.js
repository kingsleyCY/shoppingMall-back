const router = require('koa-router')();
const { classifyModel } = require('../../model/admin/classifyModel');
const { shoppingModel } = require('../../model/commodityModel');

/* 添加商品分类 */
/* param: title
 * optitle: parentId、sort
 * */
router.post('/addClassify', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['title'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.parentId === "-1") {
    ctx.throw(200, commons.jsonBack(1003, {}, "该分类不支持添加子分类！"))
  }
  const list = await classifyModel.find({ parentId: param.parentId || "0", id: { $ne: "-1" } }).sort({ "_id": -1 })
  const lastItem = list[0];
  var newId;
  var parentItem;
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
    sort: param.sort || "1",
    parentId: param.parentId || "0",
    level: param.parentId ? parentItem.level + 1 : 1,
  })
  // 父节点下如有商品转移到添加的子节点
  if (!lastItem && param.parentId) {
    var commodityCount = await shoppingModel.countDocuments({ classifyId: param.parentId });
    if (commodityCount > 0) {
      await moveCommodity(param.parentId)
    }
  }
  ctx.body = commons.jsonBack(1, classify, "添加成功");
})

/* 查询分类列表 */
router.get('/getClassify', async (ctx) => {
  var list = await classifyModel.find().sort({ sort: -1 })
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
  if (param.id === "-1") {
    ctx.throw(200, commons.jsonBack(1003, {}, "该分类不可删除！"))
  }
  var classifyList = await classifyModel.find({ id: { $ne: "-1" } });
  var zeroItem = await classifyModel.findOne({ id: "-1" });
  if (!zeroItem) {
    zeroItem = await classifyModel.create({
      title: "补全分类",
      created_time: Date.parse(new Date()),
      update_time: Date.parse(new Date()),
      id: "-1",
      level: 1,
    });
  }
  await loop(param.id);

  async function loop(classifyId) {
    // 更新分类下商品
    await shoppingModel.updateMany({ classifyId }, { classifyId: "-1" });
    let childList = classifyList.filter(v => {
      return v.parentId === classifyId
    })
    for (let i = 0; i < childList.length; i++) {
      if (childList[i].parentId === classifyId) {
        loop(childList[i].id)
      }
    }
    console.log(classifyId);
    await classifyModel.deleteOne({ id: classifyId });
  }


  // await classifyModel.deleteOne({ id: param.id });
  /*if (item.level === 3) {
    await shoppingModel.updateMany({ classifyId: item.id }, { classifyId: "-1" })
  } else if (item.level === 2) {
    var list = await classifyModel.find({ parentId: param.id });
    var ids = []
    for (let i = 0; i < list.length; i++) {
      ids.push(list[i].id)
    }
    // 迁移分类下商品
    if (ids.length === 0) {
      await shoppingModel.updateMany({ classifyId: item.id }, { classifyId: "-1" });
    } else {
      await shoppingModel.updateMany({ classifyId: { $in: ids } }, { classifyId: "-1" });
    }
    // 删除子分类
    await classifyModel.deleteMany({ parentId: param.id });
  } else if (item.level === 1) {
    var list = await classifyModel.find({ parentId: param.id });
    var ids = []
    for (let i = 0; i < list.length; i++) {
      // await classifyModel.deleteMany({ parentId: list[i].id })
      ids.push(list[i].id)
    }
    // 迁移分类下商品
    if (ids.length === 0) {
      await shoppingModel.updateMany({ classifyId: item.id }, { classifyId: "-1" });
    } else {
      // 循环二级分类
      for (let i = 0; i < ids.length; i++) {

      }
    }
    await classifyModel.deleteMany({ parentId: param.id })
  }*/
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
    await classifyModel.findOneAndUpdate({ id: param.id }, {
      title: param.title,
      update_time: Date.parse(new Date()),
      sort: param.sort || "1"
    })
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
  if (!zeroItem) {
    await classifyModel.create({
      title: "补全分类",
      created_time: Date.parse(new Date()),
      update_time: Date.parse(new Date()),
      id: "-1",
      level: 1,
    });
  }
  await shoppingModel.updateMany({ classifyId: classifyId }, { classifyId: "-1" })
}


module.exports = router