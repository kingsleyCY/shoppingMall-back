const router = require('koa-router')()
const addressModel = require('../model/addressModel');

/* 添加地址 */
router.get('/addAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['userName', 'provinceName', 'cityName', 'countyName', 'detailInfo', 'telNumber', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  }
  console.log(param);
  param.created_time = Date.parse(new Date())
  var add = await addressModel.creatUser(param)
})

module.exports = router
