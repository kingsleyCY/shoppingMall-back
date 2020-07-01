import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import common from './assets/common'

Vue.use(VueRouter)
import { router } from './router'
import './assets/main.scss'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
import VueCropper from 'vue-cropper'

Vue.use(VueCropper)

Vue.config.productionTip = false
Vue.prototype.common = common;

Vue.directive("image", {
  inserted: function (el, binding) {
    el.style.cursor = "pointer"
    el.addEventListener("click", function () {
      ElementUI.MessageBox.alert("<img src='" + el.src + "'/>", '', {
        dangerouslyUseHTMLString: true,
        closeOnPressEscape: true,
        closeOnClickModal: true,
        customClass: "image-box"
      }).then(res => {
      }).catch(res => {
      });
    })
  }
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
