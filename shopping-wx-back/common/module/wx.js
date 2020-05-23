var WXBizDataCrypt = require('../WXBizDataCrypt')
var wx = {
  decryptData(session_key, iv, encryptedData) {
    var appId = commons.wx_appid
    var sessionKey = session_key
    var encryptedData = encryptedData
    var iv = iv

    var pc = new WXBizDataCrypt(appId, sessionKey)

    var data = pc.decryptData(encryptedData, iv)

    console.log('解密后 data: ', data)
    return data.phoneNumber
  }
}
module.exports = wx