import config from '@/common/config/env.js'
import mockApi from './mock.js'

const api = {
  // 登录
  login(params) {
    if (config.useMock) {
      console.log('🔧 Mock登录', params)
      return mockApi.login(params)
    }
    return uni.$u.http.post('/auth/login', params)
  },

  // 注册
  register(params) {
    if (config.useMock) {
      console.log('🔧 Mock注册', params)
      return mockApi.register(params)
    }
    return uni.$u.http.post('/auth/register', params)
  },

  // 发送验证码
  sendCode(params) {
    if (config.useMock) {
      console.log('🔧 Mock发送验证码', params)
      return mockApi.sendCode(params)
    }
    return uni.$u.http.post('/auth/send-code', params)
  },

  // 微信一键登录（小程序）
  wxLogin(params) {
    if (config.useMock) {
      console.log('🔧 Mock微信一键登录', params)
      return mockApi.wxLogin(params)
    }
    return uni.$u.http.post('/auth/wx-login', params)
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
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success: (res) => {
          try {
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
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

  // 获取项目详情
  getProjectDetail(projectId) {
    if (config.useMock) {
      return mockApi.getProjectDetail(projectId)
    }
    return uni.$u.http.get(`/project/${projectId}`, {
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
}

export default api