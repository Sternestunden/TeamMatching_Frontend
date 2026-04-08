//此vm参数为页面的实例，可以通过它引用vuex中的变量
import env from '@/common/config/env.js'
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
				config.header['access-token'] = token
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

		if (response.statusCode !== 200) {
			uni.$u.toast('接口请求失败'); // 新文件的提示文案
			return Promise.reject(response);
		}
		//自定义参数
		const custom = response.config?.custom || {}
		
		// 检查业务状态码
		if (data.code !== undefined && data.code !== 200) {
			// 如果没有显式定义custom的toast参数为false的话，默认对报错进行toast弹出提示
			if (custom.toast !== false) {
				uni.$u.toast(data.message || '请求失败')
			}
			if(401 == data.code) {
				uni.removeStorageSync("Access-Token")
				uni.removeStorageSync("userInfo")
				setTimeout(()=>{
					uni.navigateTo({
						url: '/pages/login/index'
					});
				},1000)
			}
			// 如果需要catch返回，则进行reject
			if (custom?.catch) {
				return Promise.reject(data)
			}else{
				// 否则返回一个pending中的promise，请求不会进入catch中
				return new Promise(() => {})
			}
		}
		// 成功返回数据
		return data === undefined ? {} : data
	}, (response) => {
		// 对响应错误做点什么 （statusCode !== 200）
		uni.hideLoading();
		const errorMsg = response?.data?.message || response?.message || "工程师被UFO带走了-_-!";
		uni.$u.toast(errorMsg);
		return Promise.reject(response)
	})
}