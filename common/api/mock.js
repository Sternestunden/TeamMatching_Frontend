// common/api/mock.js
/** 模拟当前用户已收藏的项目 ID（与 toggle 联动） */
const mockFavoriteProjectIds = new Set([1])

/** 模拟用户简历文件列表（targetType=1），与 getMyUploadedFiles / upload 联动 */
let mockResumeNextId = 91001
const mockUserResumeFiles = []

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
  const tt = Number(params?.targetType || 0)
  const path = String(params?.filePath || 'upload.bin')
  const baseName = path.split('/').pop().split('?')[0] || 'upload.bin'
  return new Promise((resolve) => {
    if (tt === 1) {
      const fileId = mockResumeNextId++
      const ext = (baseName.includes('.') ? baseName.split('.').pop() : 'pdf') || 'pdf'
      const row = {
        fileId,
        fileName: baseName,
        fileUrl: `https://example.com/files/resume-${fileId}.${ext}`,
        fileSize: 204800,
        fileType: 'application/pdf',
        fileExtension: String(ext).slice(0, 12),
        md5Hash: 'd41d8cd98f00b204e9800998ecf8427e',
        targetType: 1,
        createdTime: new Date().toISOString()
      }
      mockUserResumeFiles.unshift(row)
      resolve({ code: 200, message: 'success', data: { ...row } })
      return
    }
    resolve({
      code: 200,
      message: 'success',
      data: {
        fileId: 10001,
        fileName: 'mock_upload.jpg',
        fileUrl: 'https://example.com/files/mock_upload.jpg',
        fileSize: 1,
        fileType: 'image/jpeg',
        fileExtension: 'jpg',
        md5Hash: 'd41d8cd98f00b204e9800998ecf8427e'
      }
    })
  })
}

function getMyUploadedFiles(params) {
  const targetType = Number(params?.targetType ?? 1)
  const page = Math.max(1, Number(params?.page) || 1)
  const size = Math.min(50, Math.max(1, Number(params?.size) || 20))
  return new Promise((resolve) => {
    const pool = targetType === 1 ? mockUserResumeFiles : []
    const start = (page - 1) * size
    resolve({
      code: 200,
      message: 'success',
      data: pool.slice(start, start + size)
    })
  })
}

function getFileInfo(fileId) {
  const id = Number(fileId)
  return new Promise((resolve, reject) => {
    const row = mockUserResumeFiles.find((x) => Number(x.fileId) === id)
    if (!row) {
      reject({ code: 404, message: '文件不存在' })
      return
    }
    resolve({ code: 200, message: 'success', data: { ...row } })
  })
}

