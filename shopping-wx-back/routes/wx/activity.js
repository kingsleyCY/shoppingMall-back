const router = require('koa-router')();

/* 获取当前活动列表 */
/*
* param:activityId、userId
* */
router.post('/joinActivity', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['activityId', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }

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

})

module.exports = router
