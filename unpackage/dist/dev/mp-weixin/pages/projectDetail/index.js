"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  computed: {
    roleOptionLabels() {
      const roles = Array.isArray(this.project.roles) ? this.project.roles : [];
      return roles.map((r, idx) => `${r.role || `角色${idx + 1}`}（剩余${this.calcRemainQuota(r)}）`);
    },
    profileResumeText() {
      if (this.profileResume.fileId) {
        return `当前可复用：${this.profileResume.fileName || "个人简历"}`;
      }
      return "个人主页暂无可复用简历，可改为“上传投递简历”";
    }
  },
  data() {
    return {
      projectId: "",
      /** 从「我发起的项目」进入时为 true，不展示「立即沟通」 */
      hideCommunicate: false,
      isCollected: false,
      project: {
        id: "",
        name: "",
        require: "",
        type: "",
        leaderAvatar: "",
        leaderName: "",
        publisherUserId: "",
        detail: "",
        roles: [],
        isAnonymous: false,
        contactInfo: ""
      },
      applying: false,
      showApplyPopup: false,
      profileResume: {
        fileId: null,
        fileName: ""
      },
      applyForm: {
        roleIndex: 0,
        applyReason: "",
        useProfileResume: false,
        customResumeFileId: null,
        customResumeFileName: "",
        applicationAttachmentFileId: null,
        applicationAttachmentFileName: ""
      }
    };
  },
  onLoad(options) {
    const id = (options == null ? void 0 : options.projectId) || (options == null ? void 0 : options.id);
    const hc = options == null ? void 0 : options.hideCommunicate;
    this.hideCommunicate = hc === "1" || hc === "true" || hc === true;
    if (id) {
      this.projectId = String(id);
      this.getProjectDetailFromApi();
    } else {
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none",
        duration: 2e3
      });
    }
  },
  methods: {
    async getProjectDetailFromApi() {
      try {
        const res = await common_api_index.api.getProjectDetail(this.projectId);
        const data = res == null ? void 0 : res.data;
        if (data == null || data.projectId == null) {
          common_vendor.index.showToast({ title: "加载失败", icon: "none" });
          return;
        }
        const pub = data.publisherInfo || {};
        const anon = data.isAnonymous === true || data.isAnonymous === 1 || data.isAnonymous === "1" || data.isAnonymous === "true";
        this.project = {
          id: data.projectId,
          name: data.name || "",
          require: data.allowCrossMajor ? "允许跨专业" : "不允许跨专业",
          type: data.belongTrack || data.projectType || "",
          leaderAvatar: anon ? "" : pub.avatar || "",
          leaderName: anon ? "匿名用户" : pub.nickname || "发布者",
          publisherUserId: anon ? "" : String(pub.userId || ""),
          detail: data.projectIntro || "",
          roles: Array.isArray(data.roleRequirements) ? data.roleRequirements : [],
          isAnonymous: anon,
          contactInfo: anon ? data.contactInfo || "" : ""
        };
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/projectDetail/index.vue:226", e);
        common_vendor.index.showToast({ title: "网络异常", icon: "none" });
      }
    },
    // 切换收藏状态
    toggleCollect() {
      this.isCollected = !this.isCollected;
      common_vendor.index.showToast({
        title: this.isCollected ? "收藏成功" : "取消收藏",
        icon: "none"
      });
    },
    // 跳转到队长个人页
    goToLeaderPage() {
      if (this.project.isAnonymous)
        return;
      const uid = encodeURIComponent(this.project.publisherUserId || "");
      const name = encodeURIComponent(this.project.leaderName || "");
      const avatar = encodeURIComponent(this.project.leaderAvatar || "");
      common_vendor.index.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${uid}&userName=${name}&avatar=${avatar}`
      });
    },
    // 立即沟通（打开统一表单）
    handleCommunicate() {
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/login" }), 300);
        return;
      }
      if (this.applying)
        return;
      const roles = Array.isArray(this.project.roles) ? this.project.roles : [];
      if (roles.length === 0) {
        common_vendor.index.showToast({ title: "该项目暂无可投递角色", icon: "none" });
        return;
      }
      this.openApplyPopup();
    },
    async openApplyPopup() {
      this.applyForm.roleIndex = 0;
      this.applyForm.applyReason = "";
      this.applyForm.customResumeFileId = null;
      this.applyForm.customResumeFileName = "";
      this.applyForm.applicationAttachmentFileId = null;
      this.applyForm.applicationAttachmentFileName = "";
      await this.ensureProfileResume();
      this.applyForm.useProfileResume = !!this.profileResume.fileId;
      this.showApplyPopup = true;
    },
    closeApplyPopup() {
      if (this.applying)
        return;
      this.showApplyPopup = false;
    },
    selectApplyRole(index) {
      this.applyForm.roleIndex = Number(index || 0);
    },
    onUseProfileResumeChange(e) {
      var _a;
      const checked = !!((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value);
      if (checked && !this.profileResume.fileId) {
        common_vendor.index.showToast({ title: "暂无可复用的个人简历", icon: "none" });
        this.applyForm.useProfileResume = false;
        return;
      }
      this.applyForm.useProfileResume = checked;
    },
    async ensureProfileResume() {
      var _a;
      const localResume = common_vendor.index.getStorageSync("userApplyResume") || {};
      if (localResume == null ? void 0 : localResume.fileId) {
        this.profileResume.fileId = localResume.fileId;
        this.profileResume.fileName = localResume.fileName || "我的简历";
        return;
      }
      try {
        const res = await common_api_index.api.getMyTalentCard();
        const resume = ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.resumeFile) || {};
        this.profileResume.fileId = resume.fileId || null;
        this.profileResume.fileName = resume.fileName || "";
      } catch (e) {
        this.profileResume.fileId = null;
        this.profileResume.fileName = "";
      }
    },
    async onUploadApplyResume() {
      const file = await this.uploadOptionalFile(1, "投递简历");
      if (!(file == null ? void 0 : file.fileId))
        return;
      this.applyForm.customResumeFileId = file.fileId;
      this.applyForm.customResumeFileName = file.fileName || "已上传简历";
    },
    async onUploadApplyAttachment() {
      const file = await this.uploadOptionalFile(5, "其他附件");
      if (!(file == null ? void 0 : file.fileId))
        return;
      this.applyForm.applicationAttachmentFileId = file.fileId;
      this.applyForm.applicationAttachmentFileName = file.fileName || "已上传附件";
    },
    clearApplyResume() {
      this.applyForm.customResumeFileId = null;
      this.applyForm.customResumeFileName = "";
    },
    clearApplyAttachment() {
      this.applyForm.applicationAttachmentFileId = null;
      this.applyForm.applicationAttachmentFileName = "";
    },
    chooseLocalFile(label) {
      return new Promise((resolve, reject) => {
        if (typeof common_vendor.index.chooseMessageFile === "function") {
          common_vendor.index.chooseMessageFile({
            count: 1,
            type: "file",
            success: (res) => {
              var _a;
              const file = (_a = res == null ? void 0 : res.tempFiles) == null ? void 0 : _a[0];
              const filePath = (file == null ? void 0 : file.path) || (file == null ? void 0 : file.tempFilePath) || "";
              resolve(filePath || "");
            },
            fail: (e) => {
              if (String((e == null ? void 0 : e.errMsg) || "").includes("cancel"))
                resolve("");
              else
                reject(e);
            }
          });
          return;
        }
        common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            var _a;
            return resolve(((_a = res == null ? void 0 : res.tempFilePaths) == null ? void 0 : _a[0]) || "");
          },
          fail: (e) => {
            if (String((e == null ? void 0 : e.errMsg) || "").includes("cancel"))
              resolve("");
            else
              reject(e);
          }
        });
      });
    },
    async uploadOptionalFile(targetType, label) {
      const filePath = await this.chooseLocalFile(label);
      if (!filePath) {
        return null;
      }
      try {
        common_vendor.index.showLoading({ title: `上传${label}中...` });
        const res = await common_api_index.api.uploadFile({ filePath, targetType, isTemp: false });
        const file = res == null ? void 0 : res.data;
        const fileId = file == null ? void 0 : file.fileId;
        if (!fileId) {
          throw new Error(`${label}上传失败`);
        }
        common_vendor.index.showToast({ title: `${label}上传成功`, icon: "success" });
        return file;
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    calcRemainQuota(role) {
      const quota = Number((role == null ? void 0 : role.memberQuota) || 0);
      const current = Number((role == null ? void 0 : role.currentMembers) || 0);
      const remain = quota - current;
      return Number.isFinite(remain) && remain >= 0 ? remain : 0;
    },
    async submitApplyFromPopup() {
      const roles = Array.isArray(this.project.roles) ? this.project.roles : [];
      const selected = roles[this.applyForm.roleIndex];
      if (!(selected == null ? void 0 : selected.requirementId)) {
        common_vendor.index.showToast({ title: "请选择有效角色", icon: "none" });
        return;
      }
      const applyReason = String(this.applyForm.applyReason || "").trim();
      if (!applyReason) {
        common_vendor.index.showToast({ title: "请填写申请理由", icon: "none" });
        return;
      }
      let customResumeFileId = null;
      if (this.applyForm.useProfileResume) {
        customResumeFileId = this.profileResume.fileId || null;
      } else {
        customResumeFileId = this.applyForm.customResumeFileId || null;
      }
      const applicationAttachmentFileId = this.applyForm.applicationAttachmentFileId || null;
      await this.submitApply(selected.requirementId, applyReason, {
        customResumeFileId,
        applicationAttachmentFileId
      });
    },
    async submitApply(requirementId, applyReason, extra = {}) {
      var _a, _b;
      this.applying = true;
      try {
        const payload = {
          requirementId: Number(requirementId),
          applyReason
        };
        if (extra.customResumeFileId)
          payload.customResumeFileId = Number(extra.customResumeFileId);
        if (extra.applicationAttachmentFileId)
          payload.applicationAttachmentFileId = Number(extra.applicationAttachmentFileId);
        const res = await common_api_index.api.applyProject(this.projectId, payload);
        common_vendor.index.showToast({
          title: ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.message) || "投递成功",
          icon: "success"
        });
        this.showApplyPopup = false;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/projectDetail/index.vue:442", "投递失败", e);
        common_vendor.index.showToast({
          title: ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || (e == null ? void 0 : e.message) || "投递失败",
          icon: "none"
        });
      } finally {
        this.applying = false;
      }
    }
  }
};
if (!Array) {
  const _component_Avatar = common_vendor.resolveComponent("Avatar");
  _component_Avatar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.project.name),
    b: common_vendor.t($data.project.require),
    c: common_vendor.t($data.project.type),
    d: common_vendor.p({
      src: $data.project.leaderAvatar,
      size: "48"
    }),
    e: common_vendor.t($data.project.leaderName),
    f: !$data.project.isAnonymous
  }, !$data.project.isAnonymous ? {} : {}, {
    g: $data.project.isAnonymous ? 1 : "",
    h: common_vendor.o((...args) => $options.goToLeaderPage && $options.goToLeaderPage(...args)),
    i: $data.project.isAnonymous && $data.project.contactInfo
  }, $data.project.isAnonymous && $data.project.contactInfo ? {
    j: common_vendor.t($data.project.contactInfo)
  } : {}, {
    k: common_vendor.t($data.project.detail),
    l: $data.project.roles && $data.project.roles.length
  }, $data.project.roles && $data.project.roles.length ? {
    m: common_vendor.f($data.project.roles, (r, idx, i0) => {
      return common_vendor.e({
        a: common_vendor.t(r.role),
        b: common_vendor.t(r.memberQuota),
        c: r.recruitRequirements
      }, r.recruitRequirements ? {
        d: common_vendor.t(r.recruitRequirements)
      } : {}, {
        e: idx
      });
    })
  } : {}, {
    n: !$data.hideCommunicate
  }, !$data.hideCommunicate ? {
    o: common_vendor.o((...args) => $options.handleCommunicate && $options.handleCommunicate(...args))
  } : {}, {
    p: $data.showApplyPopup
  }, $data.showApplyPopup ? common_vendor.e({
    q: common_vendor.o((...args) => $options.closeApplyPopup && $options.closeApplyPopup(...args)),
    r: common_vendor.f($options.roleOptionLabels, (roleLabel, idx, i0) => {
      return {
        a: common_vendor.t(roleLabel),
        b: idx,
        c: $data.applyForm.roleIndex === idx ? 1 : "",
        d: common_vendor.o(($event) => $options.selectApplyRole(idx), idx)
      };
    }),
    s: $data.applyForm.applyReason,
    t: common_vendor.o(($event) => $data.applyForm.applyReason = $event.detail.value),
    v: $data.applyForm.useProfileResume,
    w: common_vendor.o((...args) => $options.onUseProfileResumeChange && $options.onUseProfileResumeChange(...args)),
    x: common_vendor.t($options.profileResumeText),
    y: !$data.applyForm.useProfileResume
  }, !$data.applyForm.useProfileResume ? common_vendor.e({
    z: common_vendor.o((...args) => $options.onUploadApplyResume && $options.onUploadApplyResume(...args)),
    A: common_vendor.t($data.applyForm.customResumeFileName || "未上传"),
    B: $data.applyForm.customResumeFileId
  }, $data.applyForm.customResumeFileId ? {
    C: common_vendor.o((...args) => $options.clearApplyResume && $options.clearApplyResume(...args))
  } : {}) : {}, {
    D: common_vendor.o((...args) => $options.onUploadApplyAttachment && $options.onUploadApplyAttachment(...args)),
    E: common_vendor.t($data.applyForm.applicationAttachmentFileName || "未上传（可选）"),
    F: $data.applyForm.applicationAttachmentFileId
  }, $data.applyForm.applicationAttachmentFileId ? {
    G: common_vendor.o((...args) => $options.clearApplyAttachment && $options.clearApplyAttachment(...args))
  } : {}, {
    H: common_vendor.t($options.roleOptionLabels[$data.applyForm.roleIndex] || "未选择"),
    I: common_vendor.t($data.applyForm.applyReason ? "已填写" : "未填写"),
    J: common_vendor.t($data.applyForm.useProfileResume ? $data.profileResume.fileName || "复用个人简历" : $data.applyForm.customResumeFileName || "未上传"),
    K: common_vendor.t($data.applyForm.applicationAttachmentFileName || "未上传（可选）"),
    L: common_vendor.o((...args) => $options.closeApplyPopup && $options.closeApplyPopup(...args)),
    M: common_vendor.t($data.applying ? "提交中..." : "提交申请"),
    N: $data.applying,
    O: common_vendor.o((...args) => $options.submitApplyFromPopup && $options.submitApplyFromPopup(...args)),
    P: common_vendor.o(() => {
    }),
    Q: common_vendor.o((...args) => $options.closeApplyPopup && $options.closeApplyPopup(...args))
  }) : {}, {
    R: $data.hideCommunicate ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-809ade6b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/projectDetail/index.js.map
