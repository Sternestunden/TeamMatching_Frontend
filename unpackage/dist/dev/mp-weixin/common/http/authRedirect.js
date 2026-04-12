"use strict";
const common_vendor = require("../vendor.js");
let redirectScheduled = false;
const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/send-code", "/auth/wx-login"];
function shouldSkipAuthRedirect(config) {
  const url = String((config == null ? void 0 : config.url) || (config == null ? void 0 : config.fullPath) || "");
  return PUBLIC_AUTH_PATHS.some((p) => url.includes(p));
}
function isUnauthorizedCode(code) {
  const n = Number(code);
  return n === 401;
}
function scheduleRelogin(config, message) {
  if (redirectScheduled)
    return;
  if (config && shouldSkipAuthRedirect(config))
    return;
  redirectScheduled = true;
  try {
    common_vendor.index.removeStorageSync("access-token");
    common_vendor.index.removeStorageSync("userInfo");
  } catch (e) {
  }
  const tip = message || "登录已过期，请重新登录";
  common_vendor.index.showToast({ title: tip, icon: "none", duration: 2e3 });
  setTimeout(() => {
    common_vendor.index.reLaunch({
      url: "/pages/login/login",
      complete: () => {
        setTimeout(() => {
          redirectScheduled = false;
        }, 800);
      }
    });
  }, 500);
}
exports.isUnauthorizedCode = isUnauthorizedCode;
exports.scheduleRelogin = scheduleRelogin;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/http/authRedirect.js.map
