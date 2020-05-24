const router = require('koa-router')()
const { suggestModel } = require('../../model/suggestModel');

/* 提交建议投诉 */
/*
* param:type、content、userId
* */
router.post('/complaintSuggest', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['type', 'content', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    let suggestList = await suggestModel.find({ "userId": param.userId }).sort({ 'created_time': -1 })
    let lastSuggest = suggestList[0]
    if (!lastSuggest || (Date.parse(new Date()) - lastSuggest.created_time > 48 * 60 * 60 * 1000)) {
      await client.incr('suggestId');
      let data = JSON.parse(JSON.stringify(param))
      data.id = await new Promise((resolve, reject) => {
        client.get("suggestId", function (err, data) {
          resolve(data);
        })
      })
      data.created_time = Date.parse(new Date())
      let suggest = await suggestModel.create(data)
      ctx.body = commons.jsonBack(1, suggest, "提交成功！");
    } else {
      ctx.body = commons.jsonBack(1005, {}, "您已提交过建议，48小时内只允许提交一次，感谢您的支持！");
    }
  }
})

module.exports = router
