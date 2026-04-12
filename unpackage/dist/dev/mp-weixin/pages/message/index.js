"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      inviteCount: 2,
      // 组队邀请新消息数
      messageList: [
        {
          id: 1,
          avatar: "",
          name: "队长",
          tag: "队长",
          time: "10:30",
          content: "你好，我对你的前端经历很感兴趣，能聊聊吗？",
          isNew: true,
          badgeCount: 1
        }
        // 可继续添加更多消息
        // { id: 2, ... }
      ]
    };
  },
  methods: {
    // 跳转到组队邀请列表
    goToInviteList() {
      common_vendor.index.navigateTo({ url: "/pages/message/invite/index" });
    },
    // 跳转到系统通知列表
    goToNoticeList() {
      common_vendor.index.navigateTo({ url: "/pages/message/notice/index" });
    },
    // 跳转到聊天页
    goToChat(item) {
      item.isNew = false;
      common_vendor.index.navigateTo({ url: `/pages/message/chat/index?userId=${item.id}` });
    }
  }
};
if (!Array) {
  const _component_Avatar = common_vendor.resolveComponent("Avatar");
  _component_Avatar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.inviteCount > 0
  }, $data.inviteCount > 0 ? {
    b: common_vendor.t($data.inviteCount)
  } : {}, {
    c: common_vendor.o((...args) => $options.goToInviteList && $options.goToInviteList(...args)),
    d: common_vendor.o((...args) => $options.goToNoticeList && $options.goToNoticeList(...args)),
    e: common_vendor.f($data.messageList, (item, index, i0) => {
      return common_vendor.e({
        a: "780fc0ad-0-" + i0,
        b: common_vendor.p({
          src: item.avatar,
          size: "48"
        }),
        c: common_vendor.t(item.name),
        d: item.tag
      }, item.tag ? {
        e: common_vendor.t(item.tag)
      } : {}, {
        f: common_vendor.t(item.time),
        g: common_vendor.t(item.content),
        h: item.isNew
      }, item.isNew ? {
        i: common_vendor.t(item.badgeCount || 1)
      } : {}, {
        j: index,
        k: common_vendor.o(($event) => $options.goToChat(item), index)
      });
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-780fc0ad"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/index.js.map
