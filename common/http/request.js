import env from '@/common/config/env.js'
import { scheduleRelogin, isUnauthorizedCode } from '@/common/http/authRedirect.js'

export default (vm) => {
	//初始化请求配置
	uni.$u.http.setConfig((config) => {
		/*config 为默认全局配置*/
		config.baseURL = env.baseUrl;
		config.custom = {
			catch: true, auth: true
		}
		config.header = {
			'Content-Type': 'application/json', // 新文件的默认JSON请求头
			...config.header // 保留原有自定义请求头
		}
		return config
	})
	
	//请求拦截
	uni.$u.http.interceptors.request.use((config) => {
		// 可使用async await 做异步操作
		uni.showLoading({
			title: '加载中'
		});
		// 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
		config.data = config.data || {}
		
		// 确保 header 对象存在
		config.header = config.header || {}
		
		// 根据custom参数中配置的是否需要token，添加对应的请求头
		if(config?.custom?.auth) {
			// 可以在此通过vm引用vuex中的变量，具体值在vm.$store.state中
			//config.header['access-token'] = vm.$store.state.token
			const token = uni.getStorageSync("access-token")
			if (token) {
				// 兼容旧写法 + 文档标准 Bearer Token
				config.header['access-token'] = token
				config.header['Authorization'] = `Bearer ${token}`
			}
		}
		return config
	}, config => {
		return Promise.reject(config)
	})
	
	
	
	//响应拦截
	uni.$u.http.interceptors.response.use((response) => {
		/* 对响应成功做点什么 可使用async await 做异步操作*/
		uni.hideLoading();
		const data = response.data || {}
		const cfg = response.config || {}

		// HTTP 401：常见于 Spring Security / Gateway，不会带 code:200
		if (response.statusCode === 401) {
			scheduleRelogin(cfg, data?.message || data?.error)
			return Promise.reject(response)
		}

		if (response.statusCode !== 200) {
			uni.$u.toast(data?.message || '接口请求失败')
			return Promise.reject(response)
		}

		const custom = cfg.custom || {}

		// 业务状态码 401：文档约定「未认证」
		if (data.code !== undefined && data.code !== 200) {
			if (isUnauthorizedCode(data.code)) {
				scheduleRelogin(cfg, data.message)
				if (custom?.catch) {
					return Promise.reject(data)
				}
				return new Promise(() => {})
			}
			if (custom.toast !== false) {
				uni.$u.toast(data.message || '请求失败')
			}
			if (custom?.catch) {
				return Promise.reject(data)
			}
			return new Promise(() => {})
		}
		return data === undefined ? {} : data
	}, (response) => {
		uni.hideLoading()
		const cfg = response?.config || {}
		const data = response?.data || {}
		const status = response?.statusCode

		if (status === 401) {
			scheduleRelogin(cfg, data?.message || data?.error)
			return Promise.reject(response)
		}

		const errorMsg = data?.message || response?.message || '工程师被UFO带走了-_-!'
		uni.$u.toast(errorMsg)
		return Promise.reject(response)
	})
}