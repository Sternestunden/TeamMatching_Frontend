// common/api/mock.js
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
        applying: [],
        invited: [],
        rejected: []
      }
    })
  })
}

function getMyAppliedProjects() {
  return getMyTeams()
}

function getChatSessions(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: 'success',
      data: [
        {
          sessionId: 501,
          targetUser: { userId: 10011, nickname: '陈同学', avatar: '' },
          lastMessage: '邀请你加入「第十届互联网+创新大赛」担任前端开发',
          lastMsgTime: '2026-04-13T10:10:00',
          unreadCount: 1,
          projectId: 1,
          projectName: '第十届互联网+创新大赛',
          recruitStatus: 'communicating'
        },
        {
          sessionId: 502,
          targetUser: { userId: 10012, nickname: '赵同学', avatar: '' },
          lastMessage: '希望与您交换联系方式，继续沟通项目细节',
          lastMsgTime: '2026-04-12T16:40:00',
          unreadCount: 0,
          projectId: 1,
          projectName: '第十届互联网+创新大赛',
          recruitStatus: 'communicating'
        },
        {
          sessionId: 503,
          targetUser: { userId: 10013, nickname: '周队长', avatar: '' },
          lastMessage: '已收到你的申请，稍后沟通',
          lastMsgTime: '2026-04-12T09:00:00',
          unreadCount: 0,
          projectId: 2,
          projectName: '大创项目-校园二手交易平台',
          recruitStatus: 'communicating'
        }
      ]
    })
  })
}

function requestContactExchange(params) {
  return new Promise((resolve, reject) => {
    const sessionId = Number(params?.sessionId)
    const receiverId = Number(params?.receiverId)
    if (!Number.isFinite(sessionId) || !Number.isFinite(receiverId)) {
      reject({ code: 400, message: '参数不完整' })
      return
    }
    resolve({
      code: 200,
      message: 'success',
      data: {
        exchangeId: Date.now(),
        message: '请求已发送，等待对方确认'
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
      data: item ? { ...item } : {}
    });
  });
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

function getTalentList(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: 'success',
      data: [
        { cardId: 1, displayName: '李同学', avatar: '', major: '计算机', grade: '大二', skillTags: '前端,Vue', targetDirection: '互联网+', expectedCompetition: '' },
        { cardId: 2, displayName: '张同学', avatar: '', major: '软工', grade: '大三', skillTags: '后端,Java', targetDirection: '大创', expectedCompetition: '' },
        { cardId: 3, displayName: '王同学', avatar: '', major: '数媒', grade: '大四', skillTags: '产品,设计', targetDirection: '', expectedCompetition: '' }
      ]
    })
  })
}

function getTalentCardDetail(cardId) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: 'success',
      data: {
        cardId: Number(cardId),
        userId: 100 + Number(cardId),
        displayName: '用户' + cardId,
        avatar: '',
        major: '计算机科学与技术',
        grade: '大三',
        cardTitle: '寻找志同道合的队友',
        skillTags: '前端,Vue,React',
        targetDirection: '互联网+大赛',
        expectedCompetition: '互联网+',
        lastVisibleTime: new Date().toISOString()
      }
    })
  })
}

function inviteTalent(params) {
  return new Promise((resolve) => {
    resolve({ code: 200, message: 'success', data: { inviteId: Date.now() } })
  })
}

function upsertTalentCard(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: 'success',
      data: {
        cardId: 601,
        message: '保存成功'
      }
    })
  })
}

function globalSearch(params) {
  const keyword = (params?.keyword || '').toLowerCase()
  const type = params?.type || ''

  return new Promise((resolve) => {
    const result = {
      code: 200,
      message: 'success',
      data: {
        projects: [],
        talents: [],
        posts: [],
        users: [],
        total: 0
      }
    }

    // 搜索项目
    if (!type || type === 'project') {
      const matchedProjects = projectMockList.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.projectIntro?.toLowerCase().includes(keyword) ||
        p.tags?.toLowerCase().includes(keyword)
      )
      result.data.projects = matchedProjects.map(p => ({
        projectId: p.projectId,
        name: p.name,
        belongTrack: p.belongTrack,
        projectIntro: p.projectIntro,
        tags: p.tags,
        status: p.status,
        releaseTime: p.releaseTime
      }))
    }

    // 搜索人才
    if (!type || type === 'talent') {
      const talentList = [
        { cardId: 1, displayName: '李同学', major: '计算机', grade: '大二', skillTags: '前端,Vue,React', targetDirection: '互联网+', expectedCompetition: '大创' },
        { cardId: 2, displayName: '张同学', major: '软工', grade: '大三', skillTags: '后端,Java,Spring', targetDirection: '挑战杯', expectedCompetition: '挑战杯' },
        { cardId: 3, displayName: '王同学', major: '数媒', grade: '大四', skillTags: '产品,设计,Figma', targetDirection: '互联网+', expectedCompetition: '互联网+' },
        { cardId: 4, displayName: '赵同学', major: 'AI', grade: '研一', skillTags: 'AI,Python,深度学习', targetDirection: '大创', expectedCompetition: '大创' },
        { cardId: 5, displayName: '陈同学', major: '计科', grade: '大二', skillTags: '前端,微信小程序', targetDirection: '挑战杯', expectedCompetition: '挑战杯' }
      ]
      result.data.talents = talentList.filter(t =>
        t.displayName.toLowerCase().includes(keyword) ||
        t.skillTags?.toLowerCase().includes(keyword) ||
        t.targetDirection?.toLowerCase().includes(keyword) ||
        t.major?.toLowerCase().includes(keyword)
      )
    }

    // 搜索帖子（模拟）
    if (!type || type === 'post') {
      const postList = [
        { postId: 1, title: '寻找大创队友', content: '我是计算机专业大三学生，寻找大创队友', authorName: '李同学', createTime: '2026-04-20' },
        { postId: 2, title: '互联网+组队', content: '有想参加互联网+比赛的吗？', authorName: '张同学', createTime: '2026-04-19' }
      ]
      result.data.posts = postList.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.content?.toLowerCase().includes(keyword)
      )
    }

    // 搜索用户（模拟）
    if (!type || type === 'user') {
      const userList = [
        { userId: 1001, nickname: '李同学', avatar: '', major: '计算机' },
        { userId: 1002, nickname: '张同学', avatar: '', major: '软工' },
        { userId: 1003, nickname: '王同学', avatar: '', major: '数媒' }
      ]
      result.data.users = userList.filter(u =>
        u.nickname.toLowerCase().includes(keyword) ||
        u.major?.toLowerCase().includes(keyword)
      )
    }

    // 计算总数
    result.data.total = result.data.projects.length + result.data.talents.length +
                        result.data.posts.length + result.data.users.length

    resolve(result)
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
  updateUserProfile,
  createProject,
  getProjectList,
  getMyPublishedProjects,
  getUserPublishedProjects,
  getMyTeams,
  getMyAppliedProjects,
  getChatSessions,
  requestContactExchange,
  getProjectDetail,
  updateProject,
  applyProject,
  getMyTalentCard,
  getTalentList,
  getTalentCardDetail,
  inviteTalent,
  upsertTalentCard,
  globalSearch,
  projectMockList
};