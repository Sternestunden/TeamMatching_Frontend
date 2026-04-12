"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      inviteList: [
        {
          id: 1,
          avatar: "",
          name: "李队长",
          time: "今天 10:20",
          content: "邀请你加入「第十届互联网+创新大赛」项目组",
          status: "待确认",
          statusClass: "status-pending",
          isNew: true
        },
        {
          id: 2,
          avatar: "",
          name: "王同学",
          time: "昨天 18:30",
          content: "邀请你加入「校园二手交易平台」项目组",
          status: "已拒绝",
          statusClass: "status-reject",
          isNew: false
        }
      ]
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 处理邀请（点击进入详情/操作）
    handleInvite(item) {
      item.isNew = false;
      common_vendor.index.navigateTo({ url: `/pages/message/invite/inviteDetail?id=${item.id}` });
    }
  }
};
if (!Array) {
  const _component_Avatar = common_vendor.resolveComponent("Avatar");
  _component_Avatar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.inviteList, (item, index, i0) => {
      return common_vendor.e({
        a: "8501fd4a-0-" + i0,
        b: common_vendor.p({
          src: item.avatar,
          size: "48"
        }),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.time),
        e: common_vendor.t(item.content),
        f: common_vendor.t(item.status),
        g: common_vendor.n(item.statusClass),
        h: item.isNew
      }, item.isNew ? {} : {}, {
        i: index,
        j: common_vendor.o(($event) => $options.handleInvite(item), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8501fd4a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/invite/index.js.map
