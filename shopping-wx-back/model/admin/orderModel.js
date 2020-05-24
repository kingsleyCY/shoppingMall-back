var orderSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  out_trade_no: String, // 订单ID
  total_fee: Number, // 成交价格
  sign: String, // 支付签名
  transaction_id: String, // 微信支付订单号
}, { collection: "orderList" });
var orderModel = db.model("orderList", orderSchema);

exports.orderModel = orderModel