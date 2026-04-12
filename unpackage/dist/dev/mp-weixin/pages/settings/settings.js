"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      notifyEnabled: true
    };
  },
  methods: {
    handleModifyPwd() {
      common_vendor.index.showToast({ title: "跳转到修改密码", icon: "none" });
    },
    handleCampusAuth() {
      common_vendor.index.showToast({ title: "已认证", icon: "none" });
    },
    handleNotifyChange(e) {
      this.notifyEnabled = e.detail.value;
      common_vendor.index.showToast({
        title: this.notifyEnabled ? "已开启通知" : "已关闭通知",
        icon: "none"
      });
    },
    handleClearCache() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清除缓存吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.showToast({ title: "清除成功", icon: "success" });
          }
        }
      });
    },
    handleAboutUs() {
      common_vendor.index.showToast({ title: "关于我们", icon: "none" });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        confirmText: "确定",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("access-token");
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.showToast({ title: "已退出登录", icon: "success", duration: 1500 });
            setTimeout(() => {
              common_vendor.index.reLaunch({ url: "/pages/login/login" });
            }, 1500);
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.handleModifyPwd && $options.handleModifyPwd(...args)),
    b: common_vendor.o((...args) => $options.handleCampusAuth && $options.handleCampusAuth(...args)),
    c: $data.notifyEnabled,
    d: common_vendor.o((...args) => $options.handleNotifyChange && $options.handleNotifyChange(...args)),
    e: common_vendor.o((...args) => $options.handleClearCache && $options.handleClearCache(...args)),
    f: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fad0a1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
