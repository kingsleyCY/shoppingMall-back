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
]


const router = new Router({
  mode: "history",
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/admin/commidity',
      hidden: true
    },
    {
      path: '/admin',
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
