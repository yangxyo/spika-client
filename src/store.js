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
    addmessages(state, messages) {
      messages instanceof Array
        ? state.messagesList.push(...messages)
        : state.messagesList.push(messages)
    },
    addOldMessages(state, messages) {
      messages instanceof Array
        ? state.messagesList.unshift(...messages)
        : state.messagesList.unshift(messages)
    },
    setToken(state, token) {
      state.token = token
    },
  },
  actions: {
    socket_newMessage({ commit }, message) {
      if (message.message) {
        commit("addmessages", message)
      }
    },
  },
})
