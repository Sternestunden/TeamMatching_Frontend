"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      searchKeyword: "",
      showSearchModal: false,
      showAddModal: false,
      hasMyCard: false,
      form: { name: "", major: "", grade: "", tags: [], intro: "", interest: "", resume: "" },
      allTags: ["前端", "后端", "产品", "AI", "Java", "Vue", "小程序", "设计"],
      talentList: [
        { id: 1, name: "李同学", tags: ["前端", "Vue"], major: "计算机", grade: "大二", intro: "擅长小程序", interest: "互联网+", resume: "" },
        { id: 2, name: "张同学", tags: ["后端", "Java"], major: "软工", grade: "大三", intro: "接口开发", interest: "大创", resume: "" },
        { id: 3, name: "王同学", tags: ["产品", "设计"], major: "数媒", grade: "大四", intro: "产品策划", interest: "", resume: "" }
      ]
    };
  },
  computed: {
    filteredList() {
      if (!this.searchKeyword)
        return this.talentList;
      const k = this.searchKeyword.toLowerCase();
      return this.talentList.filter(
        (item) => item.name.toLowerCase().includes(k) || item.tags.some((t) => t.toLowerCase().includes(k))
      );
    }
  },
  onLoad() {
    const my = common_vendor.index.getStorageSync("myCard");
    if (my) {
      this.hasMyCard = true;
      const exist = this.talentList.find((i) => i.id === 999);
      if (!exist)
        this.talentList.unshift({ ...my, id: 999 });
    }
  },
  methods: {
    goSearch() {
      this.showSearchModal = true;
    },
    closeSearchModal() {
      this.showSearchModal = false;
    },
    onSearch() {
      this.closeSearchModal();
    },
    openAddModal() {
      const my = common_vendor.index.getStorageSync("myCard");
      if (my)
        this.form = { ...my };
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    toggleTag(tag) {
      const i = this.form.tags.indexOf(tag);
      i > -1 ? this.form.tags.splice(i, 1) : this.form.tags.push(tag);
    },
    uploadResume() {
      common_vendor.index.chooseMessageFile({
        count: 1,
        type: "all",
        success: (res) => {
          this.form.resume = res.tempFiles[0].path;
          common_vendor.index.showToast({ title: "已选：" + res.tempFiles[0].name, icon: "success" });
        },
        fail: () => {
          common_vendor.index.chooseMedia({
            count: 1,
            mediaType: ["image"],
            success: (res) => {
              this.form.resume = res.tempFiles[0].tempFilePath;
              common_vendor.index.showToast({ title: "已选图片", icon: "success" });
            }
          });
        }
      });
    },
    submitCard() {
      const { name, major, grade, tags, intro } = this.form;
      if (!name || !major || !grade || !tags.length || !intro) {
        common_vendor.index.showToast({ title: "请填必填项", icon: "none" });
        return;
      }
      const myCard = { ...this.form };
      common_vendor.index.setStorageSync("myCard", myCard);
      const idx = this.talentList.findIndex((i) => i.id === 999);
      if (idx > -1)
        this.talentList.splice(idx, 1);
      this.talentList.unshift({ ...myCard, id: 999 });
      this.hasMyCard = true;
      this.closeAddModal();
      common_vendor.index.showToast({ title: "保存成功", icon: "success" });
    },
    goUserProfile(user) {
      try {
        const str = encodeURIComponent(JSON.stringify(user));
        common_vendor.index.navigateTo({ url: `/pages/community/userprofile?user=${str}` });
      } catch (e) {
        common_vendor.index.showToast({ title: "跳转失败", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.searchKeyword,
    b: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    c: common_vendor.o((...args) => $options.goSearch && $options.goSearch(...args)),
    d: common_vendor.f($options.filteredList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.f(item.tags, (tag, i, i1) => {
          return {
            a: common_vendor.t(tag),
            b: i
          };
        }),
        c: index,
        d: common_vendor.o(($event) => $options.goUserProfile(item), index)
      };
    }),
    e: common_vendor.t($data.hasMyCard ? "编辑我的卡片" : "添加我的卡片"),
    f: common_vendor.o((...args) => $options.openAddModal && $options.openAddModal(...args)),
    g: $data.showAddModal
  }, $data.showAddModal ? {
    h: common_vendor.o((...args) => $options.closeAddModal && $options.closeAddModal(...args)),
    i: common_vendor.t($data.hasMyCard ? "编辑我的卡片" : "添加我的卡片"),
    j: common_vendor.o((...args) => $options.submitCard && $options.submitCard(...args)),
    k: $data.form.name,
    l: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    m: $data.form.major,
    n: common_vendor.o(($event) => $data.form.major = $event.detail.value),
    o: $data.form.grade,
    p: common_vendor.o(($event) => $data.form.grade = $event.detail.value),
    q: common_vendor.f($data.allTags, (t, k0, i0) => {
      return {
        a: common_vendor.t(t),
        b: $data.form.tags.includes(t) ? 1 : "",
        c: t,
        d: common_vendor.o(($event) => $options.toggleTag(t), t)
      };
    }),
    r: $data.form.intro,
    s: common_vendor.o(($event) => $data.form.intro = $event.detail.value),
    t: $data.form.interest,
    v: common_vendor.o(($event) => $data.form.interest = $event.detail.value),
    w: common_vendor.o((...args) => $options.uploadResume && $options.uploadResume(...args)),
    x: common_vendor.o((...args) => $options.closeAddModal && $options.closeAddModal(...args))
  } : {}, {
    y: $data.showSearchModal
  }, $data.showSearchModal ? {
    z: common_vendor.o((...args) => $options.closeSearchModal && $options.closeSearchModal(...args)),
    A: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    B: $data.searchKeyword,
    C: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    D: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    E: common_vendor.o((...args) => $options.closeSearchModal && $options.closeSearchModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-35ff9bcb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/index.js.map
