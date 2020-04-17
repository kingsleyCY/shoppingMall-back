var userSchema = new mongoose.Schema({
  userId: String, // 用户ID
  created_time: Number,
  weUserInfo: Object, // 绑定的微信信息{avatarUrl、city、country、gender、language、nickName、province}
  openId: String, // 绑定的微信openId
  recommendId: String, // 推荐人的userId
}, { collection: "userList" });
var userModel = db.model("userList", userSchema);

/*exports.creatUser = function (param, callback) {
  userModel.create(param, function (err, doc) {
    if (err) throw err
    callback(doc)
  })
}*/
exports.creatUser = async function (param, callback) {
  const user = await new Promise((resolve, reject) => {
    userModel.create(param, function (err, doc) {
      if (err) throw err
      resolve(doc)
    })
  })
  return user
}

function findUserBykey(keys, value) {
  return new Promise((resolve, reject) => {

  })
}