var shoppingSchema = new mongoose.Schema({
  created_time: Number,
  logo: String,
  detail: String,
  introduction: String,
  classifyId: String, // 分类ID
  id: String,
  saleNum: Number, // 销售量
  consultNum: Number, // 查看量
  originPrice: Number, // 原价
  presentPrice: Number, // 优惠价
  overOrice: Number, // 实际价格
  isHot: { type: Number, default: 0 }, // 是否热款
  hotIndex: { type: Number, default: 0 },
  isExplosive: { type: Number, default: 0 }, // 是否爆款
  explosiveIndex: { type: Number, default: 0 },
  isBanner: { type: Number, default: 0 }, // 是否为banner
  bannerIndex: { type: Number, default: 0 },
  isNews: { type: Number, default: 0 }, // 是否为新品
  newsIndex: { type: Number, default: 0 },
}, { collection: "shoppingList" });
var shoppingModel = db.model("shoppingList", shoppingSchema);

exports.shoppingModel = shoppingModel