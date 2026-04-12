"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  data() {
    return {
      type: "launched",
      loading: false,
      launchedList: [],
      joinedList: [],
      draftedList: [],
      isNavigating: false
    };
  },
  onLoad(options) {
    if (options && options.type) {
      this.type = options.type;
    }
    this.updateTitle();
    this.loadDraftList();
    this.fetchByType();
  },
  onShow() {
    this.fetchByType();
  },
  methods: {
    updateTitle() {
      let title = "我的项目";
      if (this.type === "launched")
        title = "我发起的项目";
      else if (this.type === "joined")
        title = "我加入的项目";
      else if (this.type === "draft")
        title = "草稿箱";
      common_vendor.index.setNavigationBarTitle({ title });
    },
    async fetchByType() {
      if (this.type === "draft") {
        this.loadDraftList();
        return;
      }
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/login" }), 300);
        return;
      }
      if (this.type === "launched")
        return this.fetchLaunched();
      if (this.type === "joined")
        return this.fetchJoined();
    },
    async fetchLaunched() {
      this.loading = true;
      try {
        const res = await common_api_index.api.getMyPublishedProjects({ page: 1, size: 20 });
        const list = Array.isArray(res == null ? void 0 : res.data) ? res.data : [];
        this.launchedList = list.map((item) => ({
          projectId: item.projectId,
          title: item.name,
          status: item.status,
          auditStatus: item.auditStatus,
          releaseTime: item.releaseTime,
          viewCount: item.viewCount,
          applyCount: item.applyCount,
          totalRoles: item.totalRoles,
          filledRoles: item.filledRoles,
          statusLabel: this.projectStatusLabel(item.status),
          auditLabel: this.auditStatusLabel(item.auditStatus),
          metaLine: this.buildMetaLine(item)
        }));
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/user/my-projects.vue:139", "获取我发起的项目失败：", err);
        common_vendor.index.showToast({ title: "获取失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async fetchJoined() {
      this.loading = true;
      try {
        const res = await common_api_index.api.getMyTeams();
        const data = (res == null ? void 0 : res.data) || {};
        const joined = Array.isArray(data.joined) ? data.joined.map((x) => ({
          projectId: x.projectId,
          title: x.name,
          status: "passed",
          statusText: "已加入",
          belongTrack: x.belongTrack,
          role: x.role,
          projectLeader: x.projectLeader
        })) : [];
        const applying = Array.isArray(data.applying) ? data.applying.map((x) => ({
          projectId: x.projectId,
          title: x.name,
          status: "pending",
          statusText: "申请中"
        })) : [];
        const invited = Array.isArray(data.invited) ? data.invited.map((x) => ({
          projectId: x.projectId,
          title: x.name,
          status: "pending",
          statusText: "被邀请"
        })) : [];
        const rejected = Array.isArray(data.rejected) ? data.rejected.map((x) => ({
          projectId: x.projectId,
          title: x.name,
          status: "rejected",
          statusText: "已退出/被拒"
        })) : [];
        this.joinedList = [...applying, ...invited, ...joined, ...rejected];
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/user/my-projects.vue:185", "获取我加入的项目失败：", err);
        common_vendor.index.showToast({ title: "获取失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    loadDraftList() {
      this.draftedList = common_vendor.index.getStorageSync("projectDrafts") || [];
    },
    projectStatusLabel(status) {
      const m = { 0: "草拟", 1: "实施", 2: "招募中", 3: "完成", 4: "终止" };
      return m[status] != null ? m[status] : "未知状态";
    },
    auditStatusLabel(auditStatus) {
      const m = { 0: "待审核", 1: "已通过", 2: "未通过" };
      return m[auditStatus] != null ? m[auditStatus] : "审核中";
    },
    buildMetaLine(item) {
      const parts = [];
      if (item.viewCount != null)
        parts.push(`浏览 ${item.viewCount}`);
      if (item.applyCount != null)
        parts.push(`申请 ${item.applyCount}`);
      if (item.totalRoles != null) {
        const filled = item.filledRoles != null ? item.filledRoles : 0;
        parts.push(`招募 ${filled}/${item.totalRoles}`);
      }
      return parts.length ? parts.join(" · ") : "点击查看详情";
    },
    onViewLaunched(item) {
      if (!item.projectId)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/projectDetail/index?projectId=${item.projectId}&hideCommunicate=1`
      });
    },
    onEditLaunched(item) {
      if (!item.projectId)
        return;
      if (this.isNavigating)
        return;
      this.isNavigating = true;
      common_vendor.index.switchTab({
        url: "/pages/create/index",
        success: () => {
          setTimeout(() => {
            common_vendor.index.$emit("editProject", { projectId: item.projectId });
            this.isNavigating = false;
          }, 320);
        },
        fail: () => {
          this.isNavigating = false;
        }
      });
    },
    onViewJoined(item) {
      if (!item.projectId)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/projectDetail/index?projectId=${item.projectId}`
      });
    },
    onCreateProject() {
      if (this.isNavigating)
        return;
      this.isNavigating = true;
      common_vendor.index.switchTab({
        url: "/pages/create/index",
        complete: () => {
          setTimeout(() => {
            common_vendor.index.$emit("clearProjectEdit");
            this.isNavigating = false;
          }, 350);
        }
      });
    },
    onGoOnEdit(draft) {
      common_vendor.index.switchTab({
        url: "/pages/create/index",
        success: () => setTimeout(() => common_vendor.index.$emit("loadDraft", draft), 300)
      });
    },
    // ======================
    // ✅ 删除草稿（弹窗确认）
    // ======================
    onDeleteDraft(draft) {
      common_vendor.index.showModal({
        title: "删除草稿",
        content: "确定要删除该草稿吗？",
        success: (res) => {
          if (res.confirm) {
            let drafts = common_vendor.index.getStorageSync("projectDrafts") || [];
            drafts = drafts.filter((d) => d.id !== draft.id);
            common_vendor.index.setStorageSync("projectDrafts", drafts);
            this.loadDraftList();
            common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.type === "launched"
  }, $data.type === "launched" ? common_vendor.e({
    b: $data.launchedList.length === 0 && !$data.loading
  }, $data.launchedList.length === 0 && !$data.loading ? {} : {}, {
    c: common_vendor.f($data.launchedList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.auditLabel),
        c: common_vendor.n("audit-" + (item.auditStatus ?? 0)),
        d: common_vendor.o(($event) => $options.onViewLaunched(item), item.projectId || index),
        e: common_vendor.t(item.statusLabel),
        f: common_vendor.t(item.metaLine),
        g: common_vendor.o(($event) => $options.onViewLaunched(item), item.projectId || index),
        h: common_vendor.o(($event) => $options.onViewLaunched(item), item.projectId || index),
        i: common_vendor.o(($event) => $options.onEditLaunched(item), item.projectId || index),
        j: item.projectId || index
      };
    }),
    d: common_vendor.o((...args) => $options.onCreateProject && $options.onCreateProject(...args))
  }) : $data.type === "joined" ? {
    f: common_vendor.f($data.joinedList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.statusText),
        c: item.projectId || index,
        d: common_vendor.n(`status-${item.status}`),
        e: common_vendor.o(($event) => $options.onViewJoined(item), item.projectId || index)
      };
    })
  } : common_vendor.e({
    g: $data.draftedList.length === 0
  }, $data.draftedList.length === 0 ? {} : {
    h: common_vendor.f($data.draftedList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.o(($event) => $options.onDeleteDraft(item), item.id || index),
        c: common_vendor.o(($event) => $options.onGoOnEdit(item), item.id || index),
        d: item.id || index
      };
    })
  }), {
    e: $data.type === "joined"
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/my-projects.js.map
