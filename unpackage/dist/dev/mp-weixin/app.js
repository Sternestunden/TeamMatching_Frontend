"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const common_config_env = require("./common/config/env.js");
const common_api_index = require("./common/api/index.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/login/register.js";
  "./pages/square/index.js";
  "./pages/community/index.js";
  "./pages/community/userprofile.js";
  "./pages/create/index.js";
  "./pages/message/index.js";
  "./pages/user/index.js";
  "./pages/index/index.js";
  "./pages/projectDetail/index.js";
  "./pages/message/invite/index.js";
  "./pages/message/notice/index.js";
  "./pages/message/invite/inviteDetail.js";
  "./pages/message/notice/noticeDetail.js";
  "./pages/message/chat/index.js";
  "./pages/user/profile.js";
  "./pages/user/info.js";
  "./pages/user/auth.js";
  "./pages/user/my-projects.js";
  "./pages/user/my-favorites.js";
  "./pages/settings/settings.js";
  "./pages/user/feedback.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.uviewPlus);
  app.config.globalProperties.$moment = common_vendor.hooks;
  app.config.globalProperties.$config = common_config_env.local;
  app.config.globalProperties.$api = common_api_index.api;
  "./common/http/request.js".then((requestModule) => {
    const requestInit = requestModule.default || requestModule;
    requestInit(app);
  }).catch((err) => {
    common_vendor.index.__f__("error", "at main.js:59", "请求配置初始化失败：", err);
  });
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
