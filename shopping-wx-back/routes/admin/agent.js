const router = require('koa-router')();
const { agentModel } = require('../../model/admin/agentModel');

/* 添加、修改代理分类 */
/* param: title
 * optitle: id、parentId
 * */
router.post('/editAgent', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['title'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.id) {
    var agentItem = await agentModel.findOne({ id: param.id })
    if (!agentItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此分类"))
    }
    await agentModel.findOneAndUpdate({ id: param.id }, {
      title: param.title,
      update_time: Date.parse(new Date()),
      agentModelData: param.agentModelData,
      childProfit: param.childProfit,
    })
  } else {
    const list = await agentModel.find({ parentId: param.parentId || "0", id: { $ne: "-1" } }).sort({ "_id": -1 })
    const lastItem = list[0];
    var newId;
    var parentItem;
    if (param.parentId) {
      parentItem = await agentModel.findOne({ id: param.parentId })
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
    await agentModel.create({
      title: param.title,
      created_time: Date.parse(new Date()),
      update_time: Date.parse(new Date()),
      id: newId,
      parentId: param.parentId || "0",
      level: param.parentId ? parentItem.level + 1 : 1,
      agentModelData: param.agentModelData,
      childProfit: param.childProfit,
    })
  }

  ctx.body = commons.jsonBack(1, {}, "操作成功");
})

/* 查询分类列表 */
router.get('/getAgent', async (ctx) => {
  var list = await agentModel.find().sort({ sort: -1 })
  list = JSON.parse(JSON.stringify(list))
  ctx.body = commons.jsonBack(1, list, "获取成功");
})

/* 删除商品分类 */
/*
* param: id
* */
router.post('/delAgent', async (ctx) => {
  var param = ctx.request.body;
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var classifyList = await agentModel.find({ id: { $ne: "-1" } });
  await loop(param.id);

  async function loop(classifyId) {
    // 更新分类下商品
    let childList = classifyList.filter(v => {
      return v.parentId === classifyId
    })
    for (let i = 0; i < childList.length; i++) {
      if (childList[i].parentId === classifyId) {
        loop(childList[i].id)
      }
    }
    console.log(classifyId);
    await agentModel.deleteOne({ id: classifyId });
  }

  ctx.body = commons.jsonBack(1, {}, "操作成功");
})

module.exports = router