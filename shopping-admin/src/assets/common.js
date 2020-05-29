class baseCommon {
  /* 时间戳转换成时间格式 */
  timeTransfer(data, arr) {
    function add0(m) {
      return m < 10 ? '0' + m : m
    }
    var time = new Date(data);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    if (arr) {
      return [y, Number(add0(m)), Number(add0(d)), Number(add0(h)), Number(add0(mm)), Number(add0(s))]
    } else {
      return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
    }
  }
}
module.exports = new baseCommon()