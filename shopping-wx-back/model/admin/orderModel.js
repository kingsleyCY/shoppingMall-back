var orderSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  out_trade_no: String, // 订单ID
  out_refund_no: String, // 退款订单号
  total_fee: Number, // 成交价格
  sign: String, // 支付签名
  transaction_id: { type: String, default: "" }, // 微信支付订单号
  commodityId: String,
  userId: String,
  // userId: mongoose.Schema.Types.ObjectId,
  addressId: String,
  commodityDetail: Object,
  userDetail: Object,
  addressDetail: Object,
  time_end: String, // 支付完成时间
  orderStatus: { type: String, default: "none" }, // 订单状态
  mess: { type: String, default: "" }, // 下单备注
  size: { type: String, default: "" }, // 尺寸
  unpidData: { type: Object, default: {} }, // 支付微信参数
  refoundData: { type: Object, default: {} }, // 退款-微信参数
  mailOrder: { type: String, default: "" }, // 快递单号
  mailRemark: { type: String, default: "" }, // 快递备注
  couponId: { type: String, default: "" },
  original_fee: { type: Number, default: "" }, // 原价(元)
  applyAfterDetail: { type: Object, default: {} }, // 售后详情
}, { collection: "orderList", versionKey: false });
var orderModel = db.model("orderList", orderSchema);

exports.orderModel = orderModel;

/* orderStatus 说明 */

/*
* none 初始化
* unpaid 待支付
* paid 已支付成功
* paiderror 已支付失败
* undeliver 待发货(未提交给商家)
* deliver 待发货(已提交给商家)
* delivered 已发货
* over 已完成
* refund 已退款成功
* unrefund 退款失败
* canceled 取消订单（未付款）
* applyAfter 申请售后
*
* */

/* 金额说明 */
/*
* original_fee 原价(元)
* total_fee 成交价(分)
* */

/* 售后详情字段说明-applyAfterDetail */
/*
* applyType：1 => 退货 2 => 换货
* returnGoods={}：退货信息 applyType=1
* exchangeGoods={}：换货信息 applyType=2
*
* mailOrder：快递单号-用户
* mailRemark：快递备注-用户
*
* manuMail：换货厂商快递单号
* manuMailRemark：换货厂商备注
*
* */