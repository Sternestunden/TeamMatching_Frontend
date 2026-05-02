import App from './App'

// ======================== 公共依赖导入（Vue2/Vue3 通用） ========================
import moment from 'moment';
import config from '@/common/config/env.js'
import api from "@/common/api"

// ======================== Vue2 兼容 ========================
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false

// Vue2 版本 uView 导入（保留兼容）
import uView from 'uview-ui'
Vue.use(uView)

// 挂载全局属性
Vue.prototype.$moment = moment;
Vue.prototype.$config = config;
Vue.prototype.$api = api;

App.mpType = 'app'
const app = new Vue({ ...App })
app.$mount()

// 初始化 uView 请求配置
require('@/common/http/request.js')(app)
// #endif

// ======================== Vue3 核心逻辑（重点优化） ========================
// #ifdef VUE3
import { createSSRApp } from 'vue'
// 修复：Vue3 版本 uView 包名是 uview-plus 而非 uview-ui
import uviewPlus from 'uview-plus'

/**
 * 创建 Vue3 应用实例
 * @returns {Object} 包含 app 实例的对象
 */
export function createApp() {
  // 1. 创建 SSR 应用实例
  const app = createSSRApp(App)

  // 2. 注册 uView UI 组件库（Vue3 正确方式）
  app.use(uviewPlus)

  // 3. 挂载全局属性
  app.config.globalProperties.$moment = moment;
  app.config.globalProperties.$config = config;
  app.config.globalProperties.$api = api;


  // 4. 初始化请求配置（异步加载，避免阻塞应用启动）
    import('@/common/http/request.js').then(module => {
        const requestInit = module.default || module
        requestInit(app)
      }).catch(err => {
        console.error('请求配置初始化失败：', err)
      })
	
  return { app }
}
// #endif