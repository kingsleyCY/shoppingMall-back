import axios from 'axios'
import { router } from './../router/index'
import { Message } from 'element-ui'

var instance
if (axios) {
  instance = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "" : "http://119.3.189.240:3000",
    timeout: 15000
  });
}
instance.interceptors.request.use(config => {
  if (sessionStorage.getItem("token")) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
    config.headers.Authorization = sessionStorage.getItem("token");
  }
  return config;
}, err => {
  return Promise.reject(err);
});
instance.interceptors.response.use(function (response) {
  if (response.data.code === 1) {
    return response.data
  } else if (response.data.code === 1006) {
    Message.error("登录已过期");
    router.push("/login");
  } else {
    return response.data
  }
}, function (error) {
  // Do something with response error
  return Promise.reject(error)
})

export function loginAdmin(param) {
  return instance({
    url: '/admin/userList/loginAdmin',
    method: 'post',
    data: param
  })
}

/* 获取基本配置参数 */
export function getCommodityList(param) {
  return instance({
    url: '/admin/commodity/commodityList',
    method: 'POST',
    data: param
  })
}

export function getClassifyList() {
  return instance({
    url: '/admin/classify/getClassify',
    method: 'GET'
  })
}

export function addClassify(param) {
  return instance({
    url: '/admin/classify/addClassify',
    method: 'POST',
    data: param
  })
}

export function editClassify(param) {
  return instance({
    url: '/admin/classify/editClassify',
    method: 'POST',
    data: param
  })
}

export function deleteClassify(param) {
  return instance({
    url: '/admin/classify/deleteClassify',
    method: 'POST',
    data: param
  })
}

export function addCommodity(param) {
  return instance({
    url: '/admin/commodity/addCommodity',
    method: 'POST',
    data: param
  })
}

export function setSortIndex(param) {
  return instance({
    url: '/admin/commodity/setSortIndex',
    method: 'POST',
    data: param
  })
}

export function bathExportCommodity(param) {
  return instance({
    url: '/admin/commodity/bathExportCommodity',
    method: 'post',
    headers: {"Content-Type": "multipart/form-data"},
    data: param
  })
}

export function commodityDetail(id) {
  return instance({
    url: '/admin/commodity/commodityDetail',
    method: 'GET',
    params: {id}
  })
}

export function deleCommodity(param) {
  return instance({
    url: '/admin/commodity/deleCommodity',
    method: 'POST',
    data: param
  })
}

export function batchMoveCommdity(param) {
  return instance({
    url: '/admin/commodity/batchMoveCommdity',
    method: 'POST',
    data: param
  })
}

/* 获取首页数据 */
export function getIndexData() {
  return instance({
    url: '/shop/getIndexData',
    method: 'get',
  })
}

/* 获取新品数据 */
export function getNewCommodity(param) {
  return instance({
    url: '/shop/getNewCommodity',
    method: 'post',
    data: param
  })
}

export function updateIndexList(param) {
  return instance({
    url: '/admin/commodity/updateIndexList',
    method: 'post',
    data: param
  })
}

export function getIndexList(param) {
  return instance({
    url: '/admin/commodity/getIndexList',
    method: 'post',
    data: param
  })
}

export function commodityAddition(param) {
  return instance({
    url: '/admin/commodity/commodityAddition',
    method: 'post',
    data: param
  })
}

export function bathSetPrice(param) {
  return instance({
    url: '/admin/commodity/bathSetPrice',
    method: 'post',
    data: param
  })
}

export function getCustomer(param) {
  return instance({
    url: '/admin/userList/getCustomer',
    method: 'post',
    data: param
  })
}

export function getProxy(param) {
  return instance({
    url: '/admin/userList/getProxy',
    method: 'post',
    data: param
  })
}

export function setMark(param) {
  return instance({
    url: '/admin/userList/setMark',
    method: 'post',
    data: param
  })
}

export function setQrcode(param) {
  return instance({
    url: '/admin/userList/setQrcode',
    method: 'post',
    data: param
  })
}

export function getProxyOrder(param) {
  return instance({
    url: '/admin/userList/getProxyOrder',
    method: 'post',
    data: param
  })
}

export function closeExtened(param) {
  return instance({
    url: '/admin/userList/closeExtened',
    method: 'post',
    data: param
  })
}

export function closeExtenedLog(param) {
  return instance({
    url: '/admin/userList/closeExtenedLog',
    method: 'post',
    data: param
  })
}

