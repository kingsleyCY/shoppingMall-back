var classifySchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  update_time: Number, // 更新时间
  title: { type: String, default: "" },
  id: String, // 1  1-1  1-1-1
  parentId: { type: String, default: "0" },
  level: { type: Number, default: 1 },
  logo: { type: String, default: "" },
}, { collection: "classifyTree", versionKey: false });
var classifyModel = db.model("classifyTree", classifySchema);

exports.classifyModel = classifyModel