var extenCloseSchema = new mongoose.Schema({
  created_time: Number,
  id: String,
  userId: String, // 用户ID
  /*closeLog: { type: Array, default: [] },*/
  price: { type: Number, default: 0 },
  closeNum: { type: Number, default: 0 },
  closelist: { type: Array, default: [] },
  notcloseNum: { type: Number, default: 0 },
  notcloselist: { type: Array, default: [] }
}, { collection: "extenCloseModelList", versionKey: false });
var extenCloseModel = db.model("extenCloseList", extenCloseSchema);

exports.extenCloseModel = extenCloseModel


/* closeLog 说明 */
/*
* 时间     created_time
* 单价     price
* 结算人数 closeNum
* 结算手机号   closelist
* 未结算人数 notcloseNum
* 未结算手机号   notcloselist
*
* */
