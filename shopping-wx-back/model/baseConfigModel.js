var baseConfigSchema = new mongoose.Schema({
  hotList: { type: Array, default: [] }, // 热款列表
  explosiveList: { type: Array, default: [] }, // 爆款列表
  bannerList: { type: Array, default: [] }, // banner列表
  newsList: { type: Array, default: [] }, // 新品列表
  rebateList: { type: Array, default: [] }, // 折扣款列表
  type: String
}, { collection: "baseConfig", versionKey: false });
var baseConfigModel = db.model("baseConfig", baseConfigSchema);

exports.baseConfigModel = baseConfigModel