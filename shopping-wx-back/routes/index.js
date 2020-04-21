const users = require('./users')
const commodity = require('./commodity')
const address = require('./address')
const other = require('./other')
const router = require('koa-router')()

router.use('/shop', users.routes(), users.allowedMethods());
router.use('/shop', commodity.routes(), commodity.allowedMethods());
router.use('/shop', address.routes(), address.allowedMethods());
router.use('/shop', other.routes(), other.allowedMethods());

module.exports = router