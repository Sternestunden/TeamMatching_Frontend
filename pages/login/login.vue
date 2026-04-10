<template>
  <view class="page">
    <view class="card">
      <view class="title">登录</view>

      <view class="field">
        <text class="label">账号</text>
        <input class="input" v-model="form.account" placeholder="邮箱/手机号/学号" />
      </view>

      <view class="field">
        <text class="label">密码</text>
        <input class="input" v-model="form.password" placeholder="请输入密码" password />
      </view>

      <button class="btn primary" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="split-line">
        <text class="split-text">或使用快捷登录</text>
      </view>

      <!-- 微信登录区块 -->
      <view class="wx-panel">
        <view class="wx-panel-title">
          <text class="wx-icon">🟢</text>
          <text class="wx-title-text">微信一键登录</text>
        </view>
        <text class="wx-desc">授权后可快速完成登录，首次登录将自动创建账号</text>

        <!-- #ifdef MP-WEIXIN -->
        <button class="btn wx" :disabled="wxLoading" @click="handleWxLogin">
          {{ wxLoading ? '登录中...' : '微信授权并登录' }}
        </button>
        <!-- #endif -->

        <!-- #ifndef MP-WEIXIN -->
        <button class="btn wx disabled" disabled>
          请在微信小程序中使用
        </button>
        <!-- #endif -->
      </view>

      <view class="row">
        <text class="link" @click="goRegister">没有账号？去注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/common/api/index.js'

export default {
  data() {
    return {
      loading: false,
      wxLoading: false,
      form: {
        account: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      const account = this.form.account?.trim()
      const password = this.form.password

      if (!account) {
        uni.showToast({ title: '请输入账号', icon: 'none' })
        return
      }
      if (!password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }

      this.loading = true
      try {
        const res = await api.login({ account, password })
        const token = res?.data?.token
        if (!token) {
          uni.showToast({ title: res?.message || '登录失败', icon: 'none' })
          return
        }
        uni.setStorageSync('access-token', token)

        // 登录后拉一次个人信息，给“个人中心”用
        try {
          const profile = await api.getUserProfile()
          if (profile?.data) uni.setStorageSync('userInfo', profile.data)
        } catch (e) {}

        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/square/index' })
        }, 400)
      } catch (err) {
        console.error('登录失败：', err)
        uni.showToast({ title: err?.message || '登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/login/register' })
    },

    // #ifdef MP-WEIXIN
    async handleWxLogin() {
      this.wxLoading = true
      try {
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })

        const code = loginRes?.code
        if (!code) {
          uni.showToast({ title: '获取微信登录凭证失败', icon: 'none' })
          return
        }

        const res = await api.wxLogin({ code })
        const token = res?.data?.token
        if (!token) {
          uni.showToast({ title: res?.message || '微信登录失败', icon: 'none' })
          return
        }

        uni.setStorageSync('access-token', token)

        try {
          const profile = await api.getUserProfile()
          if (profile?.data) uni.setStorageSync('userInfo', profile.data)
        } catch (e) {}

        if (res?.data?.isNewUser) {
          uni.showToast({ title: '登录成功，请完善资料', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/user/index' })
          }, 400)
          return
        }

        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/square/index' })
        }, 400)
      } catch (err) {
        console.error('微信登录失败：', err)
        uni.showToast({ title: err?.message || '微信登录失败', icon: 'none' })
      } finally {
        this.wxLoading = false
      }
    }
    // #endif
  },
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin-bottom: 14px;
}
.field {
  margin-bottom: 14px;
}
.label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.input {
  height: 44px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 0 12px;
  box-sizing: border-box;
  background: #fff;
}
.btn {
  height: 44px;
  border-radius: 10px;
  line-height: 44px;
  font-size: 16px;
  margin-top: 6px;
}
.primary {
  background: #1677ff;
  color: #fff;
}
.wx {
  background: #07c160;
  color: #fff;
  margin-top: 10px;
}
.split-line {
  position: relative;
  margin: 14px 0 8px;
  text-align: center;
}
.split-line::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 1px solid #eceff5;
}
.split-text {
  position: relative;
  z-index: 1;
  padding: 0 10px;
  background: #fff;
  color: #9aa4b2;
  font-size: 12px;
}
.wx-panel {
  margin-top: 8px;
  border: 1px solid #e8f7ee;
  background: #f8fffb;
  border-radius: 12px;
  padding: 12px;
}
.wx-panel-title {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.wx-icon {
  margin-right: 6px;
}
.wx-title-text {
  font-size: 15px;
  color: #1f7a45;
  font-weight: 600;
}
.wx-desc {
  display: block;
  font-size: 12px;
  color: #6b7280;
}
.wx.disabled {
  background: #c7cdd6;
  color: #fff;
}
.row {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
.link {
  color: #1677ff;
  font-size: 14px;
}
</style>
