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

  // 获取项目详情
  getProjectDetail(projectId) {
    if (config.useMock) {
      return mockApi.getProjectDetail(projectId)
    }
    return uni.$u.http.get(`/project/${projectId}`, {
      custom: { auth: true }
    })
  }
}

export default api