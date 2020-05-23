const router = require('koa-router')();
const { activityModel } = require('../../model/admin/activityModel');
const { userModel } = require('../../model/userModel');

/* 获取当前活动列表 */
/*
* param:userId
* */
router.post('/getActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId'], param)) {
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
  const actitvtyItem = await activityModel.findOne({ "status": 2, "id": param.activityId })
  if (actitvtyItem) {
    var userItem = await userModel.findOne({ "userId": param.userId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1001, {}, "此用户不存在"))
    }
    var activityList = userItem.activityList;
    var code = commons.activityCode()
    !activityList ? activityList = {} : ""
    activityList[actitvtyItem.id] = {
      code,
      joinStatus: 1,
      isWins: 0
    }
    var newVal = await userModel.findOneAndUpdate({ "userId": param.userId }, { activityList }, { new: true })
    ctx.body = commons.jsonBack(1, { code }, "参与成功");
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "此活动不存在"))
  }
})

/* 获取参与的活动 */
/*
* param:userId
* */
router.post('/activited', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var userItem = await userModel.findOne({ "userId": param.userId })
  if (userItem) {
    ctx.body = commons.jsonBack(1, { activityList: userItem.activityList }, "获取成功");
  } else {
    ctx.throw(200, commons.jsonBack(1001, {}, "此用户不存在"))
  }
})

module.exports = router
