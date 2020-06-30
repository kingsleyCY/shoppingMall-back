const router = require('koa-router')()

/* 绑定用户获取openID */
/*
* params:
* */
router.post('/getCollet', async (ctx) => {
  ctx.body = commons.jsonBack(1, {
    model: commons.sizeCollet,
    arr: commons.sizeArr,
  }, "获取成功！");
})


module.exports = router