function deleteFile(fileId) {
  const id = Number(fileId)
  return new Promise((resolve, reject) => {
    const idx = mockUserResumeFiles.findIndex((x) => Number(x.fileId) === id)
    if (idx < 0) {
      reject({ code: 404, message: '文件不存在' })
      return
    }
    mockUserResumeFiles.splice(idx, 1)
    resolve({ code: 200, message: 'success', data: { message: '文件已删除' } })
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
    projectType: params?.projectType || "创新训练",
    level: params?.level ?? 1,
    projectFeatures: params?.projectFeatures || "",
    tags: params?.tags || "",
    allowCrossMajor: !!params?.allowCrossMajor,
    isAnonymous: !!params?.isAnonymous,
    contactInfo: params?.contactInfo || "",
    publisherInfo: { userId: 10001, nickname: "测试用户", avatar: "" },
    status: typeof params?.status === "number" ? params.status : 0,
    deadlineRecruit: params?.deadlineRecruit || iso,
    releaseTime: iso,
    roleRequirements: Array.isArray(params?.roleRequirements)
      ? params.roleRequirements.map((r, i) => ({
          requirementId: 500 + i,
          role: r.role,
          memberQuota: Number(r.memberQuota) || 0,
          recruitRequirements: r.recruitRequirements || "",
          currentMembers: 0
        }))
      : []
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

// 项目列表模拟（支持 page / size 分页，便于联调触底加载）
function getProjectList(params) {
  const page = Math.max(1, Number(params?.page) || 1)
  const size = Math.min(50, Math.max(1, Number(params?.size) || 10))
  const start = (page - 1) * size
  return new Promise((resolve) => {
    const slice = projectMockList.slice(start, start + size)
    resolve({
      code: 200,
      data: slice
    })
  })
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

// 根据用户ID获取其发布项目（模拟）
function getUserPublishedProjects(userId, params) {
  const uid = String(userId || '')
  let list = projectMockList.filter((p) => String(p?.publisherInfo?.userId || '') === uid)
  if (!uid) list = []
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: list.map((p) => ({
        projectId: p.projectId,
        name: p.name,
        belongTrack: p.belongTrack,
        status: p.status ?? 2,
        auditStatus: 1,
        releaseTime: p.releaseTime,
        viewCount: 0,
        applyCount: 0,
        totalRoles: p.roleRequirements?.reduce((s, r) => s + (Number(r.memberQuota) || 0), 0) || 0,
        filledRoles: p.roleRequirements?.reduce((s, r) => s + (Number(r.currentMembers) || 0), 0) || 0
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
        applying: [
          {
            projectId: 2,
            name: "示例：申请中的项目",
            applyTime: new Date().toISOString(),
            status: 1
          }
        ],
        invited: [],
        rejected: []
      }
    })
  })
}

function toProjectListItem(p) {
  if (!p) return null
  return {
    projectId: p.projectId,
    name: p.name,
    belongTrack: p.belongTrack,
    projectIntro: p.projectIntro,
    publisherInfo: p.publisherInfo,
    deadlineRecruit: p.deadlineRecruit,
    status: p.status ?? 2,
    viewCount: p.viewCount ?? 0,
    favoriteCount: p.favoriteCount ?? 0,
    isAnonymous: !!p.isAnonymous,
    roleSummaries: Array.isArray(p.roleRequirements)
      ? p.roleRequirements.map((r) => ({
          role: r.role,
          memberQuota: r.memberQuota,
          currentMembers: r.currentMembers ?? 0
        }))
      : []
  }
}

function toggleFavoriteProject(projectId) {
  const id = Number(projectId)
  return new Promise((resolve, reject) => {
    if (!Number.isFinite(id)) {
      reject({ code: 400, message: '参数错误' })
      return
    }
    if (mockFavoriteProjectIds.has(id)) mockFavoriteProjectIds.delete(id)
    else mockFavoriteProjectIds.add(id)
    resolve({
      code: 200,
      message: 'success',
      data: { isFavored: mockFavoriteProjectIds.has(id) }
    })
  })
}

function getMyFavoriteProjects(params) {
  const page = Math.max(1, Number(params.page) || 1)
  const size = Math.min(50, Math.max(1, Number(params.size) || 20))
  return new Promise((resolve) => {
    const all = projectMockList
      .filter((p) => mockFavoriteProjectIds.has(Number(p.projectId)))
      .map((p) => toProjectListItem(p))
      .filter(Boolean)
    const start = (page - 1) * size
    const slice = all.slice(start, start + size)
    resolve({
      code: 200,
      message: 'success',
      data: slice
    })
  })
}

// 项目详情模拟
function getProjectDetail(projectId) {
  const id = Number(projectId)
  let item = projectMockList.find((x) => x.projectId == projectId)
  return new Promise((resolve) => {
    if (!item) {
      resolve({ code: 200, data: {} })
      return
    }
    resolve({
      code: 200,
      data: {
        ...item,
        isFavored: mockFavoriteProjectIds.has(id)
      }
    })
  })
}

function updateProject(projectId, params) {
  const idx = projectMockList.findIndex(x => String(x.projectId) === String(projectId))
  return new Promise((resolve, reject) => {
    if (idx < 0) {
      reject({ code: 404, message: '项目不存在' })
      return
    }
    const prev = projectMockList[idx]
    projectMockList[idx] = {
      ...prev,
      ...params,
      projectId: prev.projectId,
      roleRequirements: Array.isArray(params.roleRequirements)
        ? params.roleRequirements.map((r, i) => ({
            requirementId: prev.roleRequirements?.[i]?.requirementId || 400 + i,
            role: r.role,
            memberQuota: r.memberQuota,
            recruitRequirements: r.recruitRequirements || '',
            currentMembers: prev.roleRequirements?.[i]?.currentMembers ?? 0
          }))
        : prev.roleRequirements
    }
    resolve({
      code: 200,
      message: 'success',
      data: { message: '更新成功' }
    })
  })
}

function applyProject(projectId, params) {
  return new Promise((resolve, reject) => {
    const requirementId = Number(params?.requirementId)
    const applyReason = String(params?.applyReason || '').trim()
    if (!projectId || !Number.isFinite(requirementId) || !applyReason) {
      reject({ code: 400, message: '参数不完整' })
      return
    }
    resolve({
      code: 200,
      message: 'success',
      data: {
        applicationId: Date.now(),
        message: '投递成功，等待队长回复',
        sessionId: Date.now() + 1
      }
    })
  })
}

function getMyTalentCard() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: 'success',
      data: {
        cardId: 601,
        resumeFile: {
          fileId: 10003,
          fileName: '我的简历.pdf',
          fileUrl: 'https://example.com/resume/10003.pdf'
        }
      }
    })
  })
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
  getMyUploadedFiles,
  getFileInfo,
  deleteFile,
  updateUserProfile,
  createProject,
  getProjectList,
  getMyPublishedProjects,
  getUserPublishedProjects,
  getMyTeams,
  getProjectDetail,
  toggleFavoriteProject,
  getMyFavoriteProjects,
  updateProject,
  applyProject,
  getMyTalentCard,
  projectMockList
};