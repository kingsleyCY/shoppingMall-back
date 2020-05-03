import axios from 'axios'
// import { Message } from 'element-ui'

var instance
if (axios) {
  instance = axios.create({
    baseURL: "",
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