var shoppingSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  logo: String,
  title: String,
  introduction: String,
  classifyId: String, // 分类ID
  id: String,
  imgList: { type: Array, default: [] },
  saleNum: { type: Number, default: 0 }, // 销售量
  consultNum: { type: Number, default: 0 }, // 查看量
  originPrice: { type: Number, default: 0 }, // 原价
  presentPrice: { type: Number, default: 0 }, // 优惠价
  overPrice: { type: Number, default: 0 }, // 实际价格
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