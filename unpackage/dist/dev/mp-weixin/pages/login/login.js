"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      wxLoading: false,
      form: {
        account: "",
        password: ""
      }
    };
  },
  methods: {
    async handleLogin() {
      var _a, _b;
      const account = (_a = this.form.account) == null ? void 0 : _a.trim();
      const password = this.form.password;
      if (!account) {
        common_vendor.index.showToast({ title: "请输入账号", icon: "none" });
        return;
      }
      if (!password) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        const res = await common_api_index.api.login({ account, password });
        const token = (_b = res == null ? void 0 : res.data) == null ? void 0 : _b.token;
        if (!token) {
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "登录失败", icon: "none" });
          return;
        }
        common_vendor.index.setStorageSync("access-token", token);
        try {
          const profile = await common_api_index.api.getUserProfile();
          if (profile == null ? void 0 : profile.data)
            common_vendor.index.setStorageSync("userInfo", profile.data);
        } catch (e) {
        }
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/square/index" });
        }, 400);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:101", "登录失败：", err);
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "登录失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/login/register" });
    },
    async handleWxLogin() {
      var _a, _b;
      this.wxLoading = true;
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        const code = loginRes == null ? void 0 : loginRes.code;
        if (!code) {
          common_vendor.index.showToast({ title: "获取微信登录凭证失败", icon: "none" });
          return;
        }
        const res = await common_api_index.api.wxLogin({ code });
        const token = (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.token;
        if (!token) {
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "微信登录失败", icon: "none" });
          return;
        }
        common_vendor.index.setStorageSync("access-token", token);
        try {
          const profile = await common_api_index.api.getUserProfile();
          if (profile == null ? void 0 : profile.data)
            common_vendor.index.setStorageSync("userInfo", profile.data);
        } catch (e) {
        }
        if ((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.isNewUser) {
          common_vendor.index.showToast({ title: "登录成功，请完善资料", icon: "success" });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/user/index" });
          }, 400);
          return;
        }
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/square/index" });
        }, 400);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:156", "微信登录失败：", err);
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "微信登录失败", icon: "none" });
      } finally {
        this.wxLoading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.account,
    b: common_vendor.o(($event) => $data.form.account = $event.detail.value),
    c: $data.form.password,
    d: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    e: common_vendor.t($data.loading ? "登录中..." : "登录"),
    f: $data.loading,
    g: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    h: common_vendor.t($data.wxLoading ? "登录中..." : "微信授权并登录"),
    i: $data.wxLoading,
    j: common_vendor.o((...args) => $options.handleWxLogin && $options.handleWxLogin(...args)),
    k: common_vendor.o((...args) => $options.goRegister && $options.goRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
