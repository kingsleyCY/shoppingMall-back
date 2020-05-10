import axios from 'axios'
// import { Message } from 'element-ui'

var instance
if (axios) {
  instance = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "" : "http://119.3.77.140:3000",
    timeout: 15000
  });
}
instance.interceptors.response.use(function (response) {
  if (response.data.code === 1) {
    return response.data
  } else {
    return response.data
  }
}, function (error) {
  // Do something with response error
  return Promise.reject(error)
})


/* 获取基本配置参数 */
export function getCommodityList(param) {
  return instance({
    url: '/shop/commodityList',
    method: 'POST',
    data: param
  })
}

export function getClassifyList() {
  return instance({
    url: '/shop/getClassify',
    method: 'GET'
  })
}

export function addClassify(param) {
  return instance({
    url: '/shop/addClassify',
    method: 'POST',
    data: param
  })
}

export function editClassify(param) {
  return instance({
    url: '/shop/editClassify',
    method: 'POST',
    data: param
  })
}

export function deleteClassify(param) {
  return instance({
    url: '/shop/deleteClassify',
    method: 'POST',
    data: param
  })
}

export function addCommodity(param) {
  return instance({
    url: '/shop/addCommodity',
    method: 'POST',
    data: param
  })
}

export function commodityDetail(id) {
  return instance({
    url: '/shop/commodityDetail',
    method: 'GET',
    params: { id }
  })
}

export function deleCommodity(param) {
  return instance({
    url: '/shop/deleCommodity',
    method: 'POST',
    data: param
  })
}

export function getIndexData() {
  return instance({
    url: '/shop/getIndexData',
    method: 'get',
  })
}

export function getNewCommodity(param) {
  return instance({
    url: '/shop/getNewCommodity',
    method: 'post',
    data: param
  })
}

export function updateIndexList(param) {
  return instance({
    url: '/shop/updateIndexList',
    method: 'post',
    data: param
  })
}

export function getCustomer(param) {
  return instance({
    url: '/shop/getCustomer',
    method: 'post',
    data: param
  })
}

export function setQrcode(param) {
  return instance({
    url: '/shop/setQrcode',
    method: 'post',
    data: param
  })
}

export function getProxyOrder(param) {
  return instance({
    url: '/shop/getProxyOrder',
    method: 'post',
    data: param
  })
}

export function creatActivity(param) {
  return instance({
    url: '/shop/creatActivity',
    method: 'post',
    data: param
  })
}

export function getActiList(param) {
  return instance({
    url: '/shop/getActiList',
    method: 'post',
    data: param
  })
}