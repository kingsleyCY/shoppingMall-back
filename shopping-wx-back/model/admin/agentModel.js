var agentSchema = new mongoose.Schema({
  id: String, // 1  1-1  1-1-1
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  title: { type: String, default: "" },
  parentId: { type: String, default: "0" },
  level: { type: Number, default: 1 },

  agentType: { type: String, default: "price" },
  agentModelData: { type: Array, default: [] },
  childProfit: { type: Array, default: [] }, // 子类盈利收益
}, { collection: "agentTree", versionKey: false });
var agentModel = db.model("agentTree", agentSchema);

exports.agentModel = agentModel

/* agentType 说明 */
/*
* price 定价
* proportion 比例
* pickGoods 拿货
*
* */

/* agentModelData 说明 */
/*
{
  num: 5,
  price: 100,
}
* */