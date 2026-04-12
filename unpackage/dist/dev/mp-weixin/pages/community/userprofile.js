"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return { user: {} };
  },
  onLoad(options) {
    try {
      const decoded = decodeURIComponent(options.user);
      this.user = JSON.parse(decoded);
      common_vendor.index.setNavigationBarTitle({ title: this.user.name });
    } catch (e) {
      this.user = { name: "加载失败", tags: [] };
      common_vendor.index.showToast({ title: "数据异常", icon: "none" });
    }
  },
  methods: {
    previewResume() {
      const path = this.user.resume;
      if (!path)
        return;
      if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(path)) {
        common_vendor.index.previewImage({ urls: [path] });
      } else {
        common_vendor.index.openDocument({
          filePath: path,
          fail: () => common_vendor.index.showToast({ title: "无法打开", icon: "none" })
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.user.name),
    b: common_vendor.t($data.user.major),
    c: common_vendor.t($data.user.grade),
    d: common_vendor.f($data.user.tags, (t, i, i0) => {
      return {
        a: common_vendor.t(t),
        b: i
      };
    }),
    e: common_vendor.t($data.user.intro),
    f: $data.user.interest
  }, $data.user.interest ? {
    g: common_vendor.t($data.user.interest)
  } : {}, {
    h: $data.user.resume
  }, $data.user.resume ? {
    i: common_vendor.o((...args) => $options.previewResume && $options.previewResume(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7e26f787"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/userprofile.js.map
