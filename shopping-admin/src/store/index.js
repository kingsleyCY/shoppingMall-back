import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isPC: true
  },
  mutations: {
    changeIsPc(state, value) {
      state.isPC = value
    }
  }
})