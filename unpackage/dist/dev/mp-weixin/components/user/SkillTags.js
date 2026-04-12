"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "SkillTags",
  props: {
    skills: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    viewSkill(skill, index) {
      this.$emit("view", { skill, index });
    },
    deleteSkill(index) {
      this.$emit("delete", index);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.skills, (skill, index, i0) => {
      return {
        a: common_vendor.t(skill.name),
        b: common_vendor.o(($event) => $options.deleteSkill(index), index),
        c: index,
        d: common_vendor.o(($event) => $options.viewSkill(skill, index), index)
      };
    }),
    b: common_vendor.o(($event) => _ctx.$emit("add"))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-04a6cf13"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/user/SkillTags.js.map
