const router = require('koa-router')();
const { messageModel } = require('../../model/admin/messageModel');

/* 添加推送消息 */
/*
* param: content、sortIndex、isShow
* oparam：id
* */
router.post('/addPushMess', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['content'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var detail = null
  if (param.id) {
    detail = await messageModel.findOne({ id: param.id })
    if (!detail) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此消息"))
    }
    await messageModel.findOneAndUpdate({ id: param.id }, {
      content: param.content,
      isShow: param.isShow
    })
  } else {
    detail = {
      created_time: Date.parse(new Date()),
      id: commons.generateIds(),
      content: param.content,
      sortIndex: param.sortIndex,
      isShow: 1,
      isDel: 0,
    }
    await messageModel.create(detail)
  }
  ctx.body = commons.jsonBack(1, {}, "操作成功");
});

/* 获取推送消息 */
/*
* */
router.post('/pushMessList', async (ctx) => {
  var list = await messageModel.find({ isDel: 0 });
  ctx.body = commons.jsonBack(1, list, "获取成功");
});

/* 删除推送消息 */
/*
* param:id
* */
router.post('/delPushMess', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var detail = await messageModel.findOne({ id: param.id })
  if (!detail) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此消息"))
  }
  await messageModel.findOneAndUpdate({ id: param.id }, { isDel: 1 })
  ctx.body = commons.jsonBack(1, {}, "操作成功");
});

/* 修改是否显示状态 */
/*
* param:id、isShow
* */
router.post('/changPushMessStatus', async (ctx) => {
  var param = ctx.request.body
  if (!commons.judgeParamExists(['id', 'isShow'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var detail = await messageModel.findOne({ id: param.id })
  if (!detail) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此消息"))
  }
  await messageModel.findOneAndUpdate({ id: param.id }, { isShow: param.isShow })
  ctx.body = commons.jsonBack(1, {}, "操作成功");
});


module.exports = router
