// common/api/mock.js
const projectMockList = [
  {
    projectId: 1,
    name: "第十届互联网+创新大赛",
    belongTrack: "互联网+",
    projectIntro: "AI图像识别，需要前端开发",
    tags: "前端,Vue,AI",
    publisherInfo: { nickname: "李队长" },
    status: 2,
    deadlineRecruit: "2026-06-01",
    releaseTime: "2026-03-10"
  },
  {
    projectId: 2,
    name: "大创项目-校园二手交易平台",
    belongTrack: "大创",
    projectIntro: "校园小程序，需要全栈开发",
    tags: "uniapp,小程序,全栈",
    publisherInfo: { nickname: "王同学" },
    status: 2,
    deadlineRecruit: "2026-07-15",
    releaseTime: "2026-03-12"
  }
];

function nextProjectId() {
  const maxId = projectMockList.reduce((m, x) => Math.max(m, Number(x.projectId) || 0), 0)
  return maxId + 1
}

// 登录模拟
function login(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "登录成功",
      data: { token: "mock-token-123456" }
    });
  });
}

// 注册模拟
function register(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "注册成功",
      data: { userId: 10001, token: "mock-token-registered", expiresIn: 7200, authStatus: 2 }
    })
  })
}

// 发送验证码模拟
function sendCode(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { message: "验证码发送成功", expireIn: 300 }
    })
  })
}

// 微信一键登录模拟
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
    })
  })
}

// 用户信息模拟
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
    })
  })
}

function verifyByEmail(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { authId: 10001, message: "学生邮箱认证成功", authStatus: 1 }
    })
  })
}

function submitAuth(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { authId: 10001, message: "认证申请提交成功，等待审核", authStatus: 0 }
    })
  })
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
    })
  })
}

function updateUserProfile(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "success",
      data: { message: "更新成功" }
    })
  })
}

// 创建项目模拟
function createProject(params) {
  const now = new Date()
  const iso = now.toISOString().slice(0, 10)
  const item = {
    projectId: nextProjectId(),
    name: params?.name || "未命名项目",
    belongTrack: params?.belongTrack || "其他",
    projectIntro: params?.projectIntro || "",
    tags: params?.tags || "",
    publisherInfo: { nickname: "测试用户" },
    status: typeof params?.status === "number" ? params.status : 0,
    deadlineRecruit: params?.deadlineRecruit || iso,
    releaseTime: iso
  }

  projectMockList.unshift(item)

  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "创建成功",
      data: item
    })
  })
}

// 项目列表模拟
function getProjectList(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: projectMockList
    });
  });
}

// 我发起的项目（简单用现有列表模拟）
function getMyPublishedProjects(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: projectMockList.map(p => ({
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
    })
  })
}

// 我加入的项目（团队接口结构模拟）
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
    })
  })
}

// 项目详情模拟
function getProjectDetail(projectId) {
  let item = projectMockList.find(x => x.projectId == projectId);
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: item || {}
    });
  });
}

export default {
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
  getMyTeams,
  getProjectDetail,
  projectMockList
};