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
  isDelete: { type: Number, default: 0 }
}, { collection: "addressList", versionKey: false });
var addressModel = db.model("addressList", addressSchema);

exports.addressModel = addressModel