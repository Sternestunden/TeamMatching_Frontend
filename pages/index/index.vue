<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
			<u-button type="primary" text="测试" @click='login'></u-button>
		</view>
		
		<h3>{{$moment(new Date()).format('yyyy-MM-DD HH:mm:ss')}}</h3>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			// 页面加载时，可以在控制台测试接口
			console.log('📋 当前环境配置:', this.$config)
			console.log('💡 提示：如果后端未开发，接口地址无效是正常的。当前使用模拟数据模式。')
		},
		methods: {
			async login() {
				console.log('点击登录按钮');
				try {
					// 检查 API 是否可用
					if (!this.$api) {
						uni.showToast({
							title: 'API未初始化',
							icon: 'none'
						});
						return;
					}
					
					// 检查 uni.$u.http 是否可用
					if (!uni.$u || !uni.$u.http) {
						uni.showToast({
							title: 'HTTP未初始化',
							icon: 'none'
						});
						return;
					}
					
				const param = {
					"username": "admin",
					"password": "123456"
				}
				
				console.log('开始请求登录接口，参数:', param);
				console.log('当前环境配置:', this.$config);
				const result = await this.$api.login(param);
				console.log('登录结果:', result);
				
				// 根据返回结果判断
				if (result && result.code === 200) {
					uni.showToast({
						title: result.message || '登录成功',
						icon: 'success'
					});
					// 如果返回了token，可以保存
					if (result.data && result.data.token) {
						uni.setStorageSync('access-token', result.data.token)
						console.log('Token已保存:', result.data.token)
					}
				} else {
					uni.showToast({
						title: result?.message || '登录失败',
						icon: 'none'
					});
				}
				} catch (error) {
					console.error('登录失败:', error);
					uni.showToast({
						title: error.message || '登录失败',
						icon: 'none',
						duration: 2000
					});
				}
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
