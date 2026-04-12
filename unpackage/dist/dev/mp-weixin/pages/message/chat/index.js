"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config_env = require("../../../common/config/env.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const sessionId = common_vendor.ref("");
    const userId = common_vendor.ref(common_vendor.index.getStorageSync("userId") || "10001");
    const myAvatar = common_vendor.ref(common_vendor.index.getStorageSync("avatar") || "");
    const sessionInfo = common_vendor.reactive({
      avatar: "",
      name: ""
    });
    const messageList = common_vendor.ref([]);
    const inputContent = common_vendor.ref("");
    const scrollTop = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const pageNum = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const getAuthHeader = () => {
      const token = common_vendor.index.getStorageSync("access-token") || "";
      const header = { "Content-Type": "application/json" };
      if (token)
        header.Authorization = `Bearer ${token}`;
      return header;
    };
    common_vendor.onLoad((options) => {
      sessionId.value = options.sessionId || "";
      sessionInfo.avatar = options.avatar || "";
      sessionInfo.name = options.name || "聊天对象";
      getHistoryMessages();
    });
    const request = (options) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          ...options,
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      });
    };
    const getHistoryMessages = async () => {
      var _a, _b;
      if (loading.value)
        return;
      loading.value = true;
      try {
        const res = await request({
          url: `${common_config_env.local.baseUrl}/chat/messages`,
          method: "GET",
          header: getAuthHeader(),
          data: {
            sessionId: sessionId.value,
            pageNum: pageNum.value,
            pageSize: pageSize.value
          }
        });
        if (res.data && res.data.code === 200) {
          const newMessages = ((_a = res.data.data) == null ? void 0 : _a.records) || [];
          messageList.value = [...newMessages, ...messageList.value];
          pageNum.value++;
          if (pageNum.value === 2) {
            scrollToBottom();
          }
        } else {
          common_vendor.index.showToast({ title: ((_b = res.data) == null ? void 0 : _b.message) || "加载消息失败", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.showToast({ title: "加载消息失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/message/chat/index.vue:138", "加载历史消息失败:", err);
      } finally {
        loading.value = false;
      }
    };
    const loadMoreHistory = () => {
      getHistoryMessages();
    };
    const sendMessage = async () => {
      var _a;
      const content = inputContent.value.trim();
      if (!content) {
        common_vendor.index.showToast({ title: "请输入消息内容", icon: "none" });
        return;
      }
      try {
        const res = await request({
          url: `${common_config_env.local.baseUrl}/chat/message`,
          method: "POST",
          header: getAuthHeader(),
          data: {
            sessionId: sessionId.value,
            content,
            senderId: userId.value
          }
        });
        if (res.data && res.data.code === 200) {
          messageList.value.push({
            senderId: userId.value,
            content,
            createTime: (/* @__PURE__ */ new Date()).toLocaleTimeString()
          });
          inputContent.value = "";
          scrollToBottom();
          common_vendor.index.showToast({ title: "发送成功", icon: "none" });
        } else {
          common_vendor.index.showToast({ title: ((_a = res.data) == null ? void 0 : _a.message) || "发送失败", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/message/chat/index.vue:183", "发送消息失败:", err);
        common_vendor.index.showToast({ title: "发送失败", icon: "none" });
      }
    };
    const scrollToBottom = () => {
      setTimeout(() => {
        common_vendor.nextTick$1(() => {
          scrollTop.value = 999999;
        });
      }, 100);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(messageList.value, (msg, index, i0) => {
          return common_vendor.e({
            a: msg.senderId === userId.value
          }, msg.senderId === userId.value ? {
            b: common_vendor.t(msg.content),
            c: myAvatar.value || "/static/default-avatar.png"
          } : {
            d: sessionInfo.avatar || "/static/default-avatar.png",
            e: common_vendor.t(msg.content)
          }, {
            f: index
          });
        }),
        b: loading.value
      }, loading.value ? {} : {}, {
        c: scrollTop.value,
        d: common_vendor.o(loadMoreHistory),
        e: common_vendor.o(sendMessage),
        f: inputContent.value,
        g: common_vendor.o(($event) => inputContent.value = $event.detail.value),
        h: common_vendor.o(sendMessage)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-44f04798"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/chat/index.js.map
