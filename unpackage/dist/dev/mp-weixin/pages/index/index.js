"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      title: "Hello"
    };
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/index/index.vue:22", "📋 当前环境配置:", this.$config);
    common_vendor.index.__f__("log", "at pages/index/index.vue:23", "💡 提示：如果后端未开发，接口地址无效是正常的。当前使用模拟数据模式。");
  },
  methods: {
    async login() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:27", "点击登录按钮");
      try {
        if (!this.$api) {
          common_vendor.index.showToast({
            title: "API未初始化",
            icon: "none"
          });
          return;
        }
        if (!common_vendor.index.$u || !common_vendor.index.$u.http) {
          common_vendor.index.showToast({
            title: "HTTP未初始化",
            icon: "none"
          });
          return;
        }
        const param = {
          "username": "admin",
          "password": "123456"
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:52", "开始请求登录接口，参数:", param);
        common_vendor.index.__f__("log", "at pages/index/index.vue:53", "当前环境配置:", this.$config);
        const result = await this.$api.login(param);
        common_vendor.index.__f__("log", "at pages/index/index.vue:55", "登录结果:", result);
        if (result && result.code === 200) {
          common_vendor.index.showToast({
            title: result.message || "登录成功",
            icon: "success"
          });
          if (result.data && result.data.token) {
            common_vendor.index.setStorageSync("access-token", result.data.token);
            common_vendor.index.__f__("log", "at pages/index/index.vue:66", "Token已保存:", result.data.token);
          }
        } else {
          common_vendor.index.showToast({
            title: (result == null ? void 0 : result.message) || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:75", "登录失败:", error);
        common_vendor.index.showToast({
          title: error.message || "登录失败",
          icon: "none",
          duration: 2e3
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  _easycom_u_button2();
}
const _easycom_u_button = () => "../../node-modules/uview-plus/components/u-button/u-button.js";
if (!Math) {
  _easycom_u_button();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.t($data.title),
    c: common_vendor.o($options.login),
    d: common_vendor.p({
      type: "primary",
      text: "测试"
    }),
    e: common_vendor.t(_ctx.$moment(/* @__PURE__ */ new Date()).format("yyyy-MM-DD HH:mm:ss"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
