var orderSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  out_trade_no: String, // 订单ID
  out_refund_no: String, // 退款订单号
  total_fee: Number, // 成交价格
  sign: String, // 支付签名
  transaction_id: { type: String, default: "" }, // 微信支付订单号
  commodityId: String,
  userId: String,
  addressId: String,
  commodityDetail: Object,
  userDetail: Object,
  addressDetail: Object,
  time_end: String, // 支付完成时间
  /*
  * none 初始化 unpaid 待支付 paid 已支付成功 paiderror 已支付失败
  * undeliver 待发货  deliver 已发货 over 已完成
  * refund 已退款成功 unrefund 退款失败
  * */
  orderStatus: { type: String, default: "none" },
  mess: { type: String, default: "" },
  size: { type: String, default: "" },
  unpidData: { type: Object, default: {} }, // 支付微信参数
  refoundData: { type: Object, default: {} }, // 支付微信参数
  mailOrder: { type: String, default: "" },
  mailRemark: { type: String, default: "" },
}, { collection: "orderList" });
var orderModel = db.model("orderList", orderSchema);

exports.orderModel = orderModel