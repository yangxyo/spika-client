import Vue from "vue"
import "es6-promise/auto"
import App from "./App.vue"
import router from "./router"
import moment from "moment"
import VueAxios from "vue-axios"
import axios from "axios"
import Vuex from "vuex"
import "normalize.css"

Vue.config.productionTip = false

moment.locale("zh-cn")
Vue.prototype.moment = moment
Vue.prototype.random = n => Math.floor(n * Math.random())

Vue.use(Vuex)

Vue.use(VueAxios, axios)

const store = new Vuex.Store({
  state: {
    name: "",
    avatarURL: `http://omratag7g.bkt.clouddn.com/icon-avatar${Vue.prototype.random(
      21,
    )}.svg`,
    addr: "",
    isShowAbout: false,
  },
  mutations: {
    setName(state, name) {
      state.name = name
    },
    setAddr(state, addr) {
      state.addr = addr
    },
    showAbout(state, flag) {
      state.isShowAbout = flag
    },
  },
})

new Vue({
  store: store,
  router: router,
  render: h => h(App),
}).$mount("#app")
