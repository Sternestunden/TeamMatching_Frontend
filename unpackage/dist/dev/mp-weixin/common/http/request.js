"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("../vendor.js");
const common_config_env = require("../config/env.js");
const common_http_authRedirect = require("./authRedirect.js");
const request = (vm) => {
  common_vendor.index.$u.http.setConfig((config) => {
    config.baseURL = common_config_env.local.baseUrl;
    config.custom = {
      catch: true,
      auth: true
    };
    config.header = {
      "Content-Type": "application/json",
      // 新文件的默认JSON请求头
      ...config.header
      // 保留原有自定义请求头
    };
    return config;
  });
  common_vendor.index.$u.http.interceptors.request.use((config) => {
    var _a;
    common_vendor.index.showLoading({
      title: "加载中"
    });
    config.data = config.data || {};
    config.header = config.header || {};
    if ((_a = config == null ? void 0 : config.custom) == null ? void 0 : _a.auth) {
      const token = common_vendor.index.getStorageSync("access-token");
      if (token) {
        config.header["access-token"] = token;
        config.header["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  }, (config) => {
    return Promise.reject(config);
  });
  common_vendor.index.$u.http.interceptors.response.use((response) => {
    common_vendor.index.hideLoading();
    const data = response.data || {};
    const cfg = response.config || {};
    if (response.statusCode === 401) {
      common_http_authRedirect.scheduleRelogin(cfg, (data == null ? void 0 : data.message) || (data == null ? void 0 : data.error));
      return Promise.reject(response);
    }
    if (response.statusCode !== 200) {
      common_vendor.index.$u.toast((data == null ? void 0 : data.message) || "接口请求失败");
      return Promise.reject(response);
    }
    const custom = cfg.custom || {};
    if (data.code !== void 0 && data.code !== 200) {
      if (common_http_authRedirect.isUnauthorizedCode(data.code)) {
        common_http_authRedirect.scheduleRelogin(cfg, data.message);
        if (custom == null ? void 0 : custom.catch) {
          return Promise.reject(data);
        }
        return new Promise(() => {
        });
      }
      if (custom.toast !== false) {
        common_vendor.index.$u.toast(data.message || "请求失败");
      }
      if (custom == null ? void 0 : custom.catch) {
        return Promise.reject(data);
      }
      return new Promise(() => {
      });
    }
    return data === void 0 ? {} : data;
  }, (response) => {
    common_vendor.index.hideLoading();
    const cfg = (response == null ? void 0 : response.config) || {};
    const data = (response == null ? void 0 : response.data) || {};
    const status = response == null ? void 0 : response.statusCode;
    if (status === 401) {
      common_http_authRedirect.scheduleRelogin(cfg, (data == null ? void 0 : data.message) || (data == null ? void 0 : data.error));
      return Promise.reject(response);
    }
    const errorMsg = (data == null ? void 0 : data.message) || (response == null ? void 0 : response.message) || "工程师被UFO带走了-_-!";
    common_vendor.index.$u.toast(errorMsg);
    return Promise.reject(response);
  });
};
exports.default = request;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/http/request.js.map
