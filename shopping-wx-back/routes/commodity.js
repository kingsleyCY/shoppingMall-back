const router = require('koa-router')()
const qs = require('querystring');
var baseConfig = require('../common/baseConfig')

/* 绑定用户获取openID */
/*
* params:
* code: 小程序登录时获取的 code
*
* */
router.get('/', async (ctx) => {

})

module.exports = router
