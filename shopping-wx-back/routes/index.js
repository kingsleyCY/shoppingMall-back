const users = require('./users')
const commodity = require('./commodity')
const address = require('./address')
const router = require('koa-router')()

router.use('/shop', users.routes(), users.allowedMethods());
router.use('/shop', commodity.routes(), commodity.allowedMethods());
router.use('/shop', address.routes(), address.allowedMethods());

module.exports = router