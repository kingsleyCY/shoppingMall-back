const users = require('./users')
const router = require('koa-router')()

router.use(users.routes(), users.allowedMethods());

module.exports = router