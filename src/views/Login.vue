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
      required
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
  data() {
    return { username: "" }
  },
  methods: {
    login() {
      if (this.username === "") {
        alert("输入为空")
        return
      }
      this.axios.post("/user/login", this.loginParam).then(response => {
        if (response.status == 200 && response.data.code == 1) {
          const user = response.data.data.user
          this.$store.commit("setUser", {
            userID: user.userID,
            name: user.name,
            avatarURL: user.avatarURL,
            token: user.token,
          })
          this.$router.push("Chatting")
        } else {
          console.log("login response error")
        }
      })
    },
  },
  computed: {
    loginParam() {
      return {
        name: this.username,
        avatarURL: this.username.slice(0, 1).toUpperCase(),
        roomID: roomID,
        userID: this.$uuid.v5(this.username, NAMESPACE),
      }
    },
  },
}
</script>
<style lang="less">
.login {
  padding-top: 45vh;
}
.input {
  padding: 0 0.75rem;
}
@media screen and (min-device-width: 400px) {
  .input {
    padding: 0 10rem;
  }
}
</style>
