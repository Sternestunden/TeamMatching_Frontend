import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  // H5开发服务配置，解决跨域
  server: {
    proxy: {
	  '/api': {
	          target: 'http://8.159.150.156:8080',
	          changeOrigin: true,
	          secure: false,
	          // 关键：把 /api 前缀去掉，转发给后端的是真实接口路径
	          rewrite: (path) => path.replace(/^\/api/, '')
	        }
    }
  },
  // 小程序端调试开启sourcemap
  build: {
    sourcemap: true
  }
})