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
Vue.use(Input)

export default {
  username: "login",
  data() {
    return {
      username: "",
    }
  },
  methods: {
    login() {
      console.log(this.username)
      if (this.username === "") {
        return
      }
      this.$store.commit("setName", this.username)
      this.$router.push("Chatting")
    },
  },
}
</script>
<style lang="less">
.login {
  margin-top: 45vh;
}
.input {
  padding: 0 1rem 0 1rem;
}
</style>
