"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      avatarUrl: "",
      genderOptions: [
        { label: "未知", value: 0 },
        { label: "男", value: 1 },
        { label: "女", value: 2 }
      ],
      form: {
        nickname: "",
        avatarFileId: null,
        resumeFileId: null,
        resumeFileName: "",
        gender: 0,
        birthday: "",
        major: "",
        grade: "",
        techStack: "",
        personalIntro: "",
        awardExperience: ""
      }
    };
  },
  computed: {
    genderIndex() {
      const idx = this.genderOptions.findIndex((x) => x.value === this.form.gender);
      return idx > -1 ? idx : 0;
    }
  },
  onShow() {
    this.loadProfile();
  },
  methods: {
    onGenderChange(e) {
      var _a;
      const idx = Number(e.detail.value) || 0;
      this.form.gender = ((_a = this.genderOptions[idx]) == null ? void 0 : _a.value) ?? 0;
    },
    onBirthdayChange(e) {
      this.form.birthday = e.detail.value;
    },
    async onUploadResume() {
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/login" }), 300);
        return;
      }
      try {
        const filePath = await new Promise((resolve, reject) => {
          if (typeof common_vendor.index.chooseMessageFile === "function") {
            common_vendor.index.chooseMessageFile({
              count: 1,
              type: "file",
              success: (res) => {
                var _a;
                const file2 = (_a = res == null ? void 0 : res.tempFiles) == null ? void 0 : _a[0];
                resolve((file2 == null ? void 0 : file2.path) || (file2 == null ? void 0 : file2.tempFilePath) || "");
              },
              fail: reject
            });
            return;
          }
          common_vendor.index.chooseImage({
            count: 1,
            success: (res) => {
              var _a;
              return resolve(((_a = res == null ? void 0 : res.tempFilePaths) == null ? void 0 : _a[0]) || "");
            },
            fail: reject
          });
        });
        if (!filePath)
          return;
        common_vendor.index.showLoading({ title: "上传中..." });
        const uploadRes = await common_api_index.api.uploadFile({ filePath, targetType: 1, isTemp: false });
        const file = uploadRes == null ? void 0 : uploadRes.data;
        if (!(file == null ? void 0 : file.fileId)) {
          common_vendor.index.showToast({ title: "上传失败", icon: "none" });
          return;
        }
        this.form.resumeFileId = file.fileId;
        this.form.resumeFileName = file.fileName || "已上传简历";
        common_vendor.index.setStorageSync("userApplyResume", {
          fileId: file.fileId,
          fileName: file.fileName || "",
          fileUrl: file.fileUrl || ""
        });
        common_vendor.index.showToast({ title: "简历已上传", icon: "success" });
      } catch (e) {
        if (!String((e == null ? void 0 : e.errMsg) || "").includes("cancel")) {
          common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "上传失败", icon: "none" });
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    },
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
          var _a, _b;
          const filePath = (_a = chooseRes == null ? void 0 : chooseRes.tempFilePaths) == null ? void 0 : _a[0];
          if (!filePath)
            return;
          this.loading = true;
          try {
            const uploadRes = await common_api_index.api.uploadFile({ filePath, targetType: 7, isTemp: false });
            const file = uploadRes == null ? void 0 : uploadRes.data;
            if (!(file == null ? void 0 : file.fileId)) {
              common_vendor.index.showToast({ title: "上传失败", icon: "none" });
              return;
            }
            this.form.avatarFileId = file.fileId;
            this.avatarUrl = file.fileUrl || this.avatarUrl;
            await common_api_index.api.updateUserProfile({ avatarFileId: file.fileId });
            try {
              const res = await common_api_index.api.getUserProfile();
              if (res == null ? void 0 : res.data)
                common_vendor.index.setStorageSync("userInfo", res.data);
            } catch (e) {
            }
            common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/user/profile.vue:206", "上传头像失败：", e);
            common_vendor.index.showToast({ title: ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || (e == null ? void 0 : e.message) || "上传失败", icon: "none" });
          } finally {
            this.loading = false;
          }
        },
        fail: () => {
        }
      });
    },
    async loadProfile() {
      var _a, _b, _c;
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token)
        return;
      this.loading = true;
      try {
        const res = await common_api_index.api.getUserProfile();
        const u = (res == null ? void 0 : res.data) || {};
        this.form.nickname = u.nickname || "";
        this.form.gender = typeof u.gender === "number" ? u.gender : 0;
        this.form.birthday = u.birthday || "";
        this.form.major = u.major || "";
        this.form.grade = u.grade || "";
        this.form.techStack = u.techStack || "";
        this.form.personalIntro = u.personalIntro || "";
        this.form.awardExperience = u.awardExperience || "";
        this.form.avatarFileId = ((_a = u.avatarFile) == null ? void 0 : _a.fileId) ?? null;
        this.avatarUrl = ((_b = u.avatarFile) == null ? void 0 : _b.fileUrl) || "";
        const resume = common_vendor.index.getStorageSync("userApplyResume") || {};
        this.form.resumeFileId = resume.fileId || null;
        this.form.resumeFileName = resume.fileName || "";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/profile.vue:238", "加载个人资料失败：", e);
        common_vendor.index.showToast({ title: ((_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) || (e == null ? void 0 : e.message) || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async onSave() {
      var _a, _b, _c, _d, _e, _f, _g;
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/login" }), 300);
        return;
      }
      this.loading = true;
      try {
        await common_api_index.api.updateUserProfile({
          nickname: ((_a = this.form.nickname) == null ? void 0 : _a.trim()) || void 0,
          avatarFileId: this.form.avatarFileId || void 0,
          gender: this.form.gender,
          birthday: this.form.birthday ? String(this.form.birthday).slice(0, 10) : void 0,
          major: ((_b = this.form.major) == null ? void 0 : _b.trim()) || void 0,
          grade: ((_c = this.form.grade) == null ? void 0 : _c.trim()) || void 0,
          techStack: ((_d = this.form.techStack) == null ? void 0 : _d.trim()) || void 0,
          personalIntro: ((_e = this.form.personalIntro) == null ? void 0 : _e.trim()) || void 0,
          awardExperience: ((_f = this.form.awardExperience) == null ? void 0 : _f.trim()) || void 0
        });
        try {
          const res = await common_api_index.api.getUserProfile();
          if (res == null ? void 0 : res.data)
            common_vendor.index.setStorageSync("userInfo", res.data);
        } catch (e) {
        }
        common_vendor.index.showToast({ title: "已保存", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 400);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/profile.vue:277", "保存失败：", e);
        common_vendor.index.showToast({ title: ((_g = e == null ? void 0 : e.data) == null ? void 0 : _g.message) || (e == null ? void 0 : e.message) || "保存失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: $data.avatarUrl
  }, $data.avatarUrl ? {
    b: $data.avatarUrl
  } : {}, {
    c: common_vendor.o((...args) => $options.onUploadAvatar && $options.onUploadAvatar(...args)),
    d: $data.form.nickname,
    e: common_vendor.o(($event) => $data.form.nickname = $event.detail.value),
    f: common_vendor.t(((_a = $data.genderOptions[$options.genderIndex]) == null ? void 0 : _a.label) || "请选择"),
    g: $data.genderOptions,
    h: $options.genderIndex,
    i: common_vendor.o((...args) => $options.onGenderChange && $options.onGenderChange(...args)),
    j: common_vendor.t($data.form.birthday || "请选择日期"),
    k: $data.form.birthday,
    l: common_vendor.o((...args) => $options.onBirthdayChange && $options.onBirthdayChange(...args)),
    m: $data.form.grade,
    n: common_vendor.o(($event) => $data.form.grade = $event.detail.value),
    o: $data.form.major,
    p: common_vendor.o(($event) => $data.form.major = $event.detail.value),
    q: $data.form.techStack,
    r: common_vendor.o(($event) => $data.form.techStack = $event.detail.value),
    s: common_vendor.o((...args) => $options.onUploadResume && $options.onUploadResume(...args)),
    t: common_vendor.t($data.form.resumeFileName || "未上传"),
    v: $data.form.personalIntro,
    w: common_vendor.o(($event) => $data.form.personalIntro = $event.detail.value),
    x: $data.form.awardExperience,
    y: common_vendor.o(($event) => $data.form.awardExperience = $event.detail.value),
    z: common_vendor.o((...args) => $options.onSave && $options.onSave(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/profile.js.map
