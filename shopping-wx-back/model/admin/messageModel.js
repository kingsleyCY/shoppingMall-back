var messageSchema = new mongoose.Schema({
  created_time: Number, // 创建时间
  id: String,
  content: String,
  sortIndex: { type: Number, default: 0 },
  isShow: { type: Number, default: 1 },
  isDel: { type: Number, default: 0 },
}, { collection: "messageList", versionKey: false });
var messageModel = mongoose.model("messageList", messageSchema);

exports.messageModel = messageModel