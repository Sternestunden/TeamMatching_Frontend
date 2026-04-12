"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const _sfc_main = {
  data() {
    return {
      mode: "email",
      // email | material
      status: "unverified",
      // unverified / pending / passed / rejected
      statusRaw: null,
      statusLoading: true,
      submitting: false,
      uploading: false,
      codeSending: false,
      countdown: 0,
      timer: null,
      emailForm: {
        school: "华东师范大学",
        email: "",
        verifyCode: ""
      },
      passedInfo: {
        school: "",
        studentId: "",
        email: ""
      },
      materialForm: {
        studentId: "",
        realName: "",
        major: "",
        grade: "",
        email: "",
        materialFileIds: [],
        materialTypes: []
      },
      materialFiles: []
    };
  },
  computed: {
    statusText() {
      if (this.status === "passed")
        return "已通过";
      if (this.status === "pending")
        return "审核中";
      if (this.status === "rejected")
        return "未通过";
      return "待提交";
    }
  },
  onUnload() {
    if (this.timer)
      clearInterval(this.timer);
  },
  onShow() {
    this.refreshStatus();
    this.hydratePassedInfo();
  },
  methods: {
    mapAuthStatus(authStatus) {
      if (authStatus === 1)
        return "passed";
      if (authStatus === 0)
        return "pending";
      if (authStatus === 2)
        return "rejected";
      return "unverified";
    },
    async refreshStatus() {
      var _a, _b, _c;
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token) {
        this.statusLoading = false;
        return;
      }
      this.statusLoading = true;
      try {
        const res = await common_api_index.api.getAuthStatus();
        const authStatus = (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.authStatus;
        const applyTime = (_b = res == null ? void 0 : res.data) == null ? void 0 : _b.applyTime;
        const materials = (_c = res == null ? void 0 : res.data) == null ? void 0 : _c.materials;
        this.statusRaw = authStatus;
        const hasMaterials = Array.isArray(materials) && materials.length > 0;
        if (authStatus === 0 && !applyTime && !hasMaterials) {
          this.status = "unverified";
        } else {
          this.status = this.mapAuthStatus(authStatus);
        }
        if (this.status === "passed") {
          this.hydratePassedInfo();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/auth.vue:208", "拉取认证状态失败：", e);
      } finally {
        this.statusLoading = false;
      }
    },
    async hydratePassedInfo() {
      const authMeta = common_vendor.index.getStorageSync("authMeta") || {};
      if (authMeta == null ? void 0 : authMeta.school)
        this.passedInfo.school = authMeta.school;
      const token = common_vendor.index.getStorageSync("access-token");
      if (!token)
        return;
      try {
        const res = await common_api_index.api.getUserProfile();
        const u = (res == null ? void 0 : res.data) || {};
        this.passedInfo.studentId = u.studentId || this.passedInfo.studentId;
        this.passedInfo.email = u.email || u.campusEmail || this.passedInfo.email;
      } catch (e) {
      }
    },
    startCountdown(seconds) {
      this.countdown = seconds;
      if (this.timer)
        clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.countdown -= 1;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
          this.countdown = 0;
        }
      }, 1e3);
    },
    async sendAuthCode() {
      var _a;
      const target = (_a = this.emailForm.email) == null ? void 0 : _a.trim();
      if (!target) {
        common_vendor.index.showToast({ title: "请先填写学生邮箱", icon: "none" });
        return;
      }
      this.codeSending = true;
      try {
        await common_api_index.api.sendCode({ target, type: "auth" });
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        this.startCountdown(60);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/auth.vue:253", "发送验证码失败：", e);
        common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "发送失败", icon: "none" });
      } finally {
        this.codeSending = false;
      }
    },
    async submitEmailVerify() {
      var _a, _b, _c, _d, _e, _f;
      const email = (_a = this.emailForm.email) == null ? void 0 : _a.trim();
      const verifyCode = (_b = this.emailForm.verifyCode) == null ? void 0 : _b.trim();
      const school = (_c = this.emailForm.school) == null ? void 0 : _c.trim();
      if (!school)
        return common_vendor.index.showToast({ title: "请填写学校名称", icon: "none" });
      if (!email)
        return common_vendor.index.showToast({ title: "请填写学生邮箱", icon: "none" });
      if (!verifyCode || verifyCode.length !== 6)
        return common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
      this.submitting = true;
      try {
        const res = await common_api_index.api.verifyByEmail({ email, verifyCode, school });
        this.status = this.mapAuthStatus((_d = res == null ? void 0 : res.data) == null ? void 0 : _d.authStatus);
        common_vendor.index.showToast({ title: ((_e = res == null ? void 0 : res.data) == null ? void 0 : _e.message) || "认证成功", icon: "success" });
        common_vendor.index.setStorageSync("authMeta", { ...common_vendor.index.getStorageSync("authMeta") || {}, school });
        this.passedInfo.school = school;
        this.passedInfo.email = email;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/auth.vue:278", "邮箱认证失败：", e);
        const msg = ((_f = e == null ? void 0 : e.data) == null ? void 0 : _f.message) || (e == null ? void 0 : e.message) || "认证失败";
        common_vendor.index.showToast({ title: msg, icon: "none" });
      } finally {
        this.submitting = false;
      }
    },
    async chooseAndUpload() {
      this.uploading = true;
      try {
        const chooseRes = await new Promise((resolve, reject) => {
          common_vendor.index.chooseImage({
            count: 9,
            sizeType: ["compressed"],
            sourceType: ["album", "camera"],
            success: resolve,
            fail: reject
          });
        });
        const filePaths = (chooseRes == null ? void 0 : chooseRes.tempFilePaths) || [];
        for (const filePath of filePaths) {
          const res = await common_api_index.api.uploadFile({ filePath, targetType: 8, isTemp: true });
          const file = res == null ? void 0 : res.data;
          if (file == null ? void 0 : file.fileId) {
            this.materialFiles.push(file);
            this.materialForm.materialFileIds.push(file.fileId);
            this.materialForm.materialTypes.push(1);
          }
        }
        common_vendor.index.showToast({ title: "上传成功", icon: "success" });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/auth.vue:311", "上传失败：", e);
        common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "上传失败", icon: "none" });
      } finally {
        this.uploading = false;
      }
    },
    removeFile(idx) {
      this.materialFiles.splice(idx, 1);
      this.materialForm.materialFileIds.splice(idx, 1);
      this.materialForm.materialTypes.splice(idx, 1);
    },
    async submitMaterialVerify() {
      var _a, _b, _c, _d, _e, _f, _g;
      const p = this.materialForm;
      if (!((_a = p.realName) == null ? void 0 : _a.trim()))
        return common_vendor.index.showToast({ title: "请填写姓名", icon: "none" });
      if (!((_b = p.studentId) == null ? void 0 : _b.trim()))
        return common_vendor.index.showToast({ title: "请填写学号", icon: "none" });
      if (!((_c = p.major) == null ? void 0 : _c.trim()))
        return common_vendor.index.showToast({ title: "请填写专业", icon: "none" });
      if (!((_d = p.grade) == null ? void 0 : _d.trim()))
        return common_vendor.index.showToast({ title: "请填写年级", icon: "none" });
      if (!((_e = p.email) == null ? void 0 : _e.trim()))
        return common_vendor.index.showToast({ title: "请填写校园邮箱", icon: "none" });
      if (!Array.isArray(p.materialFileIds) || p.materialFileIds.length === 0) {
        return common_vendor.index.showToast({ title: "请先上传认证材料", icon: "none" });
      }
      this.submitting = true;
      try {
        const res = await common_api_index.api.submitAuth({
          studentId: p.studentId,
          realName: p.realName,
          major: p.major,
          grade: p.grade,
          email: p.email,
          materialFileIds: p.materialFileIds,
          materialTypes: p.materialTypes
        });
        this.status = this.mapAuthStatus((_f = res == null ? void 0 : res.data) == null ? void 0 : _f.authStatus);
        common_vendor.index.showToast({ title: ((_g = res == null ? void 0 : res.data) == null ? void 0 : _g.message) || "已提交，等待审核", icon: "success" });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/auth.vue:349", "提交认证失败：", e);
        common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "提交失败", icon: "none" });
      } finally {
        this.submitting = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.statusText),
    b: common_vendor.n(`status-${$data.status}`),
    c: $data.statusLoading
  }, $data.statusLoading ? {} : $data.status === "passed" ? common_vendor.e({
    e: common_vendor.t($data.passedInfo.school || "—"),
    f: common_vendor.t($data.passedInfo.studentId || "—"),
    g: $data.passedInfo.email
  }, $data.passedInfo.email ? {
    h: common_vendor.t($data.passedInfo.email)
  } : {}) : common_vendor.e({
    i: $data.mode === "email" ? 1 : "",
    j: common_vendor.o(($event) => $data.mode = "email"),
    k: $data.mode === "material" ? 1 : "",
    l: common_vendor.o(($event) => $data.mode = "material"),
    m: $data.mode === "email"
  }, $data.mode === "email" ? {
    n: $data.emailForm.school,
    o: common_vendor.o(($event) => $data.emailForm.school = $event.detail.value),
    p: $data.emailForm.email,
    q: common_vendor.o(($event) => $data.emailForm.email = $event.detail.value),
    r: $data.emailForm.verifyCode,
    s: common_vendor.o(($event) => $data.emailForm.verifyCode = $event.detail.value),
    t: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : $data.codeSending ? "发送中..." : "发送验证码"),
    v: $data.codeSending || $data.countdown > 0,
    w: common_vendor.o((...args) => $options.sendAuthCode && $options.sendAuthCode(...args)),
    x: common_vendor.t($data.submitting ? "提交中..." : "提交认证"),
    y: $data.submitting,
    z: common_vendor.o((...args) => $options.submitEmailVerify && $options.submitEmailVerify(...args))
  } : common_vendor.e({
    A: $data.materialForm.realName,
    B: common_vendor.o(($event) => $data.materialForm.realName = $event.detail.value),
    C: $data.materialForm.studentId,
    D: common_vendor.o(($event) => $data.materialForm.studentId = $event.detail.value),
    E: $data.materialForm.major,
    F: common_vendor.o(($event) => $data.materialForm.major = $event.detail.value),
    G: $data.materialForm.grade,
    H: common_vendor.o(($event) => $data.materialForm.grade = $event.detail.value),
    I: $data.materialForm.email,
    J: common_vendor.o(($event) => $data.materialForm.email = $event.detail.value),
    K: $data.uploading,
    L: common_vendor.o((...args) => $options.chooseAndUpload && $options.chooseAndUpload(...args)),
    M: $data.uploading
  }, $data.uploading ? {} : {}, {
    N: $data.materialFiles.length > 0
  }, $data.materialFiles.length > 0 ? {
    O: common_vendor.f($data.materialFiles, (f, idx, i0) => {
      return {
        a: common_vendor.t(f.fileName),
        b: common_vendor.o(($event) => $options.removeFile(idx), f.fileId),
        c: f.fileId
      };
    })
  } : {}, {
    P: common_vendor.t($data.submitting ? "提交中..." : "提交认证"),
    Q: $data.submitting,
    R: common_vendor.o((...args) => $options.submitMaterialVerify && $options.submitMaterialVerify(...args))
  })), {
    d: $data.status === "passed"
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/auth.js.map
