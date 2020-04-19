const users = require('./users')
const commodity = require('./commodity')
const router = require('koa-router')()

router.use('/shop', users.routes(), users.allowedMethods());
router.use('/shop',commodity.routes(), commodity.allowedMethods());

module.exports = router