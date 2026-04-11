"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const FormCard = () => "../../components/FormCard.js";
const _sfc_main = {
  components: { FormCard },
  data() {
    return {
      currentStep: 1,
      scrollTop: 0,
      stepStatus: { 1: false, 2: false, 3: false },
      form: {
        name: "",
        desc: "",
        category: "",
        /** 接口 status：0草拟 1实施 2招募中 3完成 4终止 */
        apiStatus: 2,
        /** 接口 level：1校级 2省级 3国家级 */
        level: 1,
        /** 接口 projectType */
        projectType: "创新训练",
        projectFeatures: "",
        tags: "",
        isAnonymous: false,
        contactInfo: "",
        deadlineDate: "",
        deadlineTime: "23:59",
        allowCrossMajor: false,
        roles: [{ name: "", count: "", requirement: "" }]
      },
      categoryOptions: ["大创", "挑战杯", "互联网+", "其他"],
      projectTypeOptions: ["创新训练", "创业实践"],
      apiStatusOptions: [
        { label: "草拟", value: 0 },
        { label: "实施", value: 1 },
        { label: "招募中", value: 2 },
        { label: "完成", value: 3 },
        { label: "终止", value: 4 }
      ],
      editingDraftId: null,
      editingProjectId: null
    };
  },
  computed: {
    deadlinePreview() {
      if (!this.form.deadlineDate || !this.form.deadlineTime)
        return "";
      return `${this.form.deadlineDate} ${this.form.deadlineTime}`;
    },
    levelDisplay() {
      const m = { 1: "校级", 2: "省级", 3: "国家级" };
      const lv = Number(this.form.level);
      return m[lv] || "校级";
    },
    apiStatusDisplay() {
      const m = { 0: "草拟", 1: "实施", 2: "招募中", 3: "完成", 4: "终止" };
      const s = Number(this.form.apiStatus);
      return m[s] !== void 0 ? m[s] : "招募中";
    }
  },
  onShow() {
    common_vendor.index.$off("loadDraft");
    common_vendor.index.$on("loadDraft", (draft) => {
      this.editingProjectId = null;
      this.editingDraftId = draft.id;
      this.form = this.normalizeDraftForm(draft.form);
      if (this.form.deadline && !this.form.deadlineDate) {
        this.form.deadlineDate = String(this.form.deadline).slice(0, 10);
      }
      if (!this.form.deadlineTime) {
        this.form.deadlineTime = "23:59";
      }
      this.currentStep = draft.currentStep;
      this.stepStatus = draft.stepStatus;
      common_vendor.index.setNavigationBarTitle({ title: "新建项目" });
      common_vendor.index.showToast({ title: "已加载草稿", icon: "success" });
    });
    common_vendor.index.$off("editProject");
    common_vendor.index.$on("editProject", ({ projectId }) => {
      if (projectId != null)
        this.loadProjectForEdit(projectId);
    });
    common_vendor.index.$off("clearProjectEdit");
    common_vendor.index.$on("clearProjectEdit", () => {
      this.resetToNewProject();
    });
  },
  methods: {
    validateStep(step) {
      var _a, _b, _c;
      if (step === 1) {
        const name = (_a = this.form.name) == null ? void 0 : _a.trim();
        const desc = (_b = this.form.desc) == null ? void 0 : _b.trim();
        const category = (_c = this.form.category) == null ? void 0 : _c.trim();
        if (!name)
          return { ok: false, msg: "请填写项目名称" };
        if (!desc)
          return { ok: false, msg: "请填写项目描述" };
        if (!category)
          return { ok: false, msg: "请选择竞赛类别" };
        if (!Array.isArray(this.form.roles) || this.form.roles.length === 0) {
          return { ok: false, msg: "请至少添加一个角色需求" };
        }
        for (let i = 0; i < this.form.roles.length; i++) {
          const r = this.form.roles[i] || {};
          const roleName = String(r.name || "").trim();
          const count = String(r.count || "").trim();
          if (!roleName)
            return { ok: false, msg: `请填写角色名称 ${i + 1}` };
          if (!count)
            return { ok: false, msg: `请填写角色 ${i + 1} 的招募数量` };
          const n = Number(count);
          if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
            return { ok: false, msg: `角色 ${i + 1} 的招募数量需为正整数` };
          }
        }
        return { ok: true };
      }
      if (step === 2) {
        const deadline = this.buildDeadlineRecruit();
        if (!deadline)
          return { ok: false, msg: "请选择截止时间" };
        if (this.form.isAnonymous && !String(this.form.contactInfo || "").trim()) {
          return { ok: false, msg: "匿名发布请填写对外联系方式" };
        }
        return { ok: true };
      }
      if (step === 3) {
        const v1 = this.validateStep(1);
        if (!v1.ok)
          return v1;
        const v2 = this.validateStep(2);
        if (!v2.ok)
          return v2;
        return { ok: true };
      }
      return { ok: true };
    },
    onDeadlineDateChange(e) {
      this.form.deadlineDate = e.detail.value;
    },
    onDeadlineTimeChange(e) {
      this.form.deadlineTime = e.detail.value;
    },
    buildDeadlineRecruit() {
      const d = this.form.deadlineDate;
      const t = this.form.deadlineTime;
      if (!d || !t)
        return "";
      return `${d}T${t}:00`;
    },
    goStep(step) {
      if (this.stepStatus[step] || step <= this.currentStep) {
        this.currentStep = step;
        this.scrollTop = 0;
      } else {
        common_vendor.index.showToast({ title: "请先完成当前步骤", icon: "none" });
      }
    },
    selectCategory() {
      common_vendor.index.showActionSheet({
        itemList: this.categoryOptions,
        success: (res) => {
          this.form.category = this.categoryOptions[res.tapIndex];
        }
      });
    },
    selectLevel() {
      common_vendor.index.showActionSheet({
        itemList: ["校级", "省级", "国家级"],
        success: (res) => {
          this.form.level = res.tapIndex + 1;
        }
      });
    },
    selectProjectType() {
      common_vendor.index.showActionSheet({
        itemList: this.projectTypeOptions,
        success: (res) => {
          this.form.projectType = this.projectTypeOptions[res.tapIndex];
        }
      });
    },
    selectApiStatus() {
      const labels = this.apiStatusOptions.map((x) => x.label);
      common_vendor.index.showActionSheet({
        itemList: labels,
        success: (res) => {
          const opt = this.apiStatusOptions[res.tapIndex];
          if (opt)
            this.form.apiStatus = opt.value;
        }
      });
    },
    /** 合并旧版草稿缺省字段 */
    normalizeDraftForm(raw) {
      const f = JSON.parse(JSON.stringify(raw || {}));
      if (f.apiStatus === void 0 && f.status) {
        const legacy = { 招募中: 2, 已结束: 4 };
        f.apiStatus = legacy[f.status] != null ? legacy[f.status] : 2;
      }
      if (f.apiStatus === void 0 || f.apiStatus === "")
        f.apiStatus = 2;
      if (f.level === void 0 || f.level === "")
        f.level = 1;
      if (!f.projectType)
        f.projectType = "创新训练";
      if (f.projectFeatures === void 0)
        f.projectFeatures = "";
      if (f.tags === void 0)
        f.tags = "";
      if (f.isAnonymous === void 0)
        f.isAnonymous = false;
      if (f.contactInfo === void 0)
        f.contactInfo = "";
      if (!Array.isArray(f.roles) || f.roles.length === 0) {
        f.roles = [{ name: "", count: "", requirement: "" }];
      }
      return f;
    },
    addRole() {
      this.form.roles.push({ name: "", count: "", requirement: "" });
    },
    onBackFromEdit() {
      this.resetToNewProject();
      common_vendor.index.navigateTo({
        url: "/pages/user/my-projects?type=launched"
      });
    },
    resetToNewProject() {
      this.editingProjectId = null;
      this.editingDraftId = null;
      this.currentStep = 1;
      this.stepStatus = { 1: false, 2: false, 3: false };
      this.form = {
        name: "",
        desc: "",
        category: "",
        apiStatus: 2,
        level: 1,
        projectType: "创新训练",
        projectFeatures: "",
        tags: "",
        isAnonymous: false,
        contactInfo: "",
        deadlineDate: "",
        deadlineTime: "23:59",
        allowCrossMajor: false,
        roles: [{ name: "", count: "", requirement: "" }]
      };
      common_vendor.index.setNavigationBarTitle({ title: "新建项目" });
    },
    parseDeadlineRecruit(raw) {
      if (!raw)
        return { date: "", time: "23:59" };
      const s = String(raw).replace(/Z$/i, "");
      const [datePart, timePart = ""] = s.split("T");
      let time = "23:59";
      if (timePart) {
        const hm = timePart.match(/^(\d{1,2}):(\d{2})/);
        if (hm)
          time = `${hm[1].padStart(2, "0")}:${hm[2]}`;
      }
      return { date: datePart || "", time };
    },
    applyProjectDetailToForm(data) {
      const { date, time } = this.parseDeadlineRecruit(data.deadlineRecruit);
      const rolesFromApi = Array.isArray(data.roleRequirements) ? data.roleRequirements : [];
      const st = data.status;
      this.form = {
        name: data.name || "",
        desc: data.projectIntro || "",
        category: data.belongTrack || "",
        apiStatus: typeof st === "number" && st >= 0 && st <= 4 ? st : 2,
        level: data.level != null ? data.level : 1,
        projectType: data.projectType || "创新训练",
        projectFeatures: data.projectFeatures || "",
        tags: data.tags || "",
        isAnonymous: !!data.isAnonymous,
        contactInfo: data.contactInfo || "",
        deadlineDate: date,
        deadlineTime: time,
        allowCrossMajor: !!data.allowCrossMajor,
        roles: rolesFromApi.length > 0 ? rolesFromApi.map((r) => ({
          name: r.role || "",
          count: String(r.memberQuota != null ? r.memberQuota : ""),
          requirement: r.recruitRequirements || ""
        })) : [{ name: "", count: "", requirement: "" }]
      };
    },
    async loadProjectForEdit(projectId) {
      try {
        const res = await common_api_index.api.getProjectDetail(projectId);
        const data = res == null ? void 0 : res.data;
        if (data == null || data.projectId == null) {
          common_vendor.index.showToast({ title: "项目不存在", icon: "none" });
          return;
        }
        this.editingDraftId = null;
        this.editingProjectId = projectId;
        this.applyProjectDetailToForm(data);
        this.currentStep = 1;
        this.stepStatus = { 1: true, 2: true, 3: true };
        common_vendor.index.setNavigationBarTitle({ title: "编辑项目" });
        common_vendor.index.showToast({ title: "已进入编辑", icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/create/index.vue:499", "加载项目失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    },
    saveDraft() {
      if (this.editingProjectId) {
        common_vendor.index.showToast({ title: "编辑已发布项目请使用「保存修改」", icon: "none" });
        return;
      }
      if (!this.form.name) {
        common_vendor.index.showToast({ title: "请填写项目名称", icon: "none" });
        return;
      }
      const draftData = {
        currentStep: this.currentStep,
        stepStatus: { ...this.stepStatus },
        form: JSON.parse(JSON.stringify(this.form))
      };
      let drafts = common_vendor.index.getStorageSync("projectDrafts") || [];
      if (this.editingDraftId) {
        drafts = drafts.map(
          (d) => d.id === this.editingDraftId ? { ...d, ...draftData } : d
        );
        common_vendor.index.showToast({ title: "草稿已更新", icon: "success" });
      } else {
        const newDraft = {
          id: Date.now(),
          title: this.form.name,
          ...draftData
        };
        drafts.unshift(newDraft);
        common_vendor.index.showToast({ title: "草稿保存成功", icon: "success" });
      }
      common_vendor.index.setStorageSync("projectDrafts", drafts);
      setTimeout(() => {
        this.currentStep = 1;
        this.stepStatus = { 1: false, 2: false, 3: false };
        this.form = {
          name: "",
          desc: "",
          category: "",
          apiStatus: 2,
          level: 1,
          projectType: "创新训练",
          projectFeatures: "",
          tags: "",
          isAnonymous: false,
          contactInfo: "",
          deadlineDate: "",
          deadlineTime: "23:59",
          allowCrossMajor: false,
          roles: [{ name: "", count: "", requirement: "" }]
        };
        this.editingDraftId = null;
      }, 1500);
    },
    nextStep() {
      if (this.currentStep < 3) {
        const v = this.validateStep(this.currentStep);
        if (!v.ok) {
          common_vendor.index.showToast({ title: v.msg, icon: "none" });
          return;
        }
        this.stepStatus[this.currentStep] = true;
        this.currentStep++;
        this.scrollTop = 0;
      } else {
        this.submitProject();
      }
    },
    // ======================
    // ✅ 发布项目 → 自动删除草稿
    // ======================
    buildCreateOrUpdatePayload() {
      const deadlineRecruit = this.buildDeadlineRecruit();
      const roleRequirements = this.form.roles.map((item) => ({
        role: item.name,
        memberQuota: Number(item.count),
        recruitRequirements: item.requirement || ""
      }));
      const anon = !!this.form.isAnonymous;
      const lv = Number(this.form.level);
      const st = Number(this.form.apiStatus);
      return {
        name: this.form.name.trim(),
        belongTrack: this.form.category,
        level: Number.isFinite(lv) && lv >= 1 && lv <= 3 ? lv : 1,
        projectType: this.form.projectType,
        projectIntro: this.form.desc,
        projectFeatures: (this.form.projectFeatures || "").trim(),
        tags: (this.form.tags || "").trim(),
        allowCrossMajor: this.form.allowCrossMajor,
        isAnonymous: anon,
        contactInfo: anon ? String(this.form.contactInfo || "").trim() : "",
        deadlineRecruit,
        status: Number.isFinite(st) && st >= 0 && st <= 4 ? st : 2,
        roleRequirements
      };
    },
    async submitProject() {
      var _a;
      const v = this.validateStep(3);
      if (!v.ok) {
        common_vendor.index.showToast({ title: v.msg, icon: "none" });
        return;
      }
      const isUpdate = !!this.editingProjectId;
      const params = this.buildCreateOrUpdatePayload();
      if (!params.deadlineRecruit) {
        common_vendor.index.showToast({ title: "请选择截止时间", icon: "none" });
        return;
      }
      try {
        if (isUpdate) {
          await common_api_index.api.updateProject(this.editingProjectId, params);
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          common_vendor.index.$emit("project:updated", { projectId: this.editingProjectId });
        } else {
          const res = await common_api_index.api.createProject(params);
          common_vendor.index.showToast({ title: "发布成功", icon: "success" });
          common_vendor.index.$emit("project:created", (res == null ? void 0 : res.data) || null);
          if (this.editingDraftId) {
            let drafts = common_vendor.index.getStorageSync("projectDrafts") || [];
            drafts = drafts.filter((d) => d.id !== this.editingDraftId);
            common_vendor.index.setStorageSync("projectDrafts", drafts);
            this.editingDraftId = null;
          }
        }
        setTimeout(() => {
          this.resetToNewProject();
          if (isUpdate) {
            common_vendor.index.navigateTo({ url: "/pages/user/my-projects?type=launched" });
          } else {
            common_vendor.index.switchTab({ url: "/pages/square/index" });
          }
        }, 600);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/create/index.vue:651", isUpdate ? "保存失败" : "发布失败", err);
        common_vendor.index.showToast({
          title: ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.message) || (err == null ? void 0 : err.message) || (isUpdate ? "保存失败" : "发布失败"),
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _component_FormCard = common_vendor.resolveComponent("FormCard");
  _component_FormCard();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.editingProjectId
  }, $data.editingProjectId ? {
    b: common_vendor.o((...args) => $options.onBackFromEdit && $options.onBackFromEdit(...args))
  } : {}, {
    c: $data.stepStatus[1]
  }, $data.stepStatus[1] ? {} : {}, {
    d: common_vendor.n($data.stepStatus[1] ? "done" : $data.currentStep === 1 ? "active" : ""),
    e: common_vendor.o(($event) => $options.goStep(1)),
    f: $data.stepStatus[2]
  }, $data.stepStatus[2] ? {} : {}, {
    g: common_vendor.n($data.stepStatus[2] ? "done" : $data.currentStep === 2 ? "active" : ""),
    h: common_vendor.o(($event) => $options.goStep(2)),
    i: common_vendor.n($data.stepStatus[3] ? "done" : $data.currentStep === 3 ? "active" : ""),
    j: common_vendor.o(($event) => $options.goStep(3)),
    k: $data.currentStep === 1
  }, $data.currentStep === 1 ? {
    l: $data.form.name,
    m: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    n: $data.form.desc,
    o: common_vendor.o(($event) => $data.form.desc = $event.detail.value),
    p: common_vendor.p({
      title: "项目基本信息"
    }),
    q: common_vendor.t($data.form.category || "请选择（如大创、挑战杯）"),
    r: common_vendor.o((...args) => $options.selectCategory && $options.selectCategory(...args)),
    s: common_vendor.t($options.levelDisplay),
    t: common_vendor.o((...args) => $options.selectLevel && $options.selectLevel(...args)),
    v: common_vendor.t($data.form.projectType || "请选择"),
    w: common_vendor.o((...args) => $options.selectProjectType && $options.selectProjectType(...args)),
    x: common_vendor.t($options.apiStatusDisplay),
    y: common_vendor.o((...args) => $options.selectApiStatus && $options.selectApiStatus(...args)),
    z: common_vendor.p({
      title: "赛道与分级（接口 belongTrack / level）"
    }),
    A: $data.form.projectFeatures,
    B: common_vendor.o(($event) => $data.form.projectFeatures = $event.detail.value),
    C: $data.form.tags,
    D: common_vendor.o(($event) => $data.form.tags = $event.detail.value),
    E: common_vendor.p({
      title: "亮点与标签（接口 projectFeatures / tags）"
    }),
    F: common_vendor.o((...args) => $options.addRole && $options.addRole(...args)),
    G: common_vendor.f($data.form.roles, (item, idx, i0) => {
      return {
        a: common_vendor.t(idx + 1),
        b: item.name,
        c: common_vendor.o(($event) => item.name = $event.detail.value, idx),
        d: item.count,
        e: common_vendor.o(($event) => item.count = $event.detail.value, idx),
        f: idx
      };
    }),
    H: common_vendor.p({
      title: "招聘需求"
    })
  } : {}, {
    I: $data.currentStep === 2
  }, $data.currentStep === 2 ? common_vendor.e({
    J: common_vendor.t($data.form.deadlineDate || "选择日期"),
    K: $data.form.deadlineDate,
    L: common_vendor.o((...args) => $options.onDeadlineDateChange && $options.onDeadlineDateChange(...args)),
    M: common_vendor.t($data.form.deadlineTime || "选择时间"),
    N: $data.form.deadlineTime,
    O: common_vendor.o((...args) => $options.onDeadlineTimeChange && $options.onDeadlineTimeChange(...args)),
    P: common_vendor.n($data.form.allowCrossMajor ? "on" : ""),
    Q: common_vendor.o(($event) => $data.form.allowCrossMajor = !$data.form.allowCrossMajor),
    R: common_vendor.n($data.form.isAnonymous ? "on" : ""),
    S: common_vendor.o(($event) => $data.form.isAnonymous = !$data.form.isAnonymous),
    T: $data.form.isAnonymous
  }, $data.form.isAnonymous ? {
    U: $data.form.contactInfo,
    V: common_vendor.o(($event) => $data.form.contactInfo = $event.detail.value)
  } : {}, {
    W: common_vendor.p({
      title: "招募设置"
    }),
    X: common_vendor.f($data.form.roles, (item, idx, i0) => {
      return {
        a: common_vendor.t(item.name || "未命名角色"),
        b: common_vendor.t(item.count || 0),
        c: item.requirement,
        d: common_vendor.o(($event) => item.requirement = $event.detail.value, idx),
        e: idx
      };
    }),
    Y: common_vendor.p({
      title: "角色详情配置"
    })
  }) : {}, {
    Z: $data.currentStep === 3
  }, $data.currentStep === 3 ? common_vendor.e({
    aa: common_vendor.t($data.form.name || "基于AI的校园组队平台"),
    ab: common_vendor.t($data.form.category || "大创项目"),
    ac: common_vendor.t($options.apiStatusDisplay),
    ad: common_vendor.t($options.levelDisplay),
    ae: common_vendor.t($data.form.projectType || "创新训练"),
    af: $data.form.projectFeatures
  }, $data.form.projectFeatures ? {
    ag: common_vendor.t($data.form.projectFeatures)
  } : {}, {
    ah: $data.form.tags
  }, $data.form.tags ? {
    ai: common_vendor.t($data.form.tags)
  } : {}, {
    aj: $data.form.isAnonymous
  }, $data.form.isAnonymous ? {
    ak: common_vendor.t($data.form.contactInfo || "未填写")
  } : {}, {
    al: common_vendor.t($data.form.desc || "本项目旨在利用人工智能技术，为华师大学生提供一个高效，精准的比赛组队平台"),
    am: common_vendor.t($options.deadlinePreview || "2025-01-23 23:59"),
    an: common_vendor.f($data.form.roles, (item, idx, i0) => {
      return {
        a: common_vendor.t(item.name || "前端开发"),
        b: common_vendor.t(item.count || 2),
        c: common_vendor.t(item.requirement || "熟练掌握Vue/React，有小程序开发经验"),
        d: idx
      };
    })
  }) : {}, {
    ao: $data.scrollTop,
    ap: !$data.editingProjectId
  }, !$data.editingProjectId ? {
    aq: common_vendor.o((...args) => $options.saveDraft && $options.saveDraft(...args))
  } : {}, {
    ar: common_vendor.t($data.currentStep === 3 ? $data.editingProjectId ? "保存修改" : "发布" : "下一步"),
    as: common_vendor.o((...args) => $options.nextStep && $options.nextStep(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cd35ab0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/create/index.js.map
