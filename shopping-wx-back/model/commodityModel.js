var shoppingSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  logo: String,
  title: String,
  introduction: String,
  classifyId: String, // 分类ID
  classifyName: { type: String, default: "" }, // 分类ID
  id: String,
  imgList: { type: Array, default: [] },
  saleNum: { type: Number, default: 0 }, // 销售量
  addSaleNum: { type: Number, default: 0 }, // 销售量-增加
  consultNum: { type: Number, default: 0 }, // 查看量
  addConsultNum: { type: Number, default: 0 }, // 查看量-增加
  originPrice: { type: Number, default: 0 }, // 原价
  presentPrice: { type: Number, default: 0 }, // 优惠价
  overPrice: { type: Number, default: 0 }, // 实际价格
  sizeCollet: { type: Array, default: [] }, // 商品码数集合
  sizeColletId: { type: String, default: "" }, // 商品码数集合ID
  isDelete: { type: Number, default: 0 }, // 是否显示
  sortIndex: { type: Number, default: 0 }, // 排序
}, { collection: "shoppingList", versionKey: false });
var shoppingModel = db.model("shoppingList", shoppingSchema);

exports.shoppingModel = shoppingModel