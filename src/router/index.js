import Vue from "vue"
import Router from "vue-router"
import Login from "../views/Login.vue"
import Chatting from "../views/Chatting.vue"

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: "/",
      name: "Login",
      component: Login,
    },
    {
      path: "/chatting",
      name: "Chatting",
      component: Chatting,
    },
  ],
})

export default router
