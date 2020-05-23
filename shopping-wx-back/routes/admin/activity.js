const router = require('koa-router')();
const schedule = require("node-schedule");
const { activityModel } = require('../../model/admin/activityModel');
const { shoppingModel } = require('../../model/commodityModel');

/* 创建/编辑活动 */
/* param: id、title、sTime、eTime、prizeId
 * */
router.post('/creatActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['title', 'sTime', 'eTime', 'prizeId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (param.sTime > param.eTime) {
    ctx.throw(200, commons.jsonBack(1003, {}, "开始时间不能大于结束时间"))
  } else if (param.eTime - param.sTime < 24 * 60 * 60 * 1000) {
    // ctx.throw(200, commons.jsonBack(1003, {}, "时间段必须大于一天"))
  }
  if (param.id) {
    var activityItem = await activityModel.findOne({ id: param.id })
    if (!activityItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "为获取到此活动信息"))
    } else if (activityItem.isDelete === 1) {
      ctx.throw(200, commons.jsonBack(1003, {}, "此活动已删除无法修改"))
    } else if (activityItem.status !== 1) {
      ctx.throw(200, commons.jsonBack(1003, {}, "只有未开始活动可编辑"))
    }
    var prizeItem = await shoppingModel.findOne({ id: param.prizeId })
    if (!prizeItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此奖品详情"))
    }
    var newItem = JSON.parse(JSON.stringify(await activityModel.findOneAndUpdate({ id: param.id }, {
      title: param.title,
      prizeId: param.prizeId,
      prizeDeatil: prizeItem,
      update_time: Date.parse(new Date()),
      sTime: param.sTime,
      eTime: param.eTime,
    }, { new: true })));
    newItem = await setActitvtyStatus(newItem)
    ctx.body = commons.jsonBack(1, newItem, "修改活动成功！");
  } else {
    if (param.eTime < Date.parse(new Date())) {
      ctx.throw(200, commons.jsonBack(1003, {}, "结束时间不能小于当前时间"))
    }
    var prizeItem = await shoppingModel.findOne({ id: param.prizeId })
    if (!prizeItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此奖品详情"))
    }
    var obj = {
      title: param.title,
      sTime: param.sTime,
      eTime: param.eTime,
      prizeId: param.prizeId,
      prizeDeatil: prizeItem,
    }
    await client.incr('activityId');
    obj.id = await new Promise((resolve, reject) => {
      client.get("activityId", function (err, data) {
        resolve(data);
      })
    })
    obj.status = 0;
    obj.update_time = Date.parse(new Date());
    obj.created_time = Date.parse(new Date());
    var newItem = JSON.parse(JSON.stringify(await activityModel.create(obj)));
    newItem = await setActitvtyStatus(newItem)
    ctx.body = commons.jsonBack(1, newItem, "创建活动成功！");
  }
})

/* 删除活动 */
/*
* param:id
* */
router.post('/deleActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var item = await activityModel.findOneAndUpdate({ id: param.id }, { isDelete: 1 }, { new: true });
  ctx.body = commons.jsonBack(1, item, "删除成功");
})

/* 获取活动列表 */
/*
* param: type(all ,ready , ing, over, delete)
* */
router.post('/getActiList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['type'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var obj = {}
  if (param.type === "all") {

  } else if (param.type === "ready") {
    obj.status = 1
    obj.isDelete = 0
  } else if (param.type === "ing") {
    obj.status = 2
    obj.isDelete = 0
  } else if (param.type === "over") {
    obj.status = 3
    obj.isDelete = 0
  } else if (param.type === "delete") {
    obj.isDelete = 1
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var list = await activityModel.find(obj).sort({ '_id': -1 });
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
})


/* 修改状态，添加定时任务 */
/* 创建定时任务条件：初始化/未开始 */
async function setActitvtyStatus(data) {
  const nowTime = Date.parse(new Date());
  if (nowTime < data.sTime) { // 未开始
    await createdStartSchedule(data)
    await createdEndSchedule(data)
  } else if (nowTime >= data.sTime && nowTime < data.eTime) { // 已开始
    if (data.scheduleStartModel) {
      repeatSchedule(data.scheduleStartModel)
    }
    await createdEndSchedule(data)
  }
  var statusItem = await activityModel.findOne({ id: data.id });
  statusItem = commons.judgeParamExists(statusItem, ["scheduleStartModel", "scheduleEndModel"])
  return statusItem
}
async function createdStartSchedule(item) {
  if (item.scheduleStartModel) {
    repeatSchedule(item.scheduleStartModel)
  }
  var stimeArr = commons.timeTransfer(item.sTime, true)
  var sdate = new Date(stimeArr[0], stimeArr[1] - 1, stimeArr[2], stimeArr[3], stimeArr[4], stimeArr[5]);
  var jobId = "start" + item.id;
  schedule.scheduleJob(jobId, sdate, async function () {
    console.log("开始执行。。。");
    var a = await activityModel.findOneAndUpdate({ id: item.id }, {
      update_time: Date.parse(new Date()),
      status: 2
    }, { new: true })
  }, function () {
    console.log("开始执行1。。。");
  });
  await activityModel.findOneAndUpdate({ id: item.id }, {
    status: 1,
    scheduleStartModel: jobId
  })
}
async function createdEndSchedule(item) {
  if (item.scheduleEndModel) {
    repeatSchedule(item.scheduleEndModel)
  }
  var etimeArr = commons.timeTransfer(item.eTime, true)
  var edate = new Date(etimeArr[0], etimeArr[1] - 1, etimeArr[2], etimeArr[3], etimeArr[4], etimeArr[5]);
  var jobId = "end" + item.id;
  schedule.scheduleJob(jobId, edate, async function () {
    console.log("结束执行。。。");
    var a = await activityModel.findOneAndUpdate({ id: item.id }, {
      update_time: Date.parse(new Date()),
      status: 3
    })
  }, function () {
    console.log("结束执行1。。。");
  });
  await activityModel.findOneAndUpdate({ id: item.id }, {
    scheduleEndModel: jobId
  })
}
function repeatSchedule(str) {
  schedule.scheduledJobs[str] ? schedule.scheduledJobs[str].cancel() : ""
}

module.exports = router