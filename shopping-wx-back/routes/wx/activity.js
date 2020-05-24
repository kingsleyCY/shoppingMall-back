const router = require('koa-router')();
const { activityModel } = require('../../model/admin/activityModel');
const { userModel } = require('../../model/userModel');

/* 获取当前活动列表 */
/*
* param:userId
* */
router.post('/getActivity', async (ctx) => {
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
    var newVal = await userModel.findOneAndUpdate({ "userId": param.userId }, {
      activityList,
      activNun: (actitvtyItem.activNun ? actitvtyItem.activNun : 0) + 1
    }, { new: true })
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
    var activityList = userItem.activityList
    for (let key in activityList) {
      let actItem = await activityModel.findOne({ id: key });
      if (actItem.status === 3) {
        if (actItem.resultId === activityList[key].code) {
          activityList[key].isWins = 1
          activityList[key].isWinsText = "已中奖"
        } else {
          activityList[key].isWins = 0
          activityList[key].isWinsText = "未中奖"
        }
      } else {
        activityList[key].isWins = 2
        activityList[key].isWinsText = "未开奖"
      }
    }
    await userModel.findOneAndUpdate({ "userId": param.userId }, { activityList: activityList })
    ctx.body = commons.jsonBack(1, { activityList: activityList }, "获取成功");
  } else {
    ctx.throw(200, commons.jsonBack(1001, {}, "此用户不存在"))
  }
})

module.exports = router
