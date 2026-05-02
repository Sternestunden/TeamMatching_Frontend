import config from '@/common/config/env.js'
import mockApi from './mock.js'
import { scheduleRelogin, isUnauthorizedCode } from '@/common/http/authRedirect.js'

function appendLocalExchangeRequest(record) {
  try {
    const key = 'contactExchangeRequestLocalList'
    const list = uni.getStorageSync(key) || []
    const next = Array.isArray(list) ? list.slice() : []
    next.unshift(record)
    uni.setStorageSync(key, next.slice(0, 100))
  } catch (e) {
    console.warn('缓存联系方式交换请求失败', e)
  }
}

const api = {
  // 登录
  login(params) {
    if (config.useMock) {
      console.log('🔧 Mock登录', params)
      return mockApi.login(params)
    }
    return uni.$u.http.post('/auth/login', params, {
      custom: { auth: false, catch: true }
    })
  },

  // 注册
  register(params) {
    if (config.useMock) {
      console.log('🔧 Mock注册', params)
      return mockApi.register(params)
    }
    return uni.$u.http.post('/auth/register', params, {
      custom: { auth: false, catch: true }
    })
  },

  // 发送验证码
  sendCode(params) {
    if (config.useMock) {
      console.log('🔧 Mock发送验证码', params)
      return mockApi.sendCode(params)
    }
    return uni.$u.http.post('/auth/send-code', params, {
      custom: { auth: false, catch: true }
    })
  },

  // 微信一键登录（小程序）
  wxLogin(params) {
    if (config.useMock) {
      console.log('🔧 Mock微信一键登录', params)
      return mockApi.wxLogin(params)
    }
    return uni.$u.http.post('/auth/wx-login', params, {
      custom: { auth: false, catch: true }
    })
  },

  // 获取用户信息
  getUserProfile() {
    if (config.useMock) {
      console.log('🔧 Mock获取用户信息')
      return mockApi.getUserProfile()
    }
    return uni.$u.http.get('/user/profile', {
      custom: { auth: true }
    })
  },

  // 更新用户信息
  updateUserProfile(params) {
    if (config.useMock) {
      console.log('🔧 Mock更新用户信息', params)
      return mockApi.updateUserProfile(params)
    }
    return uni.$u.http.put('/user/profile', params, {
      custom: { auth: true }
    })
  },

  // 查询认证状态
  getAuthStatus() {
    if (config.useMock) {
      console.log('🔧 Mock认证状态')
      return mockApi.getAuthStatus()
    }
    return uni.$u.http.get('/auth/status', {
      custom: { auth: true }
    })
  },

  // 学生邮箱认证（无需上传材料）
  verifyByEmail(params) {
    if (config.useMock) {
      console.log('🔧 Mock学生邮箱认证', params)
      return mockApi.verifyByEmail(params)
    }
    return uni.$u.http.post('/auth/verify-email', params, {
      custom: { auth: true }
    })
  },

  // 提交身份认证（上传材料后）
  submitAuth(params) {
    if (config.useMock) {
      console.log('🔧 Mock提交身份认证', params)
      return mockApi.submitAuth(params)
    }
    return uni.$u.http.post('/auth/verify', params, {
      custom: { auth: true }
    })
  },

  // 通用文件上传（用于认证材料 targetType=8）
  uploadFile({ filePath, targetType, isTemp = true }) {
    if (config.useMock) {
      console.log('🔧 Mock上传文件', { filePath, targetType, isTemp })
      return mockApi.uploadFile({ filePath, targetType, isTemp })
    }
    // 由于是 multipart/form-data，使用 uni.uploadFile 更稳
    const token = uni.getStorageSync('access-token') || ''
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${config.baseUrl}/common/upload/file?targetType=${encodeURIComponent(targetType)}&isTemp=${encodeURIComponent(isTemp)}`,
        filePath,
        name: 'file',
        // 与普通请求保持一致：同时传 access-token + Bearer，避免后端按旧字段校验导致误401
        header: token
          ? {
              'access-token': token,
              Authorization: `Bearer ${token}`
            }
          : {},
        success: (res) => {
          try {
            if (res.statusCode === 401) {
              scheduleRelogin({ url: '/common/upload/file' }, '')
              reject(res)
              return
            }
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
            if (isUnauthorizedCode(data?.code)) {
              scheduleRelogin({ url: '/common/upload/file' }, data?.message)
              reject(data || res)
              return
            }
            if (data?.code === 200) resolve(data)
            else reject(data || res)
          } catch (e) {
            reject(e)
          }
        },
        fail: reject
      })
    })
  },

  // ==================== 项目相关 ====================
  // 创建项目
  createProject(params) {
    if (config.useMock) {
      console.log('🔧 Mock创建项目', params)
      return mockApi.createProject(params)
    }
    return uni.$u.http.post('/project', params, {
      custom: { auth: true }
    })
  },

  // 获取项目列表
  getProjectList(params) {
    if (config.useMock) {
      console.log('🔧 Mock项目列表', params)
      return mockApi.getProjectList(params)
    }
    return uni.$u.http.get('/project/list', {
      params: params,
      custom: { auth: true }
    })
  },

  // 获取我发布的项目列表（我发起的项目）
  getMyPublishedProjects(params) {
    if (config.useMock) {
      console.log('🔧 Mock我发布的项目列表', params)
      return mockApi.getMyPublishedProjects(params)
    }
    return uni.$u.http.get('/project/my-published', {
      params: params,
      custom: { auth: true }
    })
  },

  // 根据用户ID获取其发布的项目列表（公开接口）
  getUserPublishedProjects(userId, params = {}) {
    if (config.useMock) {
      console.log('🔧 Mock按用户获取发布项目', userId, params)
      return mockApi.getUserPublishedProjects(userId, params)
    }
    return uni.$u.http.get(`/project/user/${userId}/published`, {
      params,
      custom: { auth: false }
    })
  },

  // 获取项目详情
  getProjectDetail(projectId) {
    if (config.useMock) {
      return mockApi.getProjectDetail(projectId)
    }
    return uni.$u.http.get(`/project/${projectId}`, {
      custom: { auth: true }
    })
  },

  // 更新项目（我发布的项目编辑）
  updateProject(projectId, params) {
    if (config.useMock) {
      console.log('🔧 Mock更新项目', projectId, params)
      return mockApi.updateProject(projectId, params)
    }
    return uni.$u.http.put(`/project/${projectId}`, params, {
      custom: { auth: true }
    })
  },

  // 立即沟通（投递申请）
  applyProject(projectId, params) {
    if (config.useMock) {
      console.log('🔧 Mock投递项目', projectId, params)
      return mockApi.applyProject(projectId, params)
    }
    return uni.$u.http.post(`/project/${projectId}/apply`, params, {
      custom: { auth: true }
    })
  },
  
  // ==================== 人才相关 ====================

  // 获取我的人才卡片（用于复用个人简历）
  getMyTalentCard() {
    if (config.useMock) {
      return mockApi.getMyTalentCard()
    }
    return uni.$u.http.get('/talent/card/my', {
      custom: { auth: true }
    })
  },


// 获取人才卡片列表
getTalentList(params = { page: 1, size: 10 }) {
  if (config.useMock) {
    console.log('🔧 Mock人才卡片列表', params)
    return mockApi.getTalentList(params)
  }
  return uni.$u.http.get('/talent/list', {
    params,
    custom: { auth: true }
  })
},

// 获取人才卡片详情
getTalentCardDetail(cardId) {
  if (config.useMock) {
    console.log('🔧 Mock人才卡片详情', cardId)
    return mockApi.getTalentCardDetail(cardId)
  }
  return uni.$u.http.get(`/talent/card/${cardId}`, {
    custom: { auth: true }
  })
},

// 创建/更新人才卡片
upsertTalentCard(params) {
  if (config.useMock) {
    console.log('🔧 Mock创建/更新人才卡片', params)
    return mockApi.upsertTalentCard(params)
  }
  return uni.$u.http.post('/talent/card', params, {
    custom: { auth: true }
  })
},

//发送邀请
inviteTalent(params) {
	    if (config.useMock) {
	      console.log('🔧 Mock邀请人才', params)
	      return mockApi.inviteTalent(params)
	    }
	    console.log('🎯 发送邀请请求到端点:', '/talent/invite')
	    console.log('📋 请求参数:', params)
	    return uni.$u.http.post('/talent/invite', params, {
	      custom: { auth: true }
	    })
	  },

  // ==================== 消息相关 ====================
  // 获取我发送的人才邀请
getSentTalentInvitations(params = { page: 1, size: 10 }) {
  if (config.useMock) {
    console.log('🔧 Mock我发送的人才邀请', params)
    return Promise.resolve({ code: 200, data: [] })
  }
  return uni.$u.http.get('/talent/invitation/sent', {
    params,
    custom: { auth: true }
  })
},
  
  // 获取我收到的邀请
  getReceivedTalentInvitations(params = { page: 1, size: 10 }) {
    if (config.useMock) {
      console.log('🔧 Mock我收到的人才邀请', params)
      return Promise.resolve({ code: 200, data: [] })
    }
    return uni.$u.http.get('/talent/invitation/received', {
      params,
      custom: { auth: true }
    })
  },
  
  // 获取【我申请过的项目】列表
  getMyApplications(params = { page: 1, size: 10 }) {
    if (config.useMock) {
      console.log('🔧 Mock我投递过的项目', params)
      return Promise.resolve({ code: 200, data: [] })
    }
    return uni.$u.http.get('/project/my-applications', {
      params,
      custom: { auth: true }
    })
  },
  
  // 获取【我收到的申请】列表（我是项目发布者）
  getMyReceivedApplications(params = { page: 1, size: 10 }) {
    if (config.useMock) {
      console.log('🔧 Mock我收到的项目申请', params)
      return Promise.resolve({ code: 200, data: [] })
    }
    return uni.$u.http.get('/project/my-received-applications', {
      params,
      custom: { auth: true }
    })
  },
  

  // ==================== 团队相关 ====================
  // 获取“我加入的项目”等（UI原型：我加入的项目）
  getMyTeams() {
    if (config.useMock) {
      console.log('🔧 Mock我的团队')
      return mockApi.getMyTeams()
    }
    return uni.$u.http.get('/team/my', {
      custom: { auth: true }
    })
  },
  // 获取消息会话列表（用于邀请/申请流转）
  getChatSessions(params = { page: 1, size: 50 }) {
    if (config.useMock) {
      return mockApi.getChatSessions(params)
    }
    return uni.$u.http.get('/chat/sessions', {
      params,
      custom: { auth: true }
    })
  },
  // 获取我投递过的项目（当前复用 /team/my，取 applying/invited）
  getMyAppliedProjects() {
    if (config.useMock) {
      return mockApi.getMyAppliedProjects()
    }
    return uni.$u.http.get('/team/my', {
      custom: { auth: true }
    })
  },
  // 请求交换联系方式
  async requestContactExchange(params) {
    if (config.useMock) {
      const res = await mockApi.requestContactExchange(params)
      if (res?.code === 200) {
        appendLocalExchangeRequest({
          exchangeId: res?.data?.exchangeId || Date.now(),
          projectId: params?.projectId,
          sessionId: params?.sessionId,
          receiverId: params?.receiverId,
          createdAt: new Date().toISOString(),
          status: 0
        })
      }
      return res
    }
    const res = await uni.$u.http.post('/contact/exchange/request', params, {
      custom: { auth: true }
    })
    appendLocalExchangeRequest({
      exchangeId: res?.data?.exchangeId || Date.now(),
      projectId: params?.projectId,
      sessionId: params?.sessionId,
      receiverId: params?.receiverId,
      createdAt: new Date().toISOString(),
      status: 0
    })
    return res
  },

  // ==================== 全局搜索 ====================
  // 全局搜索（项目、人才、帖子、用户）
  globalSearch(params = {}) {
    if (config.useMock) {
      console.log('🔧 Mock全局搜索', params)
      return mockApi.globalSearch(params)
    }
    return uni.$u.http.get('/search', {
      params: {
        keyword: params.keyword || '',
        type: params.type || '', // project | talent | post | user，空则搜索全部
        sort: params.sort || '',
        page: params.page || 1,
        size: params.size || 10
      },
      custom: { auth: params.type ? true : false }
    })
  },
}

export default api