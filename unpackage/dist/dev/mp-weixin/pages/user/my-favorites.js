"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      favorites: [
        {
          type: "项目",
          title: "基于AI的校园组队平台",
          subtitle: "正在招募前端 / 算法同学",
          time: "昨天"
        },
        {
          type: "帖子",
          title: "分享一次校赛组队经验",
          subtitle: "如何找到靠谱队友",
          time: "2天前"
        }
      ]
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.favorites, (item, index, i0) => {
      return {
        a: common_vendor.t(item.type),
        b: common_vendor.t(item.time),
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.subtitle),
        e: index
      };
    }),
    b: $data.favorites.length === 0
  }, $data.favorites.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/my-favorites.js.map
