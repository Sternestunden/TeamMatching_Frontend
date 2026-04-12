"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const Avatar = () => "../../components/Avatar.js";
const Loading = () => "../../components/Loading.js";
const _sfc_main = {
  components: {
    Avatar,
    Loading
  },
  data() {
    return {
      userId: "",
      userInfo: {
        name: "",
        avatarUrl: ""
      },
      loading: false,
      publishedProjects: []
    };
  },
  onLoad(options) {
    this.userId = String((options == null ? void 0 : options.userId) || "");
    this.userInfo = {
      name: (options == null ? void 0 : options.userName) ? decodeURIComponent(options.userName) : "",
      avatarUrl: (options == null ? void 0 : options.avatar) ? decodeURIComponent(options.avatar) : ""
    };
    this.fetchPublishedProjects();
  },
  methods: {
    statusText(status) {
      const m = { 0: "草拟", 1: "实施中", 2: "招募中", 3: "已完成", 4: "已终止" };
      const n = Number(status);
      return m[n] || "招募中";
    },
    statusClass(status) {
      const n = Number(status);
      if (n === 3 || n === 4)
        return "ended";
      if (n === 0)
        return "draft";
      return "recruiting";
    },
    async fetchPublishedProjects() {
      var _a;
      this.loading = true;
      try {
        if (!this.userId) {
          this.publishedProjects = [];
          return;
        }
        const res = await common_api_index.api.getUserPublishedProjects(this.userId, { page: 1, size: 50 });
        const raw = Array.isArray(res == null ? void 0 : res.data) ? res.data : Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.list) ? res.data.list : [];
        this.publishedProjects = raw;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/userProfile/userProfile.vue:86", "获取用户发布项目失败", e);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goProjectDetail(item) {
      if (!(item == null ? void 0 : item.projectId))
        return;
      common_vendor.index.navigateTo({
        url: `/pages/projectDetail/index?projectId=${item.projectId}`
      });
    }
  }
};
if (!Array) {
  const _component_Avatar = common_vendor.resolveComponent("Avatar");
  const _component_Loading = common_vendor.resolveComponent("Loading");
  (_component_Avatar + _component_Loading)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      src: $data.userInfo.avatarUrl,
      size: "64"
    }),
    b: common_vendor.t($data.userInfo.name || "用户"),
    c: common_vendor.t($data.userId || "未知"),
    d: $data.loading
  }, $data.loading ? {
    e: common_vendor.p({
      show: "true",
      text: "加载中..."
    })
  } : common_vendor.e({
    f: $data.publishedProjects.length === 0
  }, $data.publishedProjects.length === 0 ? {} : {}, {
    g: common_vendor.f($data.publishedProjects, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.projectIntro || `浏览 ${item.viewCount || 0} · 申请 ${item.applyCount || 0}`),
        c: common_vendor.t(item.belongTrack || "未分类"),
        d: common_vendor.t($options.statusText(item.status)),
        e: common_vendor.n($options.statusClass(item.status)),
        f: item.projectId || index,
        g: common_vendor.o(($event) => $options.goProjectDetail(item), item.projectId || index)
      };
    })
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-badd6e76"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/userProfile/userProfile.js.map
