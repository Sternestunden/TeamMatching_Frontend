"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    project: { type: Object, required: true }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.project.name),
    b: common_vendor.t($props.project.desc),
    c: common_vendor.f($props.project.tags, (tag, i, i0) => {
      return {
        a: common_vendor.t(tag),
        b: i
      };
    }),
    d: common_vendor.t($props.project.founder),
    e: common_vendor.t($props.project.status),
    f: common_vendor.n($props.project.statusClass),
    g: common_vendor.o(($event) => _ctx.$emit("click", $props.project))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-05ca8cb4"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ProjectCard.js.map
