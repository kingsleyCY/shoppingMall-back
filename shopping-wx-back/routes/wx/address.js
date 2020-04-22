const router = require('koa-router')()
const addressModel = require('../../model/addressModel');

/* 添加地址 */
/*
* param：userName、provinceName、cityName、countyName、detailInfo、telNumber、userId
* params：postalCode
* */
router.post('/addAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['userName', 'provinceName', 'cityName', 'countyName', 'detailInfo', 'telNumber', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    if (await addressModel.countAll(param) >= 10) {
      ctx.body = commons.jsonBack(1004, {}, "该用户添加地址数已超过10个！");
    } else {
      param.created_time = Date.parse(new Date())
      param.id = await new Promise((resolve, reject) => {
        client.get("addressId", function (err, data) {
          resolve(data);
        })
      })
      let address = await addressModel.creatAddress(param)
      ctx.body = commons.jsonBack(1, address, "添加地址成功");
    }
  }
})

/* 查询用户地址数据 */
/*
* param：userId
* */
router.post('/searchAddressList', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    let addList = await addressModel.searchAddress({ userId: param.userId })
    ctx.body = commons.jsonBack(1, addList, "获取地址成功");
  }
})

/* 删除地址 */
/*
* param：userId、addressId
* */
router.post('/deleAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['addressId', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    let list = await addressModel.deleAddress({
      userId: param.userId,
      id: param.addressId
    })
    if (list.n == 1 && list.deletedCount == 1) {
      ctx.body = commons.jsonBack(1, {}, "删除地址成功");
    } else {
      ctx.body = commons.jsonBack(1004, {}, "无该地址信息");
    }
  }
})

/* 修改地址 */
/*
* param：userId、addressId
* params：userName、provinceName、cityName、countyName、detailInfo、telNumber、postalCode
* */
router.post('/updateAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['addressId', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    let findObj = {
      userId: param.userId,
      id: param.addressId
    }
    let updateObj = JSON.parse(JSON.stringify(param))
    delete updateObj.userId
    delete updateObj.id
    let newAdr = await addressModel.updateAddress(findObj, updateObj)
    ctx.body = commons.jsonBack(1, newAdr, "更新数据成功！")
  }
})

module.exports = router
