<template>
  <div class="login">
    <a-alert
      v-if="alertStatus"
      message="错误输入"
      description="用户名不能为空"
      type="error"
      closable
      @close="onAlertClose"
      class="alertError"
    />
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
import { Input, Alert } from "ant-design-vue"
import UUID from "vue-uuid"

const roomID = process.env.VUE_APP_ROOM_ID
const NAMESPACE = "65f9af5d-f23f-4065-ac85-da725569fdcd"

Vue.use(Input)
Vue.use(Alert)
Vue.use(UUID)

export default {
  data() {
    return { alertStatus: 0, username: "" }
  },
  methods: {
    onAlertClose() {
      this.alertStatus = 0
    },
    login() {
      if (this.username == "") {
        this.alertStatus = 1
        return
      }
      this.axios
        .post("/user/login", this.loginParam)
        .then(response => {
          if (response.status == 200 && response.data.code == 1) {
            const user = response.data.data.user
            this.$store.commit("setUser", {
              userID: user.userID,
              name: user.name,
              avatarURL: user.avatarURL,
              token: user.token,
            })
            this.$store.commit("setToken", response.data.data.token)
            this.axios.defaults.headers.common[
              "access-token"
            ] = this.$store.state.token
            this.$router.push("Chatting")
          } else {
            console.error("login response error")
          }
        })
        .catch(err => {
          throw Error(err)
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
  height: 100%;
  position: relative;
}
.input {
  margin-top: 20rem;
  padding: 0 0.75rem;
}
.alertError {
  position: absolute;
  left: 50%;
  margin-left: -8rem;
  top: 10rem;
  width: 16rem;
}
@media screen and (min-device-width: 400px) {
  .input {
    padding: 0 10rem;
  }
}
</style>
