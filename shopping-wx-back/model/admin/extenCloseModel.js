var extenCloseSchema = new mongoose.Schema({
  created_time: Number,
  id: String,
  userId: String, // 用户ID
  closeLog: { type: Array, default: [] },



}, { collection: "extenCloseModelList", versionKey: false });
var extenCloseModel = db.model("extenCloseList", extenCloseSchema);

exports.extenCloseModel = extenCloseModel


/* closeLog 说明 */
/*
* 结算人数 closeNum
* 手机号   list
* 时间     created_time
* 单价     price
*
* */
