<template>
  <div class="login">
    <a-input-search
      class="input"
      id="username"
      enterButton="提交"
      v-model.trim="username"
      type="text"
      :maxLength="10"
      size="large"
      @search="login"
      placeholder="用户名"
      autoFocus
      allowClear
    >
    </a-input-search>
  </div>
</template>

<script>
import Vue from "vue"
import { Input } from "ant-design-vue"
import UUID from "vue-uuid"

const roomID = process.env.VUE_APP_ROOM_ID
const NAMESPACE = "65f9af5d-f23f-4065-ac85-da725569fdcd"

Vue.use(Input)
Vue.use(UUID)

export default {
  username: "login",
  data() {
    return { username: "" }
  },
  methods: {
    login() {
      if (this.username === "") {
        throw Error("用户名为空")
      }
      const avatarURL = this.username.slice(0, 1).toUpperCase()
      const userID = this.$uuid.v5(this.username, NAMESPACE)
      this.axios
        .post("/user/login", {
          name: this.username,
          avatarURL: avatarURL,
          roomID: roomID,
          userID: userID,
        })
        .then(response => {
          this.$store.commit("setToken", response.data.data.token)
        })
      this.$store.commit("setName", this.username)
      this.$store.commit("setAvatarURL", avatarURL)
      this.$store.commit("setRoomID", roomID)
      this.$store.commit("setUserID", userID)
      this.$router.push("Chatting")
    },
  },
}
</script>
<style lang="less">
.login {
  padding-top: 45vh;
}
@media screen and (min-device-width: 400px) {
  .input {
    padding: 0 10rem;
  }
}
</style>
