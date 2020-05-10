var activitySchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  id: String,
  title: String, //
  sTime: Number, //
  eTime: Number, //
  prizeId: String, //
  prizeDeatil: Object,
  isDelete: { type: Number, default: 0 },
  status: Number, // 1未开始 2已开始 3已过期 4已作废/删除
}, { collection: "activityList" });
var activityModel = db.model("activityList", activitySchema);

exports.activityModel = activityModel