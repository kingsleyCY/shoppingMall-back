import Router from 'vue-router'

export const router = new Router({
  mode: "history",
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/index',
      hidden: true
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
