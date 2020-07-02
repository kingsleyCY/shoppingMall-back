var sizeSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  title: { type: String, default: "" },
  id: String,
  sizes: { type: Array, default: [] }
}, { collection: "sizeList", versionKey: false });
var sizeModel = db.model("sizeList", sizeSchema);

exports.sizeModel = sizeModel