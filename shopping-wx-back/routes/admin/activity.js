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
    var oldItem = await activityModel.findOne({ id: param.id })
    if (oldItem.status === 1 || oldItem.status === 2) {
      var item = await activityModel.findOneAndUpdate({ id: param.id }, obj, { new: true })
      var status = item.status;
      var nowData = Date.parse(new Date())
      if (item.isDelete === 4) {
        status = item.status;
      } else if (nowData < item.sTime) {
        status = 1
      } else if (nowData > item.sTime && nowData < item.eTime) {
        status = 2
      } else if (nowData > item.eTime) {
        status = 3
      }
      var items = await activityModel.findOneAndUpdate({ id: param.id }, { status }, { new: true })
      ctx.body = commons.jsonBack(1, items, "创建修改成功");
    } else {
      ctx.throw(200, commons.jsonBack(1004, {}, "该活动已过期"))
    }
  } else {
    await client.incr('activityId');
    obj.id = await new Promise((resolve, reject) => {
      client.get("activityId", function (err, data) {
        resolve(data);
      })
    })
    obj.created_time = Date.parse(new Date())
    obj.status = 1
    var item = await activityModel.create(obj)
    ctx.body = commons.jsonBack(1, item, "创建活动成功");
  }
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
  const list = await activityModel.find(obj).sort({ '_id': -1 })
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
})


module.exports = router