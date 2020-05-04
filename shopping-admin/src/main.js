import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import { router } from './router'
import './assets/main.scss'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
import VueCropper from 'vue-cropper'
Vue.use(VueCropper)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
