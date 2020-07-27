var userSchema = new mongoose.Schema({
  userId: String, // 用户ID
  created_time: Number,
  openId: String, // 绑定的微信openId
  recommendId: { type: String, default: '' }, // 推荐人的userId
  defaultAddress: { type: String, default: '' },
  phoneNumber: { type: String, default: '' }, // 手机号
  qrCode: { type: String, default: '' }, // 推荐二维码地址
  activityList: { type: Object, default: {} },
  integral: { type: Number, default: 0 }, // 积分
  wxUserInfo: { type: Object, default: {} },
  couponList: { type: Array, default: [] }, //优惠券信息
  lastActTime: { type: Number, default: '' }, // 最后活跃时间
  agentId: { type: Number, default: 0 }, // 代理级别 0=普通用户
  setAgentId: { type: Number, default: 1 }, // 代理结算级别 1=默认级别
  proxy_time: { type: Number, default: 0 }, // 成为代理时间

  extenId: { type: Number, default: 0 }, // 是否为推广
  exten_time: { type: Number, default: 0 }, // 成为推广时间

  mark: { type: String, default: "" }, // 备注
  userSettlement: { type: Object, default: {} }, // 用户结算信息
}, { collection: "userList", versionKey: false });
var userModel = db.model("userList", userSchema);

exports.userModel = userModel

/* userSettlement说明 */
/*
* extenStatus true/false 推广被结算
*
*
* */