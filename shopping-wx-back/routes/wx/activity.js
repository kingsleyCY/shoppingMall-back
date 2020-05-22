const router = require('koa-router')();
const { activityModel } = require('../../model/admin/activityModel');

/* 获取当前活动列表 */
/*
* param:activityId、userId
* */
router.post('/getActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['activityId', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const list = await activityModel.find({ "status": 2, "isDelete": 0 }).sort({ '_id': -1 })
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
})

/* 参与活动 */
/*
* param:activityId、userId
* */
router.post('/joinActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['activityId', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const actitvtyItem = await activityModel.find({ "status": 2, "id": param.activityId }).sort({ '_id': -1 })
  if (actitvtyItem.length >= 0) {

    ctx.body = commons.jsonBack(1, {}, "参与成功");
  } else {
    ctx.body = commons.jsonBack(1003, {}, "该活动未开始");
  }
})

module.exports = router
