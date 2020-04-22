const router = require('koa-router')()
const { suggestModel } = require('../../model/suggestModel');

/* 获取商品分类配置数据 */
router.post('/complaintSuggest', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['type', 'content'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    await client.incr('suggestId');
    let data = JSON.parse(JSON.stringify(param))
    data.id = await new Promise((resolve, reject) => {
      client.get("suggestId", function (err, data) {
        resolve(data);
      })
    })
    data.created_time = Date.parse(new Date())
    let suggest = await suggestModel.create(data)
    ctx.body = commons.jsonBack(1, suggest, "添加建议成功！");
  }
})

module.exports = router
