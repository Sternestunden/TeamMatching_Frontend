"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "Loading",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // 提示文字
    text: {
      type: String,
      default: "加载中..."
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.text),
    b: $props.show
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-65e10ca8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/Loading.js.map
