import Router from 'vue-router'

const mainRouter = [
  {
    path: 'commidity',
    name: 'commidity',
    tilte: '商品管理',
    component: resolve => require(['@/view/commidity'], resolve),
  },
  {
    path: 'addcommidity',
    name: 'addcommidity',
    tilte: '添加管理',
    component: resolve => require(['@/view/commidity/add'], resolve),
    hidden: true
  },
  {
    path: 'sortcommidity',
    name: 'sortcommidity',
    tilte: '商品排序',
    component: resolve => require(['@/view/commidity/sort'], resolve),
    hidden: true
  },
  {
    path: 'classify',
    name: 'classify',
    tilte: '分类管理',
    component: resolve => require(['@/view/classify'], resolve),
  },
  {
    path: 'indexManage',
    name: 'indexManage',
    tilte: '首页管理',
    component: resolve => require(['@/view/indexManage'], resolve),
  },
  {
    path: 'proxyList',
    name: 'proxyList',
    tilte: '代理管理',
    component: resolve => require(['@/view/proxyList'], resolve),
  },
  {
    path: 'userList',
    name: 'userList',
    tilte: '用户列表',
    component: resolve => require(['@/view/userList'], resolve),
  },
  {
    path: 'activityList',
    name: 'activityList',
    tilte: '活动列表',
    component: resolve => require(['@/view/activityList'], resolve),
  },
  {
    path: 'orderList',
    name: 'orderList',
    tilte: '订单列表',
    component: resolve => require(['@/view/orderList'], resolve),
  },
  {
    path: 'couponList',
    name: 'couponList',
    tilte: '优惠券列表',
    component: resolve => require(['@/view/couponList'], resolve),
  },
  {
    path: 'suggest',
    name: 'suggest',
    tilte: '投诉建议',
    component: resolve => require(['@/view/suggest'], resolve),
  },
  {
    path: 'pushMess',
    name: 'pushMess',
    tilte: '消息推送',
    component: resolve => require(['@/view/pushMess'], resolve),
  },
  {
    path: 'sizeCollet',
    name: 'sizeCollet',
    tilte: '尺码集合',
    component: resolve => require(['@/view/sizeCollet'], resolve),
  },
]


const router = new Router({
  mode: "history",
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/login',
      hidden: true
    },
    {
      path: '/login',
      name: 'login',
      hidden: true,
      component: resolve => require(['@/view/login'], resolve),
    },
    {
      path: '/admin_html',
      name: 'admin',
      tilte: '',
      component: resolve => require(['@/view/index'], resolve),
      children: [
        ...mainRouter
      ]
    },
    {
      path: '/404',
      name: 'error-page',
      tilte: '错误',
      index: '2-0',
      component: resolve => require(['@/view/404'], resolve),
      hidden: true
    }
  ]
})

export {
  router,
  mainRouter
}
