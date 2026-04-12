"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      noticeInfo: {
        id: "",
        title: "项目审核通知",
        time: "2026-03-15 09:15",
        content: "你提交的「AI图像识别」项目已审核通过，可正常招募队员。请及时完善项目信息，确保招募信息准确。",
        hasProject: true,
        // 是否关联项目
        projectId: 1
      }
    };
  },
  onLoad(options) {
    this.noticeInfo.id = options.id;
    this.fetchNoticeDetail();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 获取通知详情
    fetchNoticeDetail() {
      common_vendor.index.__f__("log", "at pages/message/notice/noticeDetail.vue:55", "请求通知详情，ID：", this.noticeInfo.id);
    },
    // 跳转到关联项目
    goToProject() {
      common_vendor.index.navigateTo({
        url: `/pages/projectDetail/index?id=${this.noticeInfo.projectId}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.noticeInfo.title),
    b: common_vendor.t($data.noticeInfo.time),
    c: common_vendor.t($data.noticeInfo.content),
    d: $data.noticeInfo.hasProject
  }, $data.noticeInfo.hasProject ? {
    e: common_vendor.o((...args) => $options.goToProject && $options.goToProject(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5df9fb36"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/notice/noticeDetail.js.map
