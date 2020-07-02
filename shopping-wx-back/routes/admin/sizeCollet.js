const router = require('koa-router')();
const { sizeModel } = require('../../model/admin/sizeModel');

/* 添加size集合 */
/*
* params：sizes、title
* oparam：id
* */
router.post('/addCollet', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['title', 'sizes'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var detail = null;
  var sizes = param.sizes;
  sizes.forEach(v => {
    return Number(v)
  })
  sizes = sizes.sort();
  if (param.id) {
    detail = await sizeModel.findOne({ id: param.id });
    if (!detail) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此尺码集合"))
    }
    await sizeModel.findOneAndUpdate({ id: param.id }, { sizes: param.sizes, title: param.title })
  } else {
    await sizeModel.create({
      created_time: Date.parse(new Date()),
      id: commons.generateIds(),
      title: param.title,
      sizes: param.sizes
    })
  }
  ctx.body = commons.jsonBack(1, {}, "操作成功！");
})

/* 获取size列表 */
/*
* params:
* */
router.post('/getCollet', async (ctx) => {
  const list = await sizeModel.find();
  ctx.body = commons.jsonBack(1, {
    model: list,
    arr: commons.sizeArr,
  }, "获取成功！");
})

/* 删除尺码集合 */
/*
* params：id
* */
router.post('/delCollet', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var detail = await sizeModel.findOne({ id: param.id });
  if (!detail) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此尺码集合"))
  } else {
    await sizeModel.remove({ id: param.id });
  }
  ctx.body = commons.jsonBack(1, {}, "获取成功！");
})


module.exports = router