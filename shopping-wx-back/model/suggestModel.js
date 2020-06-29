var suggestSchema = new mongoose.Schema({
  created_time: Number,
  id: String,
  content: String,
  userId: String,
  type: Number
}, { collection: "suggestList", versionKey: false });
var suggestModel = db.model("suggestList", suggestSchema);

exports.suggestModel = suggestModel