var baseConfigSchema = new mongoose.Schema({
  classify: String,
  content: Object
}, { collection: "baseConfig", versionKey: false });
var baseConfigModel = db.model("baseConfig", baseConfigSchema);

exports.baseConfigModel = baseConfigModel