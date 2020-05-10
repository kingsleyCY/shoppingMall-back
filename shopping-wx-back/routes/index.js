const users = require('./wx/users')
const commodity = require('./wx/commodity')
const address = require('./wx/address')
const other = require('./wx/other')
const admin = require('./admin/admin')
const order = require('./admin/order')
const activity = require('./admin/activity')
const router = require('koa-router')()

router.use('/shop', users.routes(), users.allowedMethods());
router.use('/shop', commodity.routes(), commodity.allowedMethods());
router.use('/shop', address.routes(), address.allowedMethods());
router.use('/shop', other.routes(), other.allowedMethods());


router.use('/shop', admin.routes(), admin.allowedMethods());
router.use('/shop', order.routes(), order.allowedMethods());
router.use('/shop', activity.routes(), activity.allowedMethods());

module.exports = router