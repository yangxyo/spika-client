<template>
  <div class="chatting">
    <header>
      <a-page-header title="沟通ing" @back="$router.push('/')" />
    </header>
    <dynamic-scroller
      :items="messagesList"
      :min-item-size="54"
      class="scroller"
      ref="scroller"
      role="main"
      key-field="_id"
    >
      <template v-slot="{ item, index, active }">
        <dynamic-scroller-item
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          :data-index="index"
        >
          <!-- self right -->
          <div v-if="self(item.userID)" class="self">
            <div class="self">
              <div class="avatar">
                <a-avatar style="color: #f56a00; backgroundColor: #fde3cf">
                  {{ item.user.avatarURL }}
                </a-avatar>
              </div>
              <div class="content">
                <div class="author">
                  <a class="name">{{ item.user.name }}</a>
                  <a-tooltip class="time" :title="item.created">
                    <span>{{ moment(item.date).fromNow() }}</span>
                  </a-tooltip>
                </div>
                <p class="message">
                  {{ item.message }}
                </p>
              </div>
            </div>
          </div>
          <!-- others left -->
          <a-comment v-else>
            <a slot="author">{{ item.user.name }}</a>
            <a-avatar
              slot="avatar"
              style="color: #f56a00; backgroundColor: #fde3cf"
            >
              {{ item.user.avatarURL }}
            </a-avatar>
            <p slot="content">
              {{ item.message }}
            </p>
            <a-tooltip slot="datetime" :title="item.created">
              <span>{{ moment(item.date).fromNow() }}</span>
            </a-tooltip>
          </a-comment>
        </dynamic-scroller-item>
      </template>
    </dynamic-scroller>
    <footer>
      <a-input-search
        @search="sendMessage"
        enter-button="发送"
        placeholder="input messages"
        size="large"
        v-model.trim="inputContent"
        :maxLength="1000"
        allowClear
      >
      </a-input-search>
    </footer>
  </div>
</template>

<script>
import Vue from "vue"
import { mapState } from "vuex"
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller"
import "vue-virtual-scroller/dist/vue-virtual-scroller.css"
import {
  PageHeader,
  Comment,
  Tooltip,
  Input,
  Avatar,
  Button,
  Row,
  Col,
} from "ant-design-vue"
import CONST from "@/consts.js"

Vue.use(PageHeader)
Vue.use(Comment)
Vue.use(Tooltip)
Vue.use(Input)
Vue.use(Avatar)
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)

const roomID = process.env.VUE_APP_ROOM_ID

export default {
  name: "chatting",
  components: {
    DynamicScroller,
    DynamicScrollerItem,
  },
  data() {
    return {
      msgs: this.msgs || [],
      inputContent: "",
      onContent: {},
      lastTextLength: 0,
    }
  },
  metaInfo: {
    title: "聊天室",
    titleTemplate: "%s - by inspur",
    meta: [
      {
        vmid: "viewport",
        name: "viewport",
        content:
          "width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1, user-scalable=no",
      },
    ],
  },
  watch: {
    inputContent(newData) {
      const len = newData.length
      if (this.lastTextLength === 0 && len > 0) {
        this.$socket.client.emit("sendTyping", {
          roomID: roomID,
          userID: this.user.userID,
          type: CONST.TYPING_ON,
        })
      }
      if (this.lastTextLength > 0 && len === 0) {
        this.$socket.client.emit("sendTyping", {
          roomID: roomID,
          userID: this.user.userID,
          type: CONST.TYPING_OFF,
        })
      }
      this.lastTextLength = len
    },
  },
  computed: {
    ...mapState({
      user: "user",
      messagesList: "messagesList",
    }),
    sendMessageParam() {
      return {
        roomID: roomID,
        userID: this.user.userID,
        type: 1,
        message: this.inputContent,
      }
    },
  },
  methods: {
    self(userID) {
      if (userID === this.user.userID) {
        console.log("self", userID, this.user)
        return true
      } else {
        return false
      }
    },
    scrollToBottom() {
      this.$refs.scroller.scrollToBottom()
    },
    login() {
      if (this.user.userID == "") {
        throw Error("userID is null")
      } else if (roomID == "") {
        throw Error("roomId is null")
      } else {
        this.$socket.client.emit("login", {
          userID: this.user.userID,
          roomID: roomID,
        })
      }
    },
    getMessagesList() {},
    sendMessage() {
      if (this.inputContent === "") {
        alert("输入为空")
        return
      } else if (this.user.userID == "") {
        this.$router.push("/")
      } else {
        this.$socket.client.emit("sendMessage", this.sendMessageParam)
        this.msgs.push(this.showMessage)
        this.inputContent = ""
        setTimeout(() => {
          this.scrollToBottom()
        })
      }
    },
    sendTyping() {
      this.$socket.client.emit("sendTyping", {
        userID: this.user.userID,
        roomID: roomID,
        type: 1,
      })
    },
    openMessage() {
      this.$socket.client.emit("openMessage", {
        userID: this.user.userID,
        messageIDs: [],
      })
    },
  },
  sockets: {
    socketerror(param) {
      if (param.code) {
        console.error("Error", CONST.ERROR_CODES[param.code])
      } else {
        console.error("Error", "Unknown Error")
      }
    },
    newUser(param) {
      // 登陆提示
      param
    },
    userLeft(param) {
      // 退出提示
      param
    },
    newMessage(param) {
      const messageID = param["_id"]
      const openMessageParams = {
        userID: this.user.userID,
        messageIDs: [messageID],
      }
      this.$socket.client.emit("openMessage", openMessageParams)
      setTimeout(() => {
        this.scrollToBottom()
      })
    },
    sendTyping(param) {
      // 输入提示
      param
    },
    login(param) {
      param
    },
    logout(param) {
      param
    },
    messageUpdated(param) {
      param
    },
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!vm.$store.state.user.userID) {
        vm.$router.push("/")
      }
    })
  },

  mounted() {
    this.login()
    setTimeout(() => {
      this.scrollToBottom()
    }, 0)
  },
}
</script>

<style lang="less">
.chatting {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header {
  width: 100%;
  border: 1px solid rgb(235, 237, 240);
  height: 8vh;
}
.scroller {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
}
@media screen and (min-device-width: 400px) {
  .chatting {
    margin: 0 10rem;
  }
  main {
    border: 1px solid #ebedf0;
  }
}
footer {
  bottom: 0;
  height: 6vh;
}
// self right style
.ant-btn-lg {
  border-radius: 0;
}
.item {
  margin: 0, 2rem;
}
.self {
  display: flex;
  flex-direction: row-reverse;
  padding: 1rem 0;
  margin-left: 0;
  line-height: 1.5;
  padding: 1rem 0;
}
.avatar {
  margin-left: 0.75rem;
  cursor: pointer;
  line-height: 1.5;
}
.time {
  color: #ccc;
  white-space: nowrap;
  cursor: auto;
  font-size: 0.75rem;
  line-height: 1.125rem;
  box-sizing: border-box;
  padding-right: 0.5rem;
}
.content {
  display: flex;
  flex-direction: column;
  line-height: 1.5;
}
.author {
  color: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  justify-content: flex-start;
  margin-bottom: 0.25rem;
}
.name {
  font-size: 0.75rem;
  line-height: 1.125rem;
  box-sizing: border-box;
  text-decoration: none;
  outline: none;
  cursor: pointer;
  transition: color 0.3s;
  touch-action: manipulation;
  background-color: transparent;
  color: rgba(0, 0, 0, 0.45);
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.message {
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 1em;
  white-space: pre-wrap;
}
</style>
