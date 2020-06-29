var addressSchema = new mongoose.Schema({
  created_time: Number,
  userName: String,
  postalCode: Number, // 邮编
  provinceName: String, // 第一级地址
  cityName: String, // 第二级地址
  countyName: String, // 第三级地址
  detailInfo: String, // 详细收货地址信息
  telNumber: Number, // 收货人手机号码
  id: String,
  userId: String, // 用户ID
  // isDefault: { type: Number, default: 0 }
}, { collection: "addressList", versionKey: false });
var addressModel = db.model("addressList", addressSchema);

exports.creatAddress = async function (param) {
  // await client.incr('addressId');
  const user = await new Promise((resolve, reject) => {
    addressModel.create(param, function (err, doc) {
      if (err) throw err
      resolve(doc)
    })
  })
  return user
}

exports.searchAddress = async function (param) {
  return await new Promise((resolve, reject) => {
    addressModel.find(param).sort({ '_id': -1 }).exec(function (err, docs) {
      if (err) throw err
      resolve(docs)
    });
  })
}

exports.countAll = async function (param) {
  return await new Promise((resolve, reject) => {
    addressModel.countDocuments({ userId: param.userId }).exec(function (err, docs) {
      if (err) throw err
      resolve(docs)
    });
  })
}

exports.deleAddress = async function (param) {
  return await new Promise((resolve, reject) => {
    addressModel.deleteOne(param).exec(function (err, docs) {
      if (err) throw err
      resolve(docs)
    });
  })
}

exports.updateAddress = async function (findObj, updateObj) {
  return await new Promise((resolve, reject) => {
    addressModel.findOneAndUpdate(findObj, updateObj, { new: true }).exec(function (err, docs) {
      if (err) throw err
      resolve(docs)
    });
  })
}

exports.model = addressModel