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
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    var count = await addressModel.countAll({ userId: param.userId })
    var userItem = await userModel.findOne({ userId: param.userId })
    if (count >= 10) {
      ctx.body = commons.jsonBack(1004, {}, "该用户添加地址数已超过10个！");
    } else if (!userItem) {
      ctx.body = commons.jsonBack(1003, {}, "未查询到此用户！");
    } else {
      param.created_time = Date.parse(new Date())
      param.id = commons.generateIds();
      // count === 0 ? param.isDefault = 1 : param.isDefault = 0;
      if (count === 0) {
        await userModel.findOneAndUpdate({ userId: param.userId }, { defaultAddress: param.id })
      }
      let address = await addressModel.creatAddress(param)
      ctx.body = commons.jsonBack(1, address, "添加地址成功");
      commons.setRedis("addre-" + address.id, JSON.stringify(address))
      commons.setUserData(param.userId)
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
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    var userItem = await userModel.findOne({ userId: param.userId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户！"))
    }
    let addList = await addressModel.searchAddress({ userId: param.userId })
    ctx.body = commons.jsonBack(1, addList, "获取地址成功");
    commons.setUserData(param.userId)
  }
})

/* 删除地址 */
/*
* param：userId、addressId
* */
router.post('/deleAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['addressId', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
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
      commons.delRedis("addre", [param.id]);
      commons.setUserData(param.userId)
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
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
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
    ctx.body = commons.jsonBack(1, newAdr, "更新数据成功！");
    commons.setRedis("addre-" + newAdr.id, JSON.stringify(newAdr))
    commons.setUserData(param.userId)
  }
})

/* 设为默认地址 */
/*
* param：userId、addressId
* */
router.post('/setDefaultAddress', async (ctx) => {
  let param = ctx.request.body
  if (!commons.judgeParamExists(['addressId', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  } else {
    var userItem = await userModel.findOne({ userId: param.userId })
    var addreItem = await addressModel.model.findOne({ id: param.addressId })
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户！"))
    } else if (!addreItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此地址信息！"))
    } else if (addreItem.userId !== param.userId) {
      ctx.throw(200, commons.jsonBack(1003, {}, "此地址不属于此用户！"))
    }
    await addressModel.model.findOneAndUpdate({ userId: param.userId }, { defaultAddress: param.addressId })
    ctx.body = commons.jsonBack(1, {}, "更新数据成功！")
    commons.setUserData(param.userId)
  }
})

module.exports = router
