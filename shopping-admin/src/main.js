import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import store from './store/index'
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
      /*<img src='" + el.src + "'/>*/
      ElementUI.MessageBox.alert("<canvas id='myCanvas' ></canvas>", '', {
        dangerouslyUseHTMLString: true,
        closeOnPressEscape: true,
        closeOnClickModal: true,
        customClass: "image-box"
      })
      var myImage2 = new Image();
      myImage2.src = el.src;//二维码图片
      // myImage2.crossOrigin = 'Anonymous';
      myImage2.onload = function () {
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        canvas.width = 240;//图片的宽度
        canvas.height = 280;
        context.drawImage(myImage2, 0, 0, 240, 240);

        context.font = '20px Microsoft YaHei';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        context.fillStyle = '#000000';
        var phoneNumber = el.getAttribute("phoneNumber");
        if (phoneNumber) {
          context.fillText(phoneNumber, 55, 270);
        }
      }
    })
  }
})

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
