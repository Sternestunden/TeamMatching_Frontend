"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const UserInfo = () => "../../components/user/UserInfo.js";
const SkillTags = () => "../../components/user/SkillTags.js";
const _sfc_main = {
  components: {
    UserInfo,
    SkillTags
  },
  data() {
    return {
      userInfo: {
        name: "王小明",
        grade: "25级",
        college: "软件工程学院"
      },
      skills: [
        { name: "Python", exp: "做过数据分析项目" },
        { name: "Vue.js", exp: "开发过校园小程序" },
        { name: "Rust", exp: "学习操作系统" }
      ],
      showSkillModal: false,
      skillForm: {
        stack: "",
        experience: ""
      }
    };
  },
  async onShow() {
    var _a;
    const token = common_vendor.index.getStorageSync("access-token");
    if (!token)
      return;
    try {
      const res = await common_api_index.api.getUserProfile();
      if (res == null ? void 0 : res.data) {
        common_vendor.index.setStorageSync("userInfo", res.data);
        this.userInfo = {
          name: res.data.nickname || res.data.username || "未命名用户",
          grade: res.data.grade || "",
          college: res.data.major || "",
          avatarUrl: ((_a = res.data.avatarFile) == null ? void 0 : _a.fileUrl) || ""
        };
      }
    } catch (e) {
    }
  },
  methods: {
    onUploadAvatar() {
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/login" }), 300);
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (chooseRes) => {
          var _a, _b, _c;
          const filePath = (_a = chooseRes == null ? void 0 : chooseRes.tempFilePaths) == null ? void 0 : _a[0];
          if (!filePath)
            return;
          try {
            common_vendor.index.showLoading({ title: "上传中" });
            const uploadRes = await common_api_index.api.uploadFile({ filePath, targetType: 7, isTemp: false });
            const file = uploadRes == null ? void 0 : uploadRes.data;
            if (!(file == null ? void 0 : file.fileId)) {
              common_vendor.index.showToast({ title: "上传失败", icon: "none" });
              return;
            }
            await common_api_index.api.updateUserProfile({ avatarFileId: file.fileId });
            const res = await common_api_index.api.getUserProfile();
            if (res == null ? void 0 : res.data) {
              common_vendor.index.setStorageSync("userInfo", res.data);
              this.userInfo = {
                ...this.userInfo,
                name: res.data.nickname || res.data.username || this.userInfo.name,
                grade: res.data.grade || this.userInfo.grade,
                college: res.data.major || this.userInfo.college,
                avatarUrl: ((_b = res.data.avatarFile) == null ? void 0 : _b.fileUrl) || file.fileUrl || this.userInfo.avatarUrl
              };
            } else {
              this.userInfo = { ...this.userInfo, avatarUrl: file.fileUrl || this.userInfo.avatarUrl };
            }
            common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/user/index.vue:219", "上传头像失败：", e);
            common_vendor.index.showToast({ title: ((_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) || (e == null ? void 0 : e.message) || "上传失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        },
        fail: () => {
        }
      });
    },
    goProfile() {
      common_vendor.index.navigateTo({
        url: "/pages/user/profile"
      });
    },
    goUserInfo() {
      common_vendor.index.navigateTo({ url: "/pages/user/info" });
    },
    goAuth() {
      common_vendor.index.navigateTo({ url: "/pages/user/auth" });
    },
    openAuthInfo() {
      this.goAuth();
    },
    openSkillModal() {
      this.skillForm.stack = "";
      this.skillForm.experience = "";
      this.showSkillModal = true;
    },
    closeSkillModal() {
      this.showSkillModal = false;
    },
    confirmAddSkill() {
      var _a, _b;
      const name = (_a = this.skillForm.stack) == null ? void 0 : _a.trim();
      const exp = (_b = this.skillForm.experience) == null ? void 0 : _b.trim();
      if (!name) {
        common_vendor.index.showToast({ title: "请填写技术栈", icon: "none" });
        return;
      }
      this.skills.push({
        name,
        exp
      });
      this.closeSkillModal();
    },
    goMyProjects(type) {
      common_vendor.index.navigateTo({
        url: `/pages/user/my-projects?type=${type}`
      });
    },
    goSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/settings/settings"
      });
    },
    goFeedback() {
      common_vendor.index.navigateTo({
        url: `/pages/user/feedback?userName=${encodeURIComponent(this.userInfo.name)}`
      });
    },
    // 查看技能详情
    onViewSkill({ skill, index }) {
      common_vendor.index.showModal({
        title: "技能详情",
        content: `技能：${skill.name}
经历：${skill.exp || "暂无填写"}`,
        showCancel: false
      });
    },
    // 删除技能
    onDeleteSkill(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除该技能吗？",
        success: (res) => {
          if (res.confirm) {
            this.skills.splice(index, 1);
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_UserInfo = common_vendor.resolveComponent("UserInfo");
  const _component_SkillTags = common_vendor.resolveComponent("SkillTags");
  (_component_UserInfo + _component_SkillTags)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onUploadAvatar),
    b: common_vendor.o($options.goProfile),
    c: common_vendor.o($options.openAuthInfo),
    d: common_vendor.p({
      ["user-info"]: $data.userInfo
    }),
    e: common_vendor.o(($event) => $options.goMyProjects("launched")),
    f: common_vendor.o(($event) => $options.goMyProjects("joined")),
    g: common_vendor.o(($event) => $options.goMyProjects("draft")),
    h: common_vendor.o($options.openSkillModal),
    i: common_vendor.o($options.onViewSkill),
    j: common_vendor.o($options.onDeleteSkill),
    k: common_vendor.p({
      skills: $data.skills
    }),
    l: common_vendor.o((...args) => $options.goUserInfo && $options.goUserInfo(...args)),
    m: common_vendor.o((...args) => $options.goAuth && $options.goAuth(...args)),
    n: common_vendor.o((...args) => $options.goSettings && $options.goSettings(...args)),
    o: common_vendor.o((...args) => $options.goFeedback && $options.goFeedback(...args)),
    p: $data.showSkillModal
  }, $data.showSkillModal ? {
    q: common_vendor.o((...args) => $options.closeSkillModal && $options.closeSkillModal(...args)),
    r: $data.skillForm.stack,
    s: common_vendor.o(($event) => $data.skillForm.stack = $event.detail.value),
    t: $data.skillForm.experience,
    v: common_vendor.o(($event) => $data.skillForm.experience = $event.detail.value),
    w: common_vendor.o((...args) => $options.closeSkillModal && $options.closeSkillModal(...args)),
    x: common_vendor.o((...args) => $options.confirmAddSkill && $options.confirmAddSkill(...args)),
    y: common_vendor.o(() => {
    }),
    z: common_vendor.o((...args) => $options.closeSkillModal && $options.closeSkillModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/index.js.map
