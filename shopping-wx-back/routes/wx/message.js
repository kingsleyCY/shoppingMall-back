const router = require('koa-router')();
const { messageModel } = require('../../model/admin/messageModel');

/* 获取推送消息 */
/*
* */
router.get('/pushMessList', async (ctx) => {
  var list = await messageModel.find({ isDel: 0, isShow: 1 }, { content: 1, id: 1, _id: 0 });
  ctx.body = commons.jsonBack(1, list, "获取成功");
});

module.exports = router
