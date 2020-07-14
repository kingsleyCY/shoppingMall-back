var extractSchema = new mongoose.Schema({
  id: String,
  userId: String, // 用户ID
  type: String, // 用户ID
  created_time: Number,
  status: { type: String, default: "none" },

  selfOrderList: { type: Array, default: [] },
  agentLevel: { type: Number, default: 0 },
  agentModelData: { type: Object, default: {} },

  childOrderList: { type: Array, default: [] },
  grandOrderList: { type: Array, default: [] },
  childProfit: { type: Array, default: [] },

}, { collection: "agentList", versionKey: false });
var extractModel = db.model("agentList", extractSchema);

exports.extractModel = extractModel


/* status 说明 */
/*
* none 初始化
* comfirming 待确认
* over 已完成
*
*
* */
