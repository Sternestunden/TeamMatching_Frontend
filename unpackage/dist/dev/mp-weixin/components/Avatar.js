"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "Avatar",
  props: {
    // 头像图片地址
    src: {
      type: String,
      default: ""
    },
    size: {
      type: Number,
      default: 40
    },
    // 是否显示角标
    showBadge: {
      type: Boolean,
      default: false
    },
    // default
    defaultAvatar: {
      type: String,
      default: "/static/images/avatar-default.png"
    }
  },
  methods: {
    // 图片加载失败时显示默认头像
    handleImgError(e) {
      e.target.src = this.defaultAvatar;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.src || $props.defaultAvatar,
    b: common_vendor.o((...args) => $options.handleImgError && $options.handleImgError(...args)),
    c: $props.size + "px",
    d: $props.size + "px"
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c8a835f9"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/Avatar.js.map
