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
          <div class="newUser" v-if="item.type == 1000">
            欢迎 {{ item.user.name }} 加入
          </div>
          <div class="userLeft" v-else-if="item.type == 1001">
            {{ item.user.name }} 离开
          </div>
          <!-- self right -->
          <div v-else-if="item.type == 1 && self(item.userID)" class="self">
            <div class="self-inner">
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
          <!-- others messages -->
          <a-comment v-else-if="item.type == 1">
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
      if (!this.user.userID) {
        this.$router.push("/")
      } else if (this.sendMessageParam.message) {
        this.$socket.client.emit("sendMessage", this.sendMessageParam)
        this.inputContent = ""
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
      param
    },
    userLeft(param) {
      param
    },
    newMessage(param) {
      const messageID = [param["_id"]]
      const openMessageParams = {
        userID: this.user.userID,
        messageIDs: messageID,
      }

      if (this.msgs.length < 50) {
        this.getMessages(messageID)
        this.messages.forEach(item => {
          openMessageParams.messageIDs.push(item._id)
        })
        this.$store.commit("addOldMessages", this.messages)
      }
      this.$socket.client.emit("openMessage", openMessageParams)
      setTimeout(() => {
        this.scrollToBottom()
      }, 0)
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
      }, 2500)
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
.self {
  box-sizing: border-box;
  position: relative;
}
.self-inner {
  box-sizing: border-box;
  display: flex;
  padding: 1rem 0;
  flex-direction: row-reverse;
  line-height: 1.5;
}
.avatar {
  margin-left: 0.75rem;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
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
  min-width: 0.0625rem;
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
  text-decoration: none;
  cursor: pointer;
  color: #00000073;
}
.message {
  color: #000000a6;
  overflow: hidden;
}
.message > p {
  overflow-wrap: break-word;
  word-wrap: break-word;
  margin-top: 0;
  margin-bottom: 1em;
  white-space: pre-wrap;
}
.newUser,
.userLeft {
  text-align: center;
  line-height: 2rem;
  color: #ccc;
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
