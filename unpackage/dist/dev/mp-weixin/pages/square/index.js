"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_index = require("../../common/api/index.js");
const ProjectCard = () => "../../components/ProjectCard.js";
const Loading = () => "../../components/Loading.js";
const _sfc_main = {
  components: {
    ProjectCard,
    Loading
  },
  data() {
    return {
      isNavigating: false,
      loading: false,
      currentSort: "recommend",
      currentCategory: "all",
      searchKeyword: "",
      showFilter: false,
      projectList: [],
      currentPage: 1,
      // 🔥 筛选相关数据
      activeFilterTab: "grade",
      // 当前激活的筛选标签
      // 选项列表
      gradeOptions: ["全部", "大一", "大二", "大三", "大四", "研究生"],
      competitionOptions: ["互联网+", "大创", "挑战杯", "其他"],
      techOptions: ["Vue", "React", "Python", "Java", "C++", "前端", "后端", "AI"],
      // 已选中的选项
      selectedGrades: [],
      selectedCompetitions: [],
      selectedTechs: []
    };
  },
  computed: {
    filteredProjects() {
      let result = [...this.projectList];
      result = result.map((item) => {
        const st = this.mapProjectStatusForCard(item.status);
        return {
          id: item.projectId,
          name: item.name,
          desc: item.projectIntro,
          category: item.belongTrack === "大创" ? "innovation" : "internet+",
          tags: item.tags ? item.tags.split(",") : [],
          founder: this.mapFounderForListItem(item),
          status: st.text,
          statusClass: st.class,
          deadline: item.deadlineRecruit ? item.deadlineRecruit.slice(5, 10) : "",
          submitTime: item.releaseTime || "暂无发布时间",
          grade: item.grade || "不限",
          competition: item.competition || "其他",
          techStack: item.techStack ? item.techStack.split(",") : []
        };
      });
      if (this.currentCategory !== "all") {
        result = result.filter((item) => item.category === this.currentCategory);
      }
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter((item) => {
          var _a, _b, _c;
          const nameMatch = (_a = item.name) == null ? void 0 : _a.toLowerCase().includes(keyword);
          const descMatch = (_b = item.desc) == null ? void 0 : _b.toLowerCase().includes(keyword);
          const tagMatch = (_c = item.tags) == null ? void 0 : _c.some((t) => t.toLowerCase().includes(keyword));
          return nameMatch || descMatch || tagMatch;
        });
      }
      if (this.selectedGrades.length > 0 && !this.selectedGrades.includes("全部")) {
        result = result.filter(
          (item) => this.selectedGrades.includes(item.grade)
        );
      }
      if (this.selectedCompetitions.length > 0) {
        result = result.filter(
          (item) => this.selectedCompetitions.includes(item.competition)
        );
      }
      if (this.selectedTechs.length > 0) {
        result = result.filter(
          (item) => item.techStack.some((tech) => this.selectedTechs.includes(tech))
        );
      }
      if (this.currentSort === "latest") {
        result.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
      } else {
        result.sort(() => Math.random() - 0.5);
      }
      common_vendor.index.__f__("log", "at pages/square/index.vue:227", "最终要渲染的数据：", result);
      return result;
    }
  },
  onLoad() {
    common_vendor.index.$off("project:created");
    common_vendor.index.$on("project:created", () => {
      this.currentPage = 1;
      this.fetchProjects();
    });
    this.fetchProjects();
  },
  onShow() {
    this.currentPage = 1;
    this.fetchProjects();
  },
  onUnload() {
    common_vendor.index.$off("project:created");
  },
  methods: {
    /** 与 TeamMatching 接口文档一致：仅 3完成 / 4终止 视为已结束 */
    mapProjectStatusForCard(status) {
      const n = Number(status);
      if (!Number.isFinite(n)) {
        return { text: "招募中", class: "status-recruiting" };
      }
      if (n === 3 || n === 4) {
        return { text: "已结束", class: "status-ended" };
      }
      if (n === 0) {
        return { text: "草拟", class: "status-draft" };
      }
      if (n === 1) {
        return { text: "实施中", class: "status-recruiting" };
      }
      if (n === 2) {
        return { text: "招募中", class: "status-recruiting" };
      }
      return { text: "招募中", class: "status-recruiting" };
    },
    /** 列表项是否匿名发布（需后端在 ProjectListItem 中带 isAnonymous） */
    isListItemAnonymous(item) {
      const v = item == null ? void 0 : item.isAnonymous;
      return v === true || v === 1 || v === "1" || v === "true";
    },
    /** 匿名时不展示真实昵称，与接口说明一致 */
    mapFounderForListItem(item) {
      var _a;
      if (this.isListItemAnonymous(item)) {
        return "匿名用户";
      }
      return ((_a = item.publisherInfo) == null ? void 0 : _a.nickname) || "匿名";
    },
    buildProjectListQuery() {
      const params = {
        sort: this.currentSort,
        keyword: this.searchKeyword,
        page: this.currentPage || 1,
        size: 10
      };
      if (this.currentCategory && this.currentCategory !== "all") {
        const TRACK_MAP = {
          "internet+": "互联网+",
          innovation: "大创"
        };
        params.track = TRACK_MAP[this.currentCategory] || this.currentCategory;
      }
      return params;
    },
    async fetchProjects() {
      var _a;
      this.loading = true;
      try {
        const res = await common_api_index.api.getProjectList(this.buildProjectListQuery());
        common_vendor.index.__f__("log", "at pages/square/index.vue:310", "接口原始返回：", res);
        if (res.data && Array.isArray(res.data)) {
          this.projectList = res.data;
        } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
          this.projectList = res.data.list;
        } else {
          common_vendor.index.__f__("warn", "at pages/square/index.vue:317", "接口返回格式异常或无数据", res);
          this.projectList = [];
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/square/index.vue:322", "捕获到异常（可能是Code非0），尝试提取数据...", err);
        const msg = ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.message) || (err == null ? void 0 : err.message) || (typeof (err == null ? void 0 : err.errMsg) === "string" ? err.errMsg : "") || "获取项目失败";
        common_vendor.index.showToast({ title: msg, icon: "none" });
        if (err.data && Array.isArray(err.data)) {
          common_vendor.index.__f__("log", "at pages/square/index.vue:332", "从错误中抢救到了数据！");
          this.projectList = err.data;
        } else if (err.data && err.data.data && Array.isArray(err.data.data)) {
          this.projectList = err.data.data;
        } else {
          this.projectList = [];
        }
      } finally {
        this.loading = false;
      }
    },
    changeSort(t) {
      this.currentSort = t;
      this.currentPage = 1;
      this.fetchProjects();
    },
    changeCategory(t) {
      this.currentCategory = t;
      this.currentPage = 1;
      this.fetchProjects();
    },
    handleSearch() {
      this.currentPage = 1;
      this.fetchProjects();
    },
    goProjectDetail(project) {
      if (this.isNavigating)
        return;
      this.isNavigating = true;
      common_vendor.index.__f__("log", "at pages/square/index.vue:362", "点击的项目对象：", project);
      const id = project.id;
      if (!id) {
        this.isNavigating = false;
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/projectDetail/index?projectId=${id}`,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/square/index.vue:373", "跳转失败", err);
        },
        complete: () => {
          setTimeout(() => {
            this.isNavigating = false;
          }, 500);
        }
      });
    },
    // 🔥 筛选相关方法
    // 🔥 修复：真正的多选逻辑（点谁选谁，互不干扰）
    toggleSelect(type, item) {
      let list;
      if (type === "grade")
        list = this.selectedGrades;
      else if (type === "competition")
        list = this.selectedCompetitions;
      else if (type === "tech")
        list = this.selectedTechs;
      const index = list.indexOf(item);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(item);
      }
    },
    // 清除所有筛选
    clearAllFilter() {
      this.selectedGrades = [];
      this.selectedCompetitions = [];
      this.selectedTechs = [];
    },
    // 确定筛选：关闭弹窗
    confirmFilter() {
      this.showFilter = false;
    },
    // 关闭筛选弹窗
    closeFilter() {
      this.showFilter = false;
    }
  }
};
if (!Array) {
  const _component_Loading = common_vendor.resolveComponent("Loading");
  const _component_ProjectCard = common_vendor.resolveComponent("ProjectCard");
  (_component_Loading + _component_ProjectCard)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.currentSort === "recommend" ? 1 : "",
    b: common_vendor.o(($event) => $options.changeSort("recommend")),
    c: $data.currentSort === "latest" ? 1 : "",
    d: common_vendor.o(($event) => $options.changeSort("latest")),
    e: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    f: $data.searchKeyword,
    g: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    h: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    i: $data.currentCategory === "all" ? 1 : "",
    j: common_vendor.o(($event) => $options.changeCategory("all")),
    k: $data.currentCategory === "internet+" ? 1 : "",
    l: common_vendor.o(($event) => $options.changeCategory("internet+")),
    m: $data.currentCategory === "innovation" ? 1 : "",
    n: common_vendor.o(($event) => $options.changeCategory("innovation")),
    o: common_vendor.o(($event) => $data.showFilter = true),
    p: $data.loading
  }, $data.loading ? {
    q: common_vendor.p({
      show: "true",
      text: "加载项目中..."
    })
  } : common_vendor.e({
    r: $options.filteredProjects.length === 0
  }, $options.filteredProjects.length === 0 ? {} : {}, {
    s: common_vendor.f($options.filteredProjects, (project, index, i0) => {
      return {
        a: project.id || index,
        b: common_vendor.o(($event) => $options.goProjectDetail(project), project.id || index),
        c: "0838208e-1-" + i0,
        d: common_vendor.p({
          project
        })
      };
    })
  }), {
    t: $data.showFilter
  }, $data.showFilter ? common_vendor.e({
    v: common_vendor.o((...args) => $options.closeFilter && $options.closeFilter(...args)),
    w: $data.activeFilterTab === "grade" ? 1 : "",
    x: common_vendor.o(($event) => $data.activeFilterTab = "grade"),
    y: $data.activeFilterTab === "competition" ? 1 : "",
    z: common_vendor.o(($event) => $data.activeFilterTab = "competition"),
    A: $data.activeFilterTab === "tech" ? 1 : "",
    B: common_vendor.o(($event) => $data.activeFilterTab = "tech"),
    C: $data.activeFilterTab === "grade"
  }, $data.activeFilterTab === "grade" ? {
    D: common_vendor.f($data.gradeOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: $data.selectedGrades.includes(item) ? 1 : "",
        c: common_vendor.o(($event) => $options.toggleSelect("grade", item), item),
        d: item
      };
    })
  } : {}, {
    E: $data.activeFilterTab === "competition"
  }, $data.activeFilterTab === "competition" ? {
    F: common_vendor.f($data.competitionOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: $data.selectedCompetitions.includes(item) ? 1 : "",
        c: common_vendor.o(($event) => $options.toggleSelect("competition", item), item),
        d: item
      };
    })
  } : {}, {
    G: $data.activeFilterTab === "tech"
  }, $data.activeFilterTab === "tech" ? {
    H: common_vendor.f($data.techOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: $data.selectedTechs.includes(item) ? 1 : "",
        c: common_vendor.o(($event) => $options.toggleSelect("tech", item), item),
        d: item
      };
    })
  } : {}, {
    I: common_vendor.o((...args) => $options.clearAllFilter && $options.clearAllFilter(...args)),
    J: common_vendor.o((...args) => $options.confirmFilter && $options.confirmFilter(...args)),
    K: common_vendor.o(() => {
    }),
    L: common_vendor.o((...args) => $options.closeFilter && $options.closeFilter(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0838208e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/square/index.js.map
