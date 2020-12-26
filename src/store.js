import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      name: "",
      avatarURL: "",
      token: "",
      userID: "",
    },
    messagesList: [],
    token: "",
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    messagesList(state, message) {
      state.messagesList.push(message)
    },
    setToken(state, token) {
      state.token = token
    },
  },
  actions: {
    socket_newMessage({ commit }, message) {
      if (message.message) {
        commit("messagesList", message)
      }
    },
  },
})