export function creatActivity(param) {
  return instance({
    url: '/admin/activity/creatActivity',
    method: 'post',
    data: param
  })
}

export function getActiList(param) {
  return instance({
    url: '/admin/activity/getActiList',
    method: 'post',
    data: param
  })
}

export function deleActivity(param) {
  return instance({
    url: '/admin/activity/deleActivity',
    method: 'post',
    data: param
  })
}

export function overActivity(param) {
  return instance({
    url: '/admin/activity/overActivity',
    method: 'post',
    data: param
  })
}

export function addAddition(param) {
  return instance({
    url: '/admin/activity/addAddition',
    method: 'post',
    data: param
  })
}

export function getOrderList(param) {
  return instance({
    url: '/admin/order/orderList',
    method: 'post',
    data: param
  })
}

export function checkOrderToBus(param) {
  return instance({
    url: '/admin/order/checkOrderToBus',
    method: 'post',
    data: param
  })
}

export function setMail(param) {
  return instance({
    url: '/admin/order/setMail',
    method: 'post',
    data: param
  })
}

export function exportOrder(param) {
  return instance({
    url: '/admin/order/exportOrder',
    method: 'post',
    data: param
  })
}

export function getCounponList(param) {
  return instance({
    url: '/admin/coupon/getCounponList',
    method: 'post',
    data: param
  })
}

export function createdCoupon(param) {
  return instance({
    url: '/admin/coupon/createdCoupon',
    method: 'post',
    data: param
  })
}

export function deleteCoupon(param) {
  return instance({
    url: '/admin/coupon/deleteCoupon',
    method: 'post',
    data: param
  })
}

export function couponBindUser(param) {
  return instance({
    url: '/admin/coupon/couponBindUser',
    method: 'post',
    data: param
  })
}

export function getCouponBindUser(param) {
  return instance({
    url: '/admin/coupon/getCouponBindUser',
    method: 'post',
    data: param
  })
}

export function delCouponBindUser(param) {
  return instance({
    url: '/admin/coupon/delCouponBindUser',
    method: 'post',
    data: param
  })
}

export function afterSalesSetMail(param) {
  return instance({
    url: '/admin/afterSales/setMail',
    method: 'post',
    data: param
  })
}

export function applyRefound(param) {
  return instance({
    url: '/admin/afterSales/applyRefound',
    method: 'post',
    data: param
  })
}

export function setExchangeMail(param) {
  return instance({
    url: '/admin/afterSales/setExchangeMail',
    method: 'post',
    data: param
  })
}

export function overOrder(param) {
  return instance({
    url: '/admin/afterSales/overOrder',
    method: 'post',
    data: param
  })
}

export function applyAfter(param) {
  return instance({
    url: '/admin/afterSales/applyAfter',
    method: 'post',
    data: param
  })
}

export function getSuggestList(param) {
  return instance({
    url: '/admin/suggest/getSuggestList',
    method: 'post',
    data: param
  })
}

export function pushMessList(param) {
  return instance({
    url: '/admin/mess/pushMessList',
    method: 'post',
    data: param
  })
}

export function addPushMess(param) {
  return instance({
    url: '/admin/mess/addPushMess',
    method: 'post',
    data: param
  })
}

export function delPushMess(param) {
  return instance({
    url: '/admin/mess/delPushMess',
    method: 'post',
    data: param
  })
}

export function changPushMessStatus(param) {
  return instance({
    url: '/admin/mess/changPushMessStatus',
    method: 'post',
    data: param
  })
}

export function addCollet(param) {
  return instance({
    url: '/admin/sizeCollet/addCollet',
    method: 'post',
    data: param
  })
}

export function getCollet(param) {
  return instance({
    url: '/admin/sizeCollet/getCollet',
    method: 'post',
    data: param
  })
}

export function delCollet(param) {
  return instance({
    url: '/admin/sizeCollet/delCollet',
    method: 'post',
    data: param
  })
}

export function editAgent(param) {
  return instance({
    url: '/admin/agent/editAgent',
    method: 'post',
    data: param
  })
}

export function getAgent(param) {
  return instance({
    url: '/admin/agent/getAgent',
    method: 'get',
    data: param
  })
}

export function delAgent(param) {
  return instance({
    url: '/admin/agent/delAgent',
    method: 'post',
    data: param
  })
}
