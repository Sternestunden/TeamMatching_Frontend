"use strict";
const common_vendor = require("../../common/vendor.js");
const AuthStatus = () => "./AuthStatus.js";
const _sfc_main = {
  name: "UserInfo",
  components: {
    AuthStatus
  },
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  }
};
if (!Array) {
  const _component_AuthStatus = common_vendor.resolveComponent("AuthStatus");
  _component_AuthStatus();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.userInfo.avatarUrl
  }, $props.userInfo.avatarUrl ? {
    b: $props.userInfo.avatarUrl
  } : {}, {
    c: common_vendor.o(($event) => _ctx.$emit("upload-avatar")),
    d: common_vendor.t($props.userInfo.name),
    e: common_vendor.o(($event) => _ctx.$emit("edit")),
    f: common_vendor.t($props.userInfo.grade),
    g: common_vendor.t($props.userInfo.college),
    h: common_vendor.o(($event) => _ctx.$emit("show-auth"))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cec05d0b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/user/UserInfo.js.map
