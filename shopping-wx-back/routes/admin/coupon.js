const router = require('koa-router')();
const { couponModel } = require('../../model/admin/couponModel');
const { userModel } = require('../../model/userModel');

/* 创建优惠券 */
/*
* param: title、type、useType
* opparam：type === 2(code、usageLimit) useType === 1(fullFee、decre)
* sTime、eTime
* */
router.post('/createdCoupon', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['title', 'type', 'useType'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var flag = ""
  var obj = {
    title: param.title,
    type: param.type,
    useType: param.useType,
  }
  if (param.id) {
    obj._id = param.id
  }
  if (obj.type === 1) {
    /* 通用优惠券 */
    if (obj.useType === 1) {
      if (!validFullDecre(param)) {
        obj.fullDecre = {
          fullFee: Number(param.fullFee),
          decre: Number(param.decre)
        }
        if (param.sTime && param.eTime) {
          obj.timeRange = {
            sTime: param.sTime,
            eTime: param.eTime
          }
        } else {
          obj.timeRange = {}
        }
        var couponItem = await saveCoupon();
        await setAllUserCoupon(couponItem)
      } else {
        ctx.throw(200, commons.jsonBack(1003, {}, validFullDecre(param)))
      }
    } else {
      flag = "优惠券使用类型不存在"
    }
  } else if (obj.type === 2) {
    /* 抽奖惠券 */
    if (!param.code || !param.usageLimit) {
      ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误-缺少code/usageLimit"))
    } else if (!(Number(param.usageLimit) > 0)) {
      ctx.throw(200, commons.jsonBack(1003, {}, "usageLimit必须大于0"))
    }
    if (param.useType === 1) {
      obj.lotteryCode = param.code;
      var lotteryCodeCpupon = await couponModel.findOne({ lotteryCode: obj.lotteryCode })
      if (lotteryCodeCpupon) {
        ctx.throw(200, commons.jsonBack(1003, {}, "优惠券抽奖码已存在，不可重复！"))
      }
      if (!validFullDecre(param)) {
        obj.fullDecre = {
          fullFee: Number(param.fullFee),
          decre: Number(param.decre)
        }
        if (param.sTime && param.eTime) {
          obj.timeRange = {
            sTime: param.sTime,
            eTime: param.eTime
          }
        } else {
          obj.timeRange = {}
        }
        obj.usageLimit = param.usageLimit;
        obj.usageIds = [];
        var couponItem = await saveCoupon();
        // await setAllUserCoupon(couponItem);
      } else {
        ctx.throw(200, commons.jsonBack(1003, {}, validFullDecre(param)))
      }
    } else {
      flag = "优惠券使用类型不存在"
    }
  } else {
    flag = "优惠券类型不存在"
  }
  if (flag) {
    ctx.throw(200, commons.jsonBack(1003, {}, flag))
  }

  function validFullDecre(param) {
    var mess = ""
    if (!param.fullFee) {
      mess = "缺少fullFee"
    } else if (!param.decre) {
      mess = "缺少decre"
    } else if (Number(param.fullFee) < Number(param.decre)) {
      mess = "fullFee应大于decre"
    }
    return mess
  }

  async function saveCoupon() {
    var couponItem
    if (obj._id) {
      var objs = JSON.parse(JSON.stringify(obj))
      objs = commons.deleteKey(objs, ['_id'])
      couponItem = await couponModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(obj._id) }, objs, { new: true });
      ctx.body = commons.jsonBack(1, couponItem, "修改优惠券成功！");
    } else {
      couponItem = await couponModel.create(obj);
      ctx.body = commons.jsonBack(1, couponItem, "创建优惠券成功！");
    }
    return couponItem
  }
})

/* 删除优惠券 */
/*
* param:id
* */
router.post('/deleteCoupon', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['id'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var item = await couponModel.remove({ _id: mongoose.Types.ObjectId(param.id) })
  await deletAllUserCoupon(param.id)
  ctx.body = commons.jsonBack(1, {}, "删除成功");
})

