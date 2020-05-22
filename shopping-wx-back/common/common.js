var fs = require("fs");

var localData = fs.readFileSync("./common/data.json", 'utf-8');
localData = JSON.parse(localData)
var baseCommon = {
  jsonBack(code, date, mess) {
    return {
      code: code,
      data: date,
      mess: mess
    }
  },
  /* 生成随机用户ID */
  generateId() {
    const en_arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'e', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'w', 'v', 'u', 'x', 'y', 'z']
    let num1 = Math.floor(Math.random() * en_arr.length + 1);
    let num2 = Math.floor(Math.random() * en_arr.length + 1);
    return (Math.random() * 10000000).toString(16).substr(0, 4) + (en_arr[num1] ? en_arr[num1] : 'a') + (new Date()).getTime().toString().substr(0, 10) + (en_arr[num2] ? en_arr[num2] : 'a') + Math.random().toString().substr(2, 5);
  },
  /* 判断参数存在性 */
  judgeParamExists(arr, body) {
    let flag = true
    for (let i = 0; i < arr.length; i++) {
      if (!body[arr[i]]) {
        flag = false
      }
    }
    return flag
  },
  /* 删除对象指定key */
  deleteKey(obj, arr) {
    let newObj = JSON.parse(JSON.stringify(obj))
    for (let i = 0; i < arr.length; i++) {
      delete newObj[arr[i]]
    }
    return newObj
  },
  async getAccesstoken() {
    var content = qs.stringify({
      appid: commons.wx_appid,
      secret: commons.wx_secret,
      grant_type: 'client_credential'
    });
    const options = 'https://api.weixin.qq.com/cgi-bin/token?' + content;
    let access_token = await new Promise((resolve, reject) => {
      https.get(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
          resolve(JSON.parse(d));
        });
      }).on('error', (e) => {
        reject("")
      });
    })
    return access_token
  },
  async setQrcode(token, scene, catalog) {
    const post_data = JSON.stringify({
      scene: String(scene)
    });
    let options = url.parse(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`);
    options = Object.assign(options, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': post_data.length,
      }
    });
    const imgBuffer = await new Promise((resolve, reject) => {
      let req = https.request(options, (res) => {
        let resData = '';
        res.setEncoding("binary");
        res.on('data', data => {
          resData += data;
        });
        res.on('end', () => {
          const imgBuffer = Buffer.from(resData, 'binary')
          var fileName = 'shop/' + catalog + '/' + (Date.parse(new Date()) / 1000) + '-' + scene + '.jpg';
          ossClient.put(fileName, imgBuffer).then(res => {
            resolve(res)
          })
        });
      });
      req.on('error', (e) => {
        reject("")
      });
      req.write(post_data);
      req.end();
    })
    return imgBuffer
  }
}
Object.assign(baseCommon, localData)

module.exports = baseCommon
/* code 说明 */
const codeObj = {
  1: "操作成功",
  1001: "用户未登录绑定",
  1002: "查询数据库失败，无此项",
  1003: "参数错误",
  1004: "请求错误",
  1005: "该操作已执行",
  1006: "token验证失效",
  1009: "服务器响应失败",
}
/* ctx.throw(200, commons.jsonBack(1001, {}, "测试文字")) */