/* admin端主要接口 */
const router = require('koa-router')();
const { suggestModel } = require('../../model/suggestModel');

/* 登录 admin */
/*
* param：page、pageSize
* oparam：
* */
router.post('/getSuggestList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  const list = await suggestModel.find({}).skip((param.page - 1) * param.pageSize).limit(Number(param.pageSize)).sort({ '_id': -1 })
  var total = await suggestModel.find({})
  ctx.body = commons.jsonBack(1, {
    list,
    total: total.length,
    page: param.page,
    pageSize: param.pageSize,
  }, "查询成功");
})


module.exports = router