var redis = require("redis");

var redis = {
  async getRedis(key) {
    return await new Promise((resolve, reject) => {
      client.get(key, function (err, data) {
        if (err) {
          resolve("")
        } else {
          resolve(data);
        }
      })
    })
  },
  async setRedis(key, value) {
    await client.set(key, value);
    await client.expire(key, 60 * 60 * 24);
  },
  async delRedis(key, arr) {
    for (let i = 0; i < arr.length; i++) {
      await client.del((key ? key + "-" : "") + arr[i]);
    }
  }
}
module.exports = redis