import config from '@/common/config/env.js'
import mockApi from './mock.js'

const api = {
  // 登录
  login(params) {
    if (config.useMock) {
      console.log('🔧 Mock登录', params)
      return mockApi.login(params)
    }
    return uni.$u.http.post('/login', params)
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
	
	return uni.$u.http.get('/project/list', {
	      params: params,
	      custom: { auth: true }
	    }).catch(err => {
	      console.log("🔧 拦截到错误，但继续返回:", err);
	      return err; // 把错误对象返回给页面
	    })
	/*	
	//封装库有自动拦截机制
    return uni.$u.http.get(`/project/${projectId}`, {
      custom: { auth: true }
    })*/
  }
}

export default api