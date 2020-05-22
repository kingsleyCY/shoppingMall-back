import axios from 'axios'
import { router } from './../router/index'
import { Message } from 'element-ui'

var instance
if (axios) {
  instance = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "" : "http://119.3.77.140:3000",
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

export function getCustomer(param) {
  return instance({
    url: '/admin/userList/getCustomer',
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

export function getOrderList(param) {
  return instance({
    url: '/admin/order/orderList',
    method: 'post',
    data: param
  })
}
