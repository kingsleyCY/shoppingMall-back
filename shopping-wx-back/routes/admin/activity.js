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
  var nowTime = Date.parse(new Date())
  if (param.sTime > param.eTime) {
    ctx.throw(200, commons.jsonBack(1003, {}, "开始时间不能大于结束时间"))
  }
  var obj = {
    update_time: nowTime,
    title: param.title,
    sTime: param.sTime,
    eTime: param.eTime,
    prizeId: param.prizeId,
  }
  var prizeItem = await shoppingModel.findOne({ id: obj.prizeId })
  obj.prizeDeatil = prizeItem
  if (param.id) {
    obj.id = param.id
    var item = await activityModel.findOneAndUpdate({ id: param.id }, obj, { new: true });
    const statusItem = await setActitvtyStatus(item.id)
    ctx.body = commons.jsonBack(1, statusItem, "修改活动成功！");
  } else {
    await client.incr('activityId');
    obj.id = await new Promise((resolve, reject) => {
      client.get("activityId", function (err, data) {
        resolve(data);
      })
    })
    obj.created_time = Date.parse(new Date());
    obj.status = 0;
    var item = await activityModel.create(obj);
    const statusItem = await setActitvtyStatus(item.id)
    ctx.body = commons.jsonBack(1, statusItem, "创建活动成功！");
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
* param: type(all , ing, over)
* */
router.post('/getActiList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['type'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var obj = {}
  if (param.type === "all") {

  } else if (param.type === "ing") {
    obj.status = 2
  } else if (param.type === "over") {
    obj.status = 3
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  obj.isDelete = 0
  const list = await activityModel.find(obj).sort({ '_id': -1 })
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
})


/* 修改状态，添加定时任务 */
async function setActitvtyStatus(id) {
  let item = await shoppingModel.findOne({ id });
  console.log(item);
  const nowTime = Date.parse(new Date());
  let status = 0;
  if (nowTime < item.sTime) { // 未开始
    status = 1;
    // createdStartSchedule(item)
  } else if (nowTime >= item.sTime && nowTime < item.eTime) { // 已开始
    status = 2;
  } else if (nowTime > item.eTime) { // 已结束
    status = 3;
  }
  var statusItem = await activityModel.findOneAndUpdate({ id }, { status }, { new: true });
  return statusItem
  /*async function createdStartSchedule(item) {
    var date = new Date(2020, 4, 17, 23, 27, 0);
    const scheduleModel = schedule.scheduleJob(date, function () {
      console.log("执行任务");
    });
    await activityModel.findOneAndUpdate({ id: item.id }, { scheduleModel: scheduleModel }, { new: true });

  }*/
}


module.exports = router