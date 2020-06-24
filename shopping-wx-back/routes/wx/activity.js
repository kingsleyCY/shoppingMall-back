const router = require('koa-router')();
const { activityModel } = require('../../model/admin/activityModel');
const { userModel } = require('../../model/userModel');

/* 获取当前活动列表 */
/*
* param:userId
* */
router.post('/getActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  /*if (!commons.judgeParamExists(['userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }*/
  var list = await activityModel.find({ "status": 2, "isDelete": 0 }).sort({ '_id': -1 })
  list = JSON.parse(JSON.stringify(list))
  for (var i = 0; i < list.length; i++) {
    list[i] = commons.deleteKey(list[i], ['resultId'])
  }
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
  const actitvtyItem = JSON.parse(JSON.stringify(await activityModel.findOne({ "status": 2, "id": param.activityId })))
  if (actitvtyItem) {
    var userItem = JSON.parse(JSON.stringify(await userModel.findOne({ "userId": param.userId })))
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1001, {}, "此用户不存在"))
    }
    var activityList = userItem.activityList;
    if (activityList && activityList[actitvtyItem.id] && activityList[actitvtyItem.id]['joinStatus'] && activityList[actitvtyItem.id]['code']) {
      ctx.throw(200, commons.jsonBack(1003, {}, "已参加过此活动"))
    }
    var code = commons.activityCode()
    !activityList ? activityList = {} : ""
    activityList[actitvtyItem.id] = {
      code,
      joinStatus: 1,
      isWins: 2, // 0未中奖 1中奖 2未开奖
      isWinsText: "未开奖",
      actitvtyItem: JSON.stringify(actitvtyItem)
    }
    // 修改用户 参与活动数据
    await userModel.findOneAndUpdate({ "userId": param.userId }, { activityList }, { new: true })
    // 修改活动参与人数
    await activityModel.findOneAndUpdate({ id: param.activityId }, {
      activNun: (actitvtyItem.activNun ? actitvtyItem.activNun : 0) + 1
    })
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
    var activityList = JSON.parse(JSON.stringify(userItem.activityList));
    var newActivityList = {}
    for (let key in activityList) {
      let actItem = await activityModel.findOne({ id: key });
      if (!actItem) {
        continue
      }
      newActivityList[key] = activityList[key]
      newActivityList[key].actitvtyItem = JSON.stringify(actItem)
      if (actItem.status === 3) {
        if (actItem.resultId === newActivityList[key].code) {
          newActivityList[key].isWins = 1
          newActivityList[key].isWinsText = "已中奖"
        } else {
          newActivityList[key].isWins = 0
          newActivityList[key].isWinsText = "未中奖"
        }
      } else {
        newActivityList[key].isWins = 2
        newActivityList[key].isWinsText = "未开奖"
      }
    }
    await userModel.findOneAndUpdate({ "userId": param.userId }, { activityList: newActivityList })
    ctx.body = commons.jsonBack(1, { activityList: newActivityList }, "获取成功");
  } else {
    ctx.throw(200, commons.jsonBack(1001, {}, "此用户不存在"))
  }
})

module.exports = router
