"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      codeSending: false,
      countdown: 0,
      timer: null,
      form: {
        account: "",
        password: "",
        nickname: "",
        verifyCode: ""
      }
    };
  },
  onUnload() {
    if (this.timer)
      clearInterval(this.timer);
  },
  methods: {
    async handleSendCode() {
      var _a;
      const target = (_a = this.form.account) == null ? void 0 : _a.trim();
      if (!target) {
        common_vendor.index.showToast({ title: "请先填写账号", icon: "none" });
        return;
      }
      this.codeSending = true;
      try {
        await common_api_index.api.sendCode({ target, type: "register" });
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        this.startCountdown(60);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/register.vue:76", "发送验证码失败：", err);
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "发送失败", icon: "none" });
      } finally {
        this.codeSending = false;
      }
    },
    startCountdown(seconds) {
      this.countdown = seconds;
      if (this.timer)
        clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.countdown -= 1;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
          this.countdown = 0;
        }
      }, 1e3);
    },
    async handleRegister() {
      var _a, _b, _c, _d;
      const account = (_a = this.form.account) == null ? void 0 : _a.trim();
      const password = this.form.password;
      const verifyCode = (_b = this.form.verifyCode) == null ? void 0 : _b.trim();
      const nickname = (_c = this.form.nickname) == null ? void 0 : _c.trim();
      if (!account) {
        common_vendor.index.showToast({ title: "请输入账号", icon: "none" });
        return;
      }
      if (!verifyCode || verifyCode.length !== 6) {
        common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
        return;
      }
      if (!password || password.length < 6 || password.length > 20) {
        common_vendor.index.showToast({ title: "密码需6-20位", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        const res = await common_api_index.api.register({ account, password, verifyCode, nickname: nickname || void 0 });
        const token = (_d = res == null ? void 0 : res.data) == null ? void 0 : _d.token;
        if (token) {
          common_vendor.index.setStorageSync("access-token", token);
          try {
            const profile = await common_api_index.api.getUserProfile();
            if (profile == null ? void 0 : profile.data)
              common_vendor.index.setStorageSync("userInfo", profile.data);
          } catch (e) {
          }
          common_vendor.index.showToast({ title: "注册成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/square/index" });
          }, 400);
        } else {
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "注册成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 600);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/register.vue:134", "注册失败：", err);
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "注册失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goLogin() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.account,
    b: common_vendor.o(($event) => $data.form.account = $event.detail.value),
    c: $data.form.nickname,
    d: common_vendor.o(($event) => $data.form.nickname = $event.detail.value),
    e: $data.form.verifyCode,
    f: common_vendor.o(($event) => $data.form.verifyCode = $event.detail.value),
    g: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : $data.codeSending ? "发送中..." : "发送验证码"),
    h: $data.codeSending || $data.countdown > 0,
    i: common_vendor.o((...args) => $options.handleSendCode && $options.handleSendCode(...args)),
    j: $data.form.password,
    k: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    l: common_vendor.t($data.loading ? "注册中..." : "注册并登录"),
    m: $data.loading,
    n: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    o: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-838b72c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/register.js.map
