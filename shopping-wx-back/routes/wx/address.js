const router = require('koa-router')()
const addressModel = require('../../model/addressModel');
const { userModel } = require('../../model/userModel');

/* 添加地址 */
/*
* param：userName、provinceName、cityName、countyName、detailInfo、telNumber、userId
* params：postalCode
* */
router.post('/addAddress', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['userName', 'provinceName', 'cityName', 'countyName', 'detailInfo', 'telNumber', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    var count = await addressModel.countAll({ userId: param.userId })
    var userItem = await userModel.findOne({ userId: param.userId })
    if (count >= 10) {
      ctx.body = commons.jsonBack(1004, {}, "该用户添加地址数已超过10个！");
    } else if (!userItem) {
      ctx.body = commons.jsonBack(1003, {}, "未查询到此用户！");
    } else {
      param.created_time = Date.parse(new Date())
      param.id = await new Promise((resolve, reject) => {
        client.get("addressId", function (err, data) {
          resolve(data);
        })
      })
      count === 0 ? param.isDefault = 1 : param.isDefault = 0;
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
    var userItem = await userModel.findOne({ userId: param.userId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户！"))
    }
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
    var userItem = await userModel.findOne({ userId: param.userId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户！"))
    }
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
* params：userName、provinceName、cityName、countyName、detailInfo、telNumber、postalCode、isDefault
* */
router.post('/updateAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['addressId', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    var userItem = await userModel.findOne({ userId: param.userId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户！"))
    }
    let findObj = {
      userId: param.userId,
      id: param.addressId
    }
    let updateObj = JSON.parse(JSON.stringify(param))
    delete updateObj.userId
    delete updateObj.addressId
    let newAdr = await addressModel.updateAddress(findObj, updateObj)
    ctx.body = commons.jsonBack(1, newAdr, "更新数据成功！")
  }
})

/* 设为默认地址 */
/*
* param：userId、addressId
* */
router.post('/setDefaultAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['addressId', 'userId'], param)) {
    ctx.body = commons.jsonBack(1003, {}, "参数传递错误！");
  } else {
    var userItem = await userModel.findOne({ userId: param.userId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户！"))
    }
    let findObj = {
      userId: param.userId
    }
    await addressModel.model.updateMany(findObj, { $set: { "isDefault": 0 } })
    let newAdr = await addressModel.model.findOneAndUpdate({
      userId: param.userId,
      id: param.addressId,
    }, { $set: { "isDefault": 1 } }, { new: true })
    ctx.body = commons.jsonBack(1, newAdr, "更新数据成功！")
  }
})

module.exports = router