/* 优惠券列表 */
/*
* param: type(all, lottery)
* */
router.post('/getCounponList', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['type'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var obj = {}
  if (param.type === "all") {
    obj.type = 1
  } else if (param.type === "lottery") {
    obj.type = 2
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var list = await couponModel.find(obj).sort({ '_id': -1 });
  ctx.body = commons.jsonBack(1, list, "获取数据成功");
})

/* 抽奖优惠券绑定用户 */
/*
* param: userId/phone、couponId
* */
router.post('/couponBindUser', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['couponId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  if (!param.userId && !param.phone) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var couponItem = await couponModel.findOne({ _id: mongoose.Types.ObjectId(param.couponId) })
  if (couponItem) {
    var searchObj = {}
    param.userId ? searchObj.userId = param.userId : searchObj.phoneNumber = param.phone;
    var userItem = await userModel.findOne(searchObj);
    if (!userItem) {
      ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此用户"))
    }
    var userItems = JSON.parse(JSON.stringify(userItem));
    couponItem = JSON.parse(JSON.stringify(couponItem))
    var couponList = userItems.couponList || []
    if (couponList.indexOf(String(couponItem._id)) >= 0) {
      ctx.throw(200, commons.jsonBack(1003, {}, "该用户已绑定此优惠券"))
    } else if (couponItem.usageIds.length >= Number(couponItem.usageLimit)) {
      ctx.throw(200, commons.jsonBack(1003, {}, "该优惠券绑定人数已超出上限"))
    }
    var usageIds = couponItem.usageIds.concat([userItem.userId]);

    couponList.push(String(couponItem._id));
    await userModel.findOneAndUpdate(searchObj, { couponList }, { new: true })
    await couponModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(param.couponId) }, { usageIds })
    ctx.body = commons.jsonBack(1, {}, "绑定成功");
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此优惠券"))
  }
})

/* 查看优惠券绑定用户数据 */
/*
* param: couponId、page, pageSize
* */
router.post('/getCouponBindUser', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['couponId', 'page', 'pageSize'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var couponItem = await couponModel.findOne({ _id: mongoose.Types.ObjectId(param.couponId) })
  couponItem = JSON.parse(JSON.stringify(couponItem))
  if (!couponItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此优惠券"))
  }
  var usageIds = couponItem.usageIds;
  var idsArr = couponItem.usageIds.slice((param.page - 1) * param.pageSize, param.page * param.pageSize);
  var userList = []
  for (let i = 0; i < idsArr.length; i++) {
    let userItem = await userModel.findOne({ userId: idsArr[i] });
    userList.push(userItem)
  }
  ctx.body = commons.jsonBack(1, userList, "获取成功");
})

/* 删除优惠券绑定用户 */
/*
* param: couponId、userId
* */
router.post('/delCouponBindUser', async (ctx) => {
  var param = JSON.parse(JSON.stringify(ctx.request.body));
  if (!commons.judgeParamExists(['couponId', 'userId'], param)) {
    ctx.throw(200, commons.jsonBack(1003, {}, "参数传递错误"))
  }
  var couponItem = await couponModel.findOne({ _id: mongoose.Types.ObjectId(param.couponId) })
  couponItem = JSON.parse(JSON.stringify(couponItem))
  var userItem = await userModel.findOne({ userId: param.userId });
  userItem = JSON.parse(JSON.stringify(userItem))
  if (!couponItem || !userItem) {
    ctx.throw(200, commons.jsonBack(1003, {}, "未查询到此优惠券或用户信息"))
  }

  if (userItem.couponList.indexOf(param.couponId) >= 0 && couponItem.usageIds.indexOf(param.userId) >= 0) {
    var couponList = userItem.couponList;
    couponList.splice(couponList.indexOf(param.couponId), 1);
    await userModel.findOneAndUpdate({ userId: param.userId }, { couponList }, { new: true });

    var usageIds = couponItem.usageIds;
    usageIds.splice(usageIds.indexOf(param.userId), 1);
    await couponModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(param.couponId) }, { usageIds });
    ctx.body = commons.jsonBack(1, {}, "删除成功");
  } else {
    ctx.throw(200, commons.jsonBack(1003, {}, "该用户未绑定此优惠券"))
  }
})


async function setAllUserCoupon(couponItem) {
  await new Promise((resolve, reject) => {
    userModel.find({}, async function (err, data) {
      for (let i = 0; i < data.length; i++) {
        var item = JSON.parse(JSON.stringify(data[i]))
        item.couponList.indexOf(couponItem._id) < 0 ? item.couponList.push(String(couponItem._id)) : ""
        await userModel.findOneAndUpdate({ userId: item.userId }, { couponList: item.couponList }, { new: true })
      }
      resolve()
    })
  })
}
async function deletAllUserCoupon(id) {
  await new Promise((resolve, reject) => {
    userModel.find({}, async function (err, data) {
      for (let i = 0; i < data.length; i++) {
        var item = JSON.parse(JSON.stringify(data[i]))
        if (item.couponList && item.couponList.indexOf(id) >= 0) {
          item.couponList.splice(item.couponList.indexOf(id), 1)
          await userModel.findOneAndUpdate({ userId: item.userId }, { couponList: item.couponList }, { new: true })
        }
      }
      resolve()
    })
  })
}


module.exports = router