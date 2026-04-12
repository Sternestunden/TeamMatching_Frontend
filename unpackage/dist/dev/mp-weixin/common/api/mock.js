"use strict";
const projectMockList = [
  {
    projectId: 1,
    name: "第十届互联网+创新大赛",
    belongTrack: "互联网+",
    projectIntro: "AI图像识别，需要前端开发",
    projectType: "创新训练",
    level: 1,
    projectFeatures: "",
    tags: "前端,Vue,AI",
    allowCrossMajor: true,
    isAnonymous: false,
    contactInfo: "",
    publisherInfo: { userId: 10001, nickname: "李队长", avatar: "" },
    status: 2,
    deadlineRecruit: "2026-06-01T23:59:00",
    releaseTime: "2026-03-10",
    roleRequirements: [
      {
        requirementId: 301,
        role: "前端开发",
        memberQuota: 2,
        recruitRequirements: "熟悉 Vue",
        currentMembers: 0
      }
    ]
  },
  {
    projectId: 2,
    name: "大创项目-校园二手交易平台",
    belongTrack: "大创",
    projectIntro: "校园小程序，需要全栈开发",
    projectType: "创新训练",
    level: 1,
    projectFeatures: "",
    tags: "uniapp,小程序,全栈",
    allowCrossMajor: false,
    isAnonymous: false,
    contactInfo: "",
    publisherInfo: { userId: 10002, nickname: "王同学", avatar: "" },
    status: 2,
    deadlineRecruit: "2026-07-15T23:59:00",
    releaseTime: "2026-03-12",
    roleRequirements: [
      {
        requirementId: 302,
        role: "全栈",
        memberQuota: 1,
        recruitRequirements: "熟悉 uni-app",
        currentMembers: 0
      }
    ]
  }
];
function nextProjectId() {
  const maxId = projectMockList.reduce((m, x) => Math.max(m, Number(x.projectId) || 0), 0);
  return maxId + 1;
}
function login(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "登录成功",
      data: { token: "mock-token-123456" }
    });
  });
}
function register(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "注册成功",
      data: { userId: 10001, token: "mock-token-registered", expiresIn: 7200, authStatus: 2 }
    });
  });
}
function sendCode(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { message: "验证码发送成功", expireIn: 300 }
    });
  });
}
function wxLogin(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: {
        userId: 10001,
        token: "mock-token-wx",
        expiresIn: 7200,
        isNewUser: false,
        authStatus: 2
      }
    });
  });
}
function getUserProfile() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: {
        userId: 1001,
        nickname: "测试用户",
        avatar: ""
      }
    });
  });
}
function getAuthStatus() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: {
        authStatus: 2,
        auditTime: null,
        remark: ""
      }
    });
  });
}
function verifyByEmail(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { authId: 10001, message: "学生邮箱认证成功", authStatus: 1 }
    });
  });
}
function submitAuth(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { authId: 10001, message: "认证申请提交成功，等待审核", authStatus: 0 }
    });
  });
}
function uploadFile(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: {
        fileId: 10001,
        fileName: "mock_upload.jpg",
        fileUrl: "https://example.com/files/mock_upload.jpg",
        fileSize: 1,
        fileType: "image/jpeg",
        fileExtension: "jpg",
        md5Hash: "d41d8cd98f00b204e9800998ecf8427e"
      }
    });
  });
}
function updateUserProfile(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { message: "更新成功" }
    });
  });
}
function createProject(params) {
  const now = /* @__PURE__ */ new Date();
  const iso = now.toISOString().slice(0, 10);
  const item = {
    projectId: nextProjectId(),
    name: (params == null ? void 0 : params.name) || "未命名项目",
    belongTrack: (params == null ? void 0 : params.belongTrack) || "其他",
    projectIntro: (params == null ? void 0 : params.projectIntro) || "",
    projectType: (params == null ? void 0 : params.projectType) || "创新训练",
    level: (params == null ? void 0 : params.level) ?? 1,
    projectFeatures: (params == null ? void 0 : params.projectFeatures) || "",
    tags: (params == null ? void 0 : params.tags) || "",
    allowCrossMajor: !!(params == null ? void 0 : params.allowCrossMajor),
    isAnonymous: !!(params == null ? void 0 : params.isAnonymous),
    contactInfo: (params == null ? void 0 : params.contactInfo) || "",
    publisherInfo: { userId: 10001, nickname: "测试用户", avatar: "" },
    status: typeof (params == null ? void 0 : params.status) === "number" ? params.status : 0,
    deadlineRecruit: (params == null ? void 0 : params.deadlineRecruit) || iso,
    releaseTime: iso,
    roleRequirements: Array.isArray(params == null ? void 0 : params.roleRequirements) ? params.roleRequirements.map((r, i) => ({
      requirementId: 500 + i,
      role: r.role,
      memberQuota: Number(r.memberQuota) || 0,
      recruitRequirements: r.recruitRequirements || "",
      currentMembers: 0
    })) : []
  };
  projectMockList.unshift(item);
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "创建成功",
      data: item
    });
  });
}
function getProjectList(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: projectMockList
    });
  });
}
function getMyPublishedProjects(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: projectMockList.map((p) => ({
        projectId: p.projectId,
        name: p.name,
        belongTrack: p.belongTrack,
        status: p.status ?? 2,
        auditStatus: 1,
        releaseTime: p.releaseTime,
        viewCount: 0,
        applyCount: 0,
        totalRoles: 0,
        filledRoles: 0
      }))
    });
  });
}
function getUserPublishedProjects(userId, params) {
  const uid = String(userId || "");
  let list = projectMockList.filter((p) => {
    var _a;
    return String(((_a = p == null ? void 0 : p.publisherInfo) == null ? void 0 : _a.userId) || "") === uid;
  });
  if (!uid)
    list = [];
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: list.map((p) => {
        var _a, _b;
        return {
          projectId: p.projectId,
          name: p.name,
          belongTrack: p.belongTrack,
          status: p.status ?? 2,
          auditStatus: 1,
          releaseTime: p.releaseTime,
          viewCount: 0,
          applyCount: 0,
          totalRoles: ((_a = p.roleRequirements) == null ? void 0 : _a.reduce((s, r) => s + (Number(r.memberQuota) || 0), 0)) || 0,
          filledRoles: ((_b = p.roleRequirements) == null ? void 0 : _b.reduce((s, r) => s + (Number(r.currentMembers) || 0), 0)) || 0
        };
      })
    });
  });
}
function getMyTeams() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: {
        joined: [
          {
            projectId: 1,
            name: "第十届互联网+创新大赛",
            belongTrack: "互联网+",
            role: "前端开发",
            status: 2,
            projectLeader: "李队长",
            unreadPost: false
          }
        ],
        applying: [],
        invited: [],
        rejected: []
      }
    });
  });
}
function getProjectDetail(projectId) {
  let item = projectMockList.find((x) => x.projectId == projectId);
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: item ? { ...item } : {}
    });
  });
}
function updateProject(projectId, params) {
  const idx = projectMockList.findIndex((x) => String(x.projectId) === String(projectId));
  return new Promise((resolve, reject) => {
    if (idx < 0) {
      reject({ code: 404, message: "项目不存在" });
      return;
    }
    const prev = projectMockList[idx];
    projectMockList[idx] = {
      ...prev,
      ...params,
      projectId: prev.projectId,
      roleRequirements: Array.isArray(params.roleRequirements) ? params.roleRequirements.map((r, i) => {
        var _a, _b, _c, _d;
        return {
          requirementId: ((_b = (_a = prev.roleRequirements) == null ? void 0 : _a[i]) == null ? void 0 : _b.requirementId) || 400 + i,
          role: r.role,
          memberQuota: r.memberQuota,
          recruitRequirements: r.recruitRequirements || "",
          currentMembers: ((_d = (_c = prev.roleRequirements) == null ? void 0 : _c[i]) == null ? void 0 : _d.currentMembers) ?? 0
        };
      }) : prev.roleRequirements
    };
    resolve({
      code: 200,
      message: "success",
      data: { message: "更新成功" }
    });
  });
}
function applyProject(projectId, params) {
  return new Promise((resolve, reject) => {
    const requirementId = Number(params == null ? void 0 : params.requirementId);
    const applyReason = String((params == null ? void 0 : params.applyReason) || "").trim();
    if (!projectId || !Number.isFinite(requirementId) || !applyReason) {
      reject({ code: 400, message: "参数不完整" });
      return;
    }
    resolve({
      code: 200,
      message: "success",
      data: {
        applicationId: Date.now(),
        message: "投递成功，等待队长回复",
        sessionId: Date.now() + 1
      }
    });
  });
}
function getMyTalentCard() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: {
        cardId: 601,
        resumeFile: {
          fileId: 10003,
          fileName: "我的简历.pdf",
          fileUrl: "https://example.com/resume/10003.pdf"
        }
      }
    });
  });
}
const mockApi = {
  login,
  register,
  sendCode,
  wxLogin,
  getUserProfile,
  getAuthStatus,
  verifyByEmail,
  submitAuth,
  uploadFile,
  updateUserProfile,
  createProject,
  getProjectList,
  getMyPublishedProjects,
  getUserPublishedProjects,
  getMyTeams,
  getProjectDetail,
  updateProject,
  applyProject,
  getMyTalentCard,
  projectMockList
};
exports.mockApi = mockApi;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/mock.js.map
