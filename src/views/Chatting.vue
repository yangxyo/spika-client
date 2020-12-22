<template>
  <div class="chatting">
    <header>
      <a-page-header title="沟通ing" @back="$router.push('/')" />
    </header>
    <main>
      <dynamic-scroller
        :items="msgs"
        :min-item-size="54"
        class="scroller"
        ref="scroller"
        role="main"
      >
        <template v-slot="{ item, index, active }">
          <dynamic-scroller-item
            :item="item"
            :active="active"
            :size-dependencies="[item.content]"
            :data-index="index"
          >
            <!-- self right -->
            <div v-if="item.self" class="self">
              <div class="self">
                <div class="avatar">
                  <a-avatar style="color: #f56a00; backgroundColor: #fde3cf">
                    {{ item.avatarURL }}
                  </a-avatar>
                </div>
                <div class="content">
                  <div class="author">
                    <a class="name">{{ item.from }}</a>
                    <a-tooltip class="time" :title="item.date">
                      <span>{{ moment(item.date).fromNow() }}</span>
                    </a-tooltip>
                  </div>
                  <p class="message">
                    {{ item.content }}
                  </p>
                </div>
              </div>
            </div>
            <!-- others left -->
            <a-comment v-else>
              <a slot="author">{{ item.from }}</a>
              <a-avatar
                slot="avatar"
                style="color: #f56a00; backgroundColor: #fde3cf"
              >
                {{ item.avatarURL }}
              </a-avatar>
              <p slot="content">
                {{ item.content }}
              </p>
              <a-tooltip slot="datetime" :title="item.date">
                <span>{{ moment(item.date).fromNow() }}</span>
              </a-tooltip>
            </a-comment>
          </dynamic-scroller-item>
        </template>
      </dynamic-scroller>
    </main>
    <footer>
      <a-input-search
        @search="onSend"
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

Vue.use(PageHeader)
Vue.use(Comment)
Vue.use(Tooltip)
Vue.use(Input)
Vue.use(Avatar)
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)

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
      ERROR_CODES: this.$store.state.ERROR_CODES,
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
  computed: {
    username() {
      return localStorage.username
    },
    roomID() {
      return localStorage.roomID
    },
    avatarURL() {
      return localStorage.avatarURL
    },
    userID() {
      return localStorage.userID
    },
    // 消息id
    messageId() {
      const len = this.msgs.length
      if (!this.msgs || len === 0) {
        return 0
      }
      return this.msgs[this.msgs.length - 1].id + 1
    },
    message() {
      return {
        roomID: this.roomID,
        userID: this.userID,
        type: 1,
        message: this.inputContent,
      }
    },
    showMessage() {
      return {
        date: this.moment().format("YYYY-MM-DD HH:mm:ss"),
        from: `${localStorage.username}`,
        content: this.inputContent,
        avatarURL: this.avatarURL,
        id: this.id,
        self: true,
      }
    },
  },
  sockets: {
    connect() {
      console.log("socket connection succeed")
    },
    socketerror(param) {
      if (param.code) {
        console.err("Error", this.ERROR_CODES[param.code])
      } else {
        console.err("Error", "Unknown Error")
      }
    },
    newUser(param) {
      // 登陆提示
      console.log(param)
    },
    userLeft(param) {
      // 退出提示
      console.log(param)
    },
    newMessage(param) {
      console.log(param)
    },
    sendTyping(param) {
      console.log(param)
    },
    login(param) {
      console.log(param)
    },
    logout(param) {
      console.log(param)
    },
    messageUpdated(param) {
      console.log(param)
    },
  },

  beforeRouteEnter(to, from, next) {
    if (!localStorage.username) {
      next("/")
    } else {
      next()
    }
  },

  mounted() {
    setTimeout(() => {
      this.scrollToBottom()
    }, 0)
  },

  methods: {
    onSend() {
      if (this.inputContent === "") {
        return
      } else {
        this.$socket.client.emit("sendMessage", this.message)
        console.log(this.$store.state.message)
        this.msgs.push(this.showMessage)
        this.inputContent = ""
        setTimeout(() => {
          this.scrollToBottom()
        })
      }
    },
    scrollToBottom() {
      this.$refs.scroller.scrollToBottom()
    },
  },
}
</script>

<style lang="less">
body {
  height: 100vh;
}
.chatting {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
header {
  width: 100%;
  border: 1px solid rgb(235, 237, 240);
  height: 8vh;
}
main {
  height: 86vh;
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
