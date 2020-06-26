var activitySchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  id: String,
  title: String, //
  sTime: Number, //
  eTime: Number, //
  prizeId: String, //
  prizeDeatil: Object, // 奖品详情
  isDelete: { type: Number, default: 0 },
  status: Number, // 0初始化 1未开始 2已开始 3已结束
  scheduleStartModel: Object, // 定时任务
  scheduleEndModel: Object, // 定时任务
  resultId: { type: String, default: "" }, //抽奖结果
  activNun: { type: Number, default: 0 },
  end_time: { type: Number, default: 0 },
  endCode: { type: String, default: "" }, // 中奖码
  winUerId: { type: String, default: "" }, // 中奖人ID
  additionNum: { type: Number, default: 0 }, // 新加人数
}, { collection: "activityList", versionKey: false });
var activityModel = db.model("activityList", activitySchema);

exports.activityModel = activityModel