"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      inviteInfo: {
        id: "",
        avatar: "",
        name: "李队长",
        role: "项目队长",
        projectName: "第十届互联网+创新大赛",
        projectDesc: "AI图像识别 需要前端开发",
        inviteTime: "2026-03-15 10:20",
        inviteDesc: "希望你能加入负责前端开发，有vue经验优先"
      }
    };
  },
  onLoad(options) {
    this.inviteInfo.id = options.id;
    this.fetchInviteDetail();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 获取邀请详情
    fetchInviteDetail() {
      common_vendor.index.__f__("log", "at pages/message/invite/inviteDetail.vue:68", "请求邀请详情，ID：", this.inviteInfo.id);
    },
    // 拒绝邀请
    rejectInvite() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定拒绝该邀请吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已拒绝邀请", icon: "none" });
            setTimeout(() => {
              this.goBack();
            }, 1e3);
          }
        }
      });
    },
    // 接受邀请
    acceptInvite() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定接受该邀请吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已接受邀请", icon: "success" });
            setTimeout(() => {
              this.goBack();
            }, 1e3);
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_Avatar = common_vendor.resolveComponent("Avatar");
  _component_Avatar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      src: $data.inviteInfo.avatar,
      size: "60"
    }),
    b: common_vendor.t($data.inviteInfo.name),
    c: common_vendor.t($data.inviteInfo.role),
    d: common_vendor.t($data.inviteInfo.projectName),
    e: common_vendor.t($data.inviteInfo.projectDesc),
    f: common_vendor.t($data.inviteInfo.inviteTime),
    g: common_vendor.t($data.inviteInfo.inviteDesc || "暂无说明"),
    h: common_vendor.o((...args) => $options.rejectInvite && $options.rejectInvite(...args)),
    i: common_vendor.o((...args) => $options.acceptInvite && $options.acceptInvite(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6ff082f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/invite/inviteDetail.js.map
