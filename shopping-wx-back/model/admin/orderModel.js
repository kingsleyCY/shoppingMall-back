var orderSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  userId: String, // 用户ID
  price: Number, // 成交价格
}, { collection: "orderList" });
var orderModel = db.model("orderList", orderSchema);

exports.orderModel = orderModel