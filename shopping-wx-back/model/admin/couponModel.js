var couponSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  type: { type: Number, default: 1 }, // 优惠券类型 1=>通用 2=>抽奖
  useType: { type: Number, default: 1 }, // 优惠券使用类型 1=>满减
  lotteryCode: { type: String, default: "" }, // 抽奖code
  // crowdData: { type: Array, default: {} }, // 优惠券人群 userIds
  fullDecre: { type: Object, default: {} }, // 满减数据 fullFee decre
  timeRange: { type: Object, default: {} }, // 优惠券时间范围 sTime、eTime
  usageLimit: { type: Number, default: 0 }, // 人数限制 type==2
  usageIds: { type: Array, default: [] }, // 已绑定userID type==2
}, { collection: "couponList", versionKey: false });
var couponModel = mongoose.model("couponList", couponSchema);

exports.couponModel = couponModel