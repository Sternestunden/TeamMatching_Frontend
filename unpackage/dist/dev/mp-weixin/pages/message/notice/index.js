"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      noticeList: [
        {
          id: 1,
          title: "项目审核通知",
          time: "今天 09:15",
          content: "你提交的「AI图像识别」项目已审核通过，可正常招募队员",
          status: "已读",
          statusClass: "status-read",
          isNew: false
        },
        {
          id: 2,
          title: "系统公告",
          time: "昨天 14:00",
          content: "本周日将关闭项目报名通道，请及时完成项目提交",
          status: "未读",
          statusClass: "status-unread",
          isNew: true
        }
      ]
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 处理通知
    handleNotice(item) {
      item.isNew = false;
      item.status = "已读";
      item.statusClass = "status-read";
      common_vendor.index.navigateTo({ url: `/pages/message/notice/noticeDetail?id=${item.id}` });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.noticeList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.time),
        c: common_vendor.t(item.content),
        d: common_vendor.t(item.status),
        e: common_vendor.n(item.statusClass),
        f: item.isNew
      }, item.isNew ? {} : {}, {
        g: index,
        h: common_vendor.o(($event) => $options.handleNotice(item), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-25f9394e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/notice/index.js.map
