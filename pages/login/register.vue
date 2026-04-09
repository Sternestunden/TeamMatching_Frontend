<template>
  <view class="page">
    <view class="card">
      <view class="title">注册</view>

      <view class="field">
        <text class="label">账号</text>
        <input class="input" v-model="form.account" placeholder="邮箱/手机号" />
      </view>

      <view class="field">
        <text class="label">昵称（可选）</text>
        <input class="input" v-model="form.nickname" placeholder="请输入昵称" />
      </view>

      <view class="field">
        <text class="label">验证码</text>
        <view class="code-row">
          <input class="input code-input" v-model="form.verifyCode" placeholder="6位验证码" maxlength="6" />
          <button class="btn code-btn" :disabled="codeSending || countdown > 0" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}s` : (codeSending ? '发送中...' : '发送验证码') }}
          </button>
        </view>
      </view>

      <view class="field">
        <text class="label">密码</text>
        <input class="input" v-model="form.password" placeholder="6-20位密码" password />
      </view>

      <button class="btn primary" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册并登录' }}
      </button>

      <view class="row">
        <text class="link" @click="goLogin">已有账号？去登录</text>
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
      codeSending: false,
      countdown: 0,
      timer: null,
      form: {
        account: '',
        password: '',
        nickname: '',
        verifyCode: ''
      }
    }
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async handleSendCode() {
      const target = this.form.account?.trim()
      if (!target) {
        uni.showToast({ title: '请先填写账号', icon: 'none' })
        return
      }
      this.codeSending = true
      try {
        await api.sendCode({ target, type: 'register' })
        uni.showToast({ title: '验证码已发送', icon: 'success' })
        this.startCountdown(60)
      } catch (err) {
        console.error('发送验证码失败：', err)
        uni.showToast({ title: err?.message || '发送失败', icon: 'none' })
      } finally {
        this.codeSending = false
      }
    },
    startCountdown(seconds) {
      this.countdown = seconds
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.countdown -= 1
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
          this.countdown = 0
        }
      }, 1000)
    },
    async handleRegister() {
      const account = this.form.account?.trim()
      const password = this.form.password
      const verifyCode = this.form.verifyCode?.trim()
      const nickname = this.form.nickname?.trim()

      if (!account) {
        uni.showToast({ title: '请输入账号', icon: 'none' })
        return
      }
      if (!verifyCode || verifyCode.length !== 6) {
        uni.showToast({ title: '请输入6位验证码', icon: 'none' })
        return
      }
      if (!password || password.length < 6 || password.length > 20) {
        uni.showToast({ title: '密码需6-20位', icon: 'none' })
        return
      }

      this.loading = true
      try {
        const res = await api.register({ account, password, verifyCode, nickname: nickname || undefined })
        const token = res?.data?.token
        if (token) {
          uni.setStorageSync('access-token', token)
          try {
            const profile = await api.getUserProfile()
            if (profile?.data) uni.setStorageSync('userInfo', profile.data)
          } catch (e) {}
          uni.showToast({ title: '注册成功', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/square/index' })
          }, 400)
        } else {
          uni.showToast({ title: res?.message || '注册成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 600)
        }
      } catch (err) {
        console.error('注册失败：', err)
        uni.showToast({ title: err?.message || '注册失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    goLogin() {
      uni.navigateBack()
    }
  }
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
.code-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.code-input {
  flex: 1;
}
.btn {
  height: 44px;
  border-radius: 10px;
  line-height: 44px;
  font-size: 16px;
}
.code-btn {
  width: 120px;
  font-size: 13px;
  background: #f5f5f5;
  color: #333;
}
.primary {
  background: #1677ff;
  color: #fff;
  margin-top: 6px;
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
