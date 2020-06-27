var orderLogSchema = new mongoose.Schema({
  out_trade_no: String, // 订单ID
  orderLog: { type: Array, default: [] }, // 订单状态变化详情
}, { collection: "orderList", versionKey: false });
var orderLogModel = db.model("orderList", orderLogSchema);

exports.orderLogModel = orderLogModel;