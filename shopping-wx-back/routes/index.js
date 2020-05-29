const router = require('koa-router')();

const activity = require('./wx/activity');
const address = require('./wx/address');
const commodity = require('./wx/commodity');
const suggest = require('./wx/suggest');
const users = require('./wx/users');
const order = require('./wx/order');

router.use('/shop', activity.routes(), activity.allowedMethods());
router.use('/shop', address.routes(), address.allowedMethods());
router.use('/shop', commodity.routes(), commodity.allowedMethods());
router.use('/shop', suggest.routes(), suggest.allowedMethods());
router.use('/shop', users.routes(), users.allowedMethods());
router.use('/shop', order.routes(), order.allowedMethods());

const adminActivity = require('./admin/activity');
const adminClassify = require('./admin/classify');
const adminCommodity = require('./admin/commodity');
const adminOrder = require('./admin/order');
const adminUser = require('./admin/userList');

router.use('/admin/activity', adminActivity.routes(), adminActivity.allowedMethods());
router.use('/admin/classify', adminClassify.routes(), adminClassify.allowedMethods());
router.use('/admin/commodity', adminCommodity.routes(), adminCommodity.allowedMethods());
router.use('/admin/order', adminOrder.routes(), adminOrder.allowedMethods());
router.use('/admin/userList', adminUser.routes(), adminUser.allowedMethods());

module.exports = router