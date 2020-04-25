var userSchema = new mongoose.Schema({
  userId: String, // 用户ID
  created_time: Number,
  // weUserInfo: Object, // 绑定的微信信息{avatarUrl、city、country、gender、language、nickName、province}
  openId: String, // 绑定的微信openId
  recommendId: { type: String, default: '' }, // 推荐人的userId
  defaultAddress: { type: String, default: '' },
  phone: { type: String, default: '' }, // 手机号
}, { collection: "userList" });
var userModel = db.model("userList", userSchema);

exports.creatUser = async function (param) {
  const user = await new Promise((resolve, reject) => {
    userModel.create(param, function (err, doc) {
      if (err) throw err
      resolve(doc)
    })
  })
  return user
}

exports.findUser = async function (param) {
  const user = await new Promise((resolve, reject) => {
    userModel.findOne(param, function (err, doc) {
      if (err) throw err
      if (doc) {
        resolve(doc)
      } else {
        resolve('')
      }
    })
  })
  return user
}