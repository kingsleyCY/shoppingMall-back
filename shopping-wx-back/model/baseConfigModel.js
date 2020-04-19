var baseConfigSchema = new mongoose.Schema({
  classify: String,
  content: Object
}, { collection: "baseConfig" });
var baseConfigModel = db.model("baseConfig", baseConfigSchema);

exports.baseConfigModel = baseConfigModel