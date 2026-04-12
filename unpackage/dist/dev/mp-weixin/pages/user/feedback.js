"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userName: "",
      // 从父页面传过来的用户名
      selectedScore: 0,
      // 选中的评分 1-5
      feedbackContent: "",
      // 反馈内容
      uploadImages: [],
      // 上传的图片列表
      contactInfo: ""
      // 联系方式
    };
  },
  onLoad(options) {
    if (options.userName) {
      this.userName = decodeURIComponent(options.userName);
    }
    common_vendor.index.setNavigationBarTitle({ title: "意见反馈" });
  },
  methods: {
    // 选择评分
    selectScore(score) {
      this.selectedScore = score;
    },
    // 选择图片（兼容 H5 + 小程序）
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - this.uploadImages.length,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadImages = [...this.uploadImages, ...res.tempFilePaths];
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/user/feedback.vue:141", "选择图片失败", err);
        }
      });
    },
    // 删除图片
    deleteImage(index) {
      this.uploadImages.splice(index, 1);
    },
    // 提交反馈
    handleSubmit() {
      if (this.selectedScore === 0) {
        common_vendor.index.showToast({ title: "请先选择满意度", icon: "none" });
        return;
      }
      const submitData = {
        userName: this.userName,
        score: this.selectedScore,
        content: this.feedbackContent,
        images: this.uploadImages,
        contact: this.contactInfo
      };
      common_vendor.index.__f__("log", "at pages/user/feedback.vue:168", "提交的反馈数据：", submitData);
      common_vendor.index.showToast({ title: "提交成功", icon: "success" });
      setTimeout(() => common_vendor.index.navigateBack(), 1500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.userName),
    b: $data.selectedScore === 1 ? 1 : "",
    c: common_vendor.o(($event) => $options.selectScore(1)),
    d: $data.selectedScore === 2 ? 1 : "",
    e: common_vendor.o(($event) => $options.selectScore(2)),
    f: $data.selectedScore === 3 ? 1 : "",
    g: common_vendor.o(($event) => $options.selectScore(3)),
    h: $data.selectedScore === 4 ? 1 : "",
    i: common_vendor.o(($event) => $options.selectScore(4)),
    j: $data.selectedScore === 5 ? 1 : "",
    k: common_vendor.o(($event) => $options.selectScore(5)),
    l: $data.feedbackContent,
    m: common_vendor.o(($event) => $data.feedbackContent = $event.detail.value),
    n: $data.uploadImages.length < 9
  }, $data.uploadImages.length < 9 ? {
    o: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    p: common_vendor.f($data.uploadImages, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.deleteImage(index), index),
        c: index
      };
    }),
    q: $data.contactInfo,
    r: common_vendor.o(($event) => $data.contactInfo = $event.detail.value),
    s: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fff60cbe"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/feedback.js.map
