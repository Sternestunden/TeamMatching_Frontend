"use strict";
const common_vendor = require("../vendor.js");
const common_config_env = require("../config/env.js");
const common_api_mock = require("./mock.js");
const common_http_authRedirect = require("../http/authRedirect.js");
const api = {
  // 登录
  login(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:9", "🔧 Mock登录", params);
      return common_api_mock.mockApi.login(params);
    }
    return common_vendor.index.$u.http.post("/auth/login", params, {
      custom: { auth: false, catch: true }
    });
  },
  // 注册
  register(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:20", "🔧 Mock注册", params);
      return common_api_mock.mockApi.register(params);
    }
    return common_vendor.index.$u.http.post("/auth/register", params, {
      custom: { auth: false, catch: true }
    });
  },
  // 发送验证码
  sendCode(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:31", "🔧 Mock发送验证码", params);
      return common_api_mock.mockApi.sendCode(params);
    }
    return common_vendor.index.$u.http.post("/auth/send-code", params, {
      custom: { auth: false, catch: true }
    });
  },
  // 微信一键登录（小程序）
  wxLogin(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:42", "🔧 Mock微信一键登录", params);
      return common_api_mock.mockApi.wxLogin(params);
    }
    return common_vendor.index.$u.http.post("/auth/wx-login", params, {
      custom: { auth: false, catch: true }
    });
  },
  // 获取用户信息
  getUserProfile() {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:53", "🔧 Mock获取用户信息");
      return common_api_mock.mockApi.getUserProfile();
    }
    return common_vendor.index.$u.http.get("/user/profile", {
      custom: { auth: true }
    });
  },
  // 更新用户信息
  updateUserProfile(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:64", "🔧 Mock更新用户信息", params);
      return common_api_mock.mockApi.updateUserProfile(params);
    }
    return common_vendor.index.$u.http.put("/user/profile", params, {
      custom: { auth: true }
    });
  },
  // 查询认证状态
  getAuthStatus() {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:75", "🔧 Mock认证状态");
      return common_api_mock.mockApi.getAuthStatus();
    }
    return common_vendor.index.$u.http.get("/auth/status", {
      custom: { auth: true }
    });
  },
  // 学生邮箱认证（无需上传材料）
  verifyByEmail(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:86", "🔧 Mock学生邮箱认证", params);
      return common_api_mock.mockApi.verifyByEmail(params);
    }
    return common_vendor.index.$u.http.post("/auth/verify-email", params, {
      custom: { auth: true }
    });
  },
  // 提交身份认证（上传材料后）
  submitAuth(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:97", "🔧 Mock提交身份认证", params);
      return common_api_mock.mockApi.submitAuth(params);
    }
    return common_vendor.index.$u.http.post("/auth/verify", params, {
      custom: { auth: true }
    });
  },
  // 通用文件上传（用于认证材料 targetType=8）
  uploadFile({ filePath, targetType, isTemp = true }) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:108", "🔧 Mock上传文件", { filePath, targetType, isTemp });
      return common_api_mock.mockApi.uploadFile({ filePath, targetType, isTemp });
    }
    const token = common_vendor.index.getStorageSync("access-token") || "";
    return new Promise((resolve, reject) => {
      common_vendor.index.uploadFile({
        url: `${common_config_env.local.baseUrl}/common/upload/file?targetType=${encodeURIComponent(targetType)}&isTemp=${encodeURIComponent(isTemp)}`,
        filePath,
        name: "file",
        // 与普通请求保持一致：同时传 access-token + Bearer，避免后端按旧字段校验导致误401
        header: token ? {
          "access-token": token,
          Authorization: `Bearer ${token}`
        } : {},
        success: (res) => {
          try {
            if (res.statusCode === 401) {
              common_http_authRedirect.scheduleRelogin({ url: "/common/upload/file" }, "");
              reject(res);
              return;
            }
            const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            if (common_http_authRedirect.isUnauthorizedCode(data == null ? void 0 : data.code)) {
              common_http_authRedirect.scheduleRelogin({ url: "/common/upload/file" }, data == null ? void 0 : data.message);
              reject(data || res);
              return;
            }
            if ((data == null ? void 0 : data.code) === 200)
              resolve(data);
            else
              reject(data || res);
          } catch (e) {
            reject(e);
          }
        },
        fail: reject
      });
    });
  },
  // ==================== 项目相关 ====================
  // 创建项目
  createProject(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:153", "🔧 Mock创建项目", params);
      return common_api_mock.mockApi.createProject(params);
    }
    return common_vendor.index.$u.http.post("/project", params, {
      custom: { auth: true }
    });
  },
  // 获取项目列表
  getProjectList(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:164", "🔧 Mock项目列表", params);
      return common_api_mock.mockApi.getProjectList(params);
    }
    return common_vendor.index.$u.http.get("/project/list", {
      params,
      custom: { auth: true }
    });
  },
  // 获取我发布的项目列表（我发起的项目）
  getMyPublishedProjects(params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:176", "🔧 Mock我发布的项目列表", params);
      return common_api_mock.mockApi.getMyPublishedProjects(params);
    }
    return common_vendor.index.$u.http.get("/project/my-published", {
      params,
      custom: { auth: true }
    });
  },
  // 根据用户ID获取其发布的项目列表（公开接口）
  getUserPublishedProjects(userId, params = {}) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:188", "🔧 Mock按用户获取发布项目", userId, params);
      return common_api_mock.mockApi.getUserPublishedProjects(userId, params);
    }
    return common_vendor.index.$u.http.get(`/project/user/${userId}/published`, {
      params,
      custom: { auth: false }
    });
  },
  // 获取项目详情
  getProjectDetail(projectId) {
    if (common_config_env.local.useMock) {
      return common_api_mock.mockApi.getProjectDetail(projectId);
    }
    return common_vendor.index.$u.http.get(`/project/${projectId}`, {
      custom: { auth: true }
    });
  },
  // 更新项目（我发布的项目编辑）
  updateProject(projectId, params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:210", "🔧 Mock更新项目", projectId, params);
      return common_api_mock.mockApi.updateProject(projectId, params);
    }
    return common_vendor.index.$u.http.put(`/project/${projectId}`, params, {
      custom: { auth: true }
    });
  },
  // 立即沟通（投递申请）
  applyProject(projectId, params) {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:221", "🔧 Mock投递项目", projectId, params);
      return common_api_mock.mockApi.applyProject(projectId, params);
    }
    return common_vendor.index.$u.http.post(`/project/${projectId}/apply`, params, {
      custom: { auth: true }
    });
  },
  // 获取我的人才卡片（用于复用个人简历）
  getMyTalentCard() {
    if (common_config_env.local.useMock) {
      return common_api_mock.mockApi.getMyTalentCard();
    }
    return common_vendor.index.$u.http.get("/talent/card/my", {
      custom: { auth: true }
    });
  },
  // ==================== 团队相关 ====================
  // 获取“我加入的项目”等（UI原型：我加入的项目）
  getMyTeams() {
    if (common_config_env.local.useMock) {
      common_vendor.index.__f__("log", "at common/api/index.js:243", "🔧 Mock我的团队");
      return common_api_mock.mockApi.getMyTeams();
    }
    return common_vendor.index.$u.http.get("/team/my", {
      custom: { auth: true }
    });
  }
};
exports.api = api;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/index.js.map
