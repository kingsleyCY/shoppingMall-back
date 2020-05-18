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
}
Object.assign(baseCommon, localData)
console.log(baseCommon);

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