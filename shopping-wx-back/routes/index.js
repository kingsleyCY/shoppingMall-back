const users = require('./wx/users')
const commodity = require('./wx/commodity')
const address = require('./wx/address')
const other = require('./wx/other')
const admin = require('./wx/admin')
const router = require('koa-router')()

router.use('/shop', users.routes(), users.allowedMethods());
router.use('/shop', commodity.routes(), commodity.allowedMethods());
router.use('/shop', address.routes(), address.allowedMethods());
router.use('/shop', other.routes(), other.allowedMethods());


router.use('/shop', admin.routes(), admin.allowedMethods());

module.exports = router