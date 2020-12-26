<template>
  <div class="chatting">
    <header>
      <a-page-header title="沟通ing" @back="$router.push('/')">
        <div v-if="typingUser" slot="subTitle">
          {{ typingUser.name }}正在输入
        </div>
      </a-page-header>
    </header>
    <dynamic-scroller
      :items="msgs"
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
          <div class="newUser" v-if="item.status === 'join'">
            欢迎 {{ item.name }} 加入
          </div>
          <div class="userLeft" v-else-if="item.status === 'left'">
            {{ item.name }} 离开
          </div>
          <!-- self right -->
          <div v-else-if="self(item.userID)" class="self">
            <div class="self">
              <div class="avatar">
                <a-avatar style="color: #f56a00; backgroundColor: #fde3cf">
                  {{ item.user.avatarURL }}
                </a-avatar>
              </div>
              <div class="content">
                <div class="author">
                  <a class="name">{{ item.user.name }}</a>
                  <a-tooltip
                    class="time"
                    :title="moment(item.created).format('YYYY-MM-DD HH:mm:ss')"
                  >
                    <span>{{ moment(item.created).fromNow() }}</span>
                  </a-tooltip>
                </div>
                <div class="message">
                  <p>
                    {{ item.message }}
                  </p>
                </div>
                <div class="seen" v-if="isSeenByOthers(item)">
                  <span>已读</span>
                </div>
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
import UUID from "vue-uuid"

Vue.use(PageHeader)
Vue.use(Comment)
Vue.use(Tooltip)
Vue.use(Input)
Vue.use(Avatar)
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(UUID)

const roomID = process.env.VUE_APP_ROOM_ID

export default {
  name: "chatting",
  components: {
    DynamicScroller,
    DynamicScrollerItem,
  },
  data() {
    return {
      inputContent: "",
      lastTextLength: 0,
      userList: [],
      newUserName: "",
      typingUser: null,
      messages: [],
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
    msgs: {
      get() {
        return this.messagesList ? this.messagesList : []
      },
    },
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
          name: this.user.name,
        })
      }
    },
    sendMessage() {
      if (this.inputContent === "") {
        return
      } else if (this.user.userID == "") {
        this.$router.push("/")
      } else {
        this.$socket.client.emit("sendMessage", this.sendMessageParam)
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
    async getMessages(lastMessageID) {
      await this.axios
        .get(`/message/list/${roomID}/${lastMessageID}`)
        .then(response => {
          this.messages = response.data.data.messages
        })
    },
    isSeenByOthers(item) {
      if (item.seenBy && item.seenBy.length > 0) {
        return item.seenBy.some(i => {
          if (i.user.userID !== this.user.userID) {
            return true
          }
          return false
        })
      }
      return false
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
      param._id = this.$uuid.v1()
      param.status = "join"
      if (this.msgs) {
        this.msgs.push(param)
      } else {
        this.msgs = [param]
      }
    },
    userLeft(param) {
      param.status = "left"
      param._id = this.$uuid.v1()
      if (this.msgs) {
        this.msgs.push(param)
      } else {
        this.msgs = [param]
      }
    },
    newMessage(param) {
      const messageID = param["_id"]
      if (this.msgs.length < 50) {
        this.getMessages(messageID)
        this.$store.state.messagesList = [
          ...this.messages,
          ...this.$store.state.messagesList,
        ]
      }
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
      if (param.userID !== this.user.userID) {
        this.typingUser = param.user
      }
    },
    messageUpdated(param) {
      this.$store.state.messagesList = this.msgs.map(item => {
        param.forEach(i => {
          if (item.seenBy && item._id === i._id) {
            item.seenBy = i.seenBy
          }
        })
        return item
      })
    },
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!vm.$store.state.user.userID) {
        vm.$router.push("/")
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.disconnected
    next()
  },

  mounted() {
    if (!this.user.userID) {
      this.$router.push("/")
    } else {
      this.login()
      setTimeout(() => {
        this.scrollToBottom()
      }, 0)
      setInterval(() => {
        this.typingUser = null
      }, 3000)
    }
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
  border: 1px solid #ebedf0;
}
@media screen and (min-device-width: 400px) {
  .chatting {
    margin: 0 8vw;
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
  color: #000000a6;
  line-height: 1.5;
  box-sizing: border-box;
  position: relative;
  flex: 1 1 auto;
  min-width: 1px;
}
.author {
  color: #000000a6;
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
  color: #00000073;
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.newUser,
.userLeft {
  height: 2rem;
  text-align: center;
  line-height: 2rem;
  color: #ccc;
}
.message {
  display: border-box;
}

.message > p {
  margin-top: 0;
  margin-bottom: 1em;
  white-space: pre-wrap;
}
.seen {
  padding-left: 0;
  margin-top: 0.75rem;
  margin-bottom: 1em;
}
.seen > span {
  margin-top: 0;
  margin-bottom: 1em;
  color: #00000073;
  font-size: 0.75rem;
  cursor: pointer;
}
</style>
