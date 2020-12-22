import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: "",
    avatarURL: "",
    roomID: "",
    token: "",
    userID: "",
    message: {},
    ERROR_CODES: {
      1000001: "Name is not provided.",
      1000002: "Room ID is not provided.",
      1000003: "User ID is not provided.",
      1000004: "Room ID is not provided.",
      1000005: "Roomo ID is not provided.",
      1000006: "Last Meesage ID is not provided.",
      1000007: "File not provided.",
      1000008: "Room ID not provided.",
      1000009: "User ID is not provided.",
      1000010: "Type is not provided.",
      1000011: "File is not provided.",
      1000012: "Unknown Error",
      1000013: "User ID is not provided.",
      1000014: "Message ID is not provided.",
      1000015: "Room ID is not provided.",
      1000016: "User ID is not provided.",
      1000017: "Type is not provided.",
      1000018: "Message is not provided.",
      1000019: "Location is not provided.",
      1000020: "Failed to send message.",
      1000027: "Invalid token",
    },
  },
  mutations: {
    setName(state, username) {
      state.username = username
      localStorage.username = username
    },
    setAvatarURL(state, avatarURL) {
      state.avatarURL = avatarURL
      localStorage.avatarURL = avatarURL
    },
    setToken(state, token) {
      state.taken = token
      localStorage.token = token
    },
    setRoomID(state, roomID) {
      state.roomID = roomID
      localStorage.roomID = roomID
    },
    setUserID(state, userID) {
      state.userID = userID
      localStorage.userID = userID
    },
    sendMessage(state, message) {
      console.log("m", message)
      state.message = message
      localStorage.message = message
    },
  },
  actions: {
    socket_sendMessage({ commit }, message) {
      console.log("a", message)
      commit("sendMessage", message)
    },
  },
})
