import Vue from "vue"
import "es6-promise/auto"
import App from "./App.vue"
import router from "./router"
import moment from "moment"
import VueAxios from "vue-axios"
import axios from "axios"
import Vuex from "vuex"
import VueSocketIO from "vue-socket.io"
import VueMeta from "vue-meta"
import "normalize.css"

Vue.config.productionTip = false

moment.locale("zh-cn")
Vue.prototype.moment = moment
Vue.prototype.random = n => Math.floor(n * Math.random())

Vue.use(Vuex)

Vue.use(VueAxios, axios)

Vue.use(VueMeta)

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: "http://localhost",
  }),
)
const store = new Vuex.Store({
  state: {
    name: "",
    addr: "",
    avatarURL: "",
  },
  mutations: {
    setName(state, username) {
      state.username = username
      localStorage.username = username
    },
    setAddr(state, addr) {
      state.addr = addr
    },
  },
})

new Vue({
  store: store,
  router: router,
  render: h => h(App),
}).$mount("#app")
