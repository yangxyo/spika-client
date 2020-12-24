import "es6-promise/auto"
import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import Vuex from "vuex"
import store from "./store"
import axios from "axios"
import VueAxios from "vue-axios"
import { io } from "socket.io-client"
import VueSocketIOExt from "vue-socket.io-extended"
import VueMeta from "vue-meta"
import moment from "moment"
import "normalize.css"

Vue.config.productionTip = false

moment.locale("zh-cn")
Vue.prototype.moment = moment
const apiBaseURL = process.env.VUE_APP_API_BASE_URL
const socketURL = process.env.VUE_APP_SOCKET_URL
const socket = io(socketURL, {
  transports: ["websocket"],
  "force new connection": true,
})

Vue.use(Vuex)
Vue.use(VueAxios, axios)
axios.defaults.baseURL = apiBaseURL
Vue.use(VueMeta)
Vue.use(VueSocketIOExt, socket, { store })

new Vue({
  store: store,
  router: router,
  render: h => h(App),
}).$mount("#app")
