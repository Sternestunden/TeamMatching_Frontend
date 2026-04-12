"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      profile: {},
      avatarUrl: ""
    };
  },
  computed: {
    genderText() {
      const g = this.profile.gender;
      if (g === 1)
        return "男";
      if (g === 2)
        return "女";
      if (g === 0)
        return "未知";
      return "—";
    }
  },
  onShow() {
    this.fetchProfile();
  },
  methods: {
    goEdit() {
      common_vendor.index.navigateTo({ url: "/pages/user/profile" });
    },
    async fetchProfile() {
      var _a, _b, _c;
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/login" }), 300);
        return;
      }
      this.loading = true;
      try {
        const res = await common_api_index.api.getUserProfile();
        this.profile = (res == null ? void 0 : res.data) || {};
        this.avatarUrl = ((_b = (_a = this.profile) == null ? void 0 : _a.avatarFile) == null ? void 0 : _b.fileUrl) || "";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/info.vue:89", "获取个人资料失败：", e);
        common_vendor.index.showToast({ title: ((_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) || (e == null ? void 0 : e.message) || "获取失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.avatarUrl
  }, $data.avatarUrl ? {
    b: $data.avatarUrl
  } : {}, {
    c: common_vendor.t($data.profile.nickname || $data.profile.username || "未命名用户"),
    d: common_vendor.t($data.profile.major || ""),
    e: common_vendor.t($data.profile.grade || ""),
    f: common_vendor.o((...args) => $options.goEdit && $options.goEdit(...args)),
    g: common_vendor.t($data.profile.email || "—"),
    h: common_vendor.t($options.genderText),
    i: common_vendor.t($data.profile.birthday || "—"),
    j: common_vendor.t($data.profile.techStack || "—"),
    k: common_vendor.t($data.profile.personalIntro || "—"),
    l: common_vendor.t($data.profile.awardExperience || "—")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aab93774"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/info.js.map
