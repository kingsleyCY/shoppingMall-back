var userSchema = new mongoose.Schema({
  userId: String, // 用户ID
  created_time: Number,
  openId: String, // 绑定的微信openId
  recommendId: { type: String, default: '' }, // 推荐人的userId
  defaultAddress: { type: String, default: '' },
  phoneNumber: { type: String, default: '' }, // 手机号
  qrCode: { type: String, default: '' }, // 推荐二维码地址
  idProxy: Number, // 推荐二维码地址
  isProxy: { type: Number, default: 0 }, // 是否为代理
  activityList: { type: Object, default: {} },
  integral: { type: Number, default: 0 } // 积分
}, { collection: "userList" });
var userModel = db.model("userList", userSchema);

exports.userModel = userModel