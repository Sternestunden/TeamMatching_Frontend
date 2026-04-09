<template>
    <view class="user-page">
      <view class="card auth-card">
        <view class="auth-status">
          <text class="auth-status-label">当前认证状态：</text>
          <text class="auth-status-value" :class="`status-${status}`">
            {{ statusText }}
          </text>
        </view>

        <view v-if="statusLoading" class="loading-panel">
          <text class="loading-text">加载认证状态中...</text>
        </view>

        <!-- ✅ 已通过：只展示信息，不再显示提交界面 -->
        <view v-else-if="status === 'passed'" class="passed-panel">
          <view class="passed-title">学生认证信息</view>
          <view class="passed-row">
            <text class="passed-label">学校</text>
            <text class="passed-value">{{ passedInfo.school || '—' }}</text>
          </view>
          <view class="passed-row">
            <text class="passed-label">学号</text>
            <text class="passed-value">{{ passedInfo.studentId || '—' }}</text>
          </view>
          <view class="passed-row" v-if="passedInfo.email">
            <text class="passed-label">邮箱</text>
            <text class="passed-value">{{ passedInfo.email }}</text>
          </view>
          <view class="tip-text">如信息有误，请联系管理员处理。</view>
        </view>

        <view v-else>
        <view class="mode-tabs">
          <text class="mode-tab" :class="{ active: mode === 'email' }" @tap="mode = 'email'">学生邮箱认证</text>
          <text class="mode-tab" :class="{ active: mode === 'material' }" @tap="mode = 'material'">材料上传认证</text>
        </view>

        <!-- 学生邮箱认证 -->
        <view v-if="mode === 'email'">
          <view class="form-item">
            <text class="form-label">学校名称</text>
            <input class="form-input" v-model="emailForm.school" placeholder="例如 华东师范大学" />
          </view>
          <view class="form-item">
            <text class="form-label">学生邮箱</text>
            <input
              class="form-input"
              v-model="emailForm.email"
              placeholder="例如 xxx@stu.ecnu.edu.cn"
            />
          </view>
          <view class="form-item">
            <text class="form-label">验证码</text>
            <view class="code-row">
              <input class="form-input code-input" v-model="emailForm.verifyCode" placeholder="6位验证码" maxlength="6" />
              <button class="code-btn" :disabled="codeSending || countdown > 0" @tap="sendAuthCode">
                {{ countdown > 0 ? `${countdown}s` : (codeSending ? '发送中...' : '发送验证码') }}
              </button>
            </view>
          </view>
          <view class="tip-text">仅支持以 <text class="mono">.edu.cn</text> 结尾的学生邮箱。</view>
          <button class="btn btn-primary" :disabled="submitting" @tap="submitEmailVerify">
            {{ submitting ? '提交中...' : '提交认证' }}
          </button>
        </view>

        <!-- 材料上传认证 -->
        <view v-else>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="materialForm.realName" placeholder="请输入真实姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">学号</text>
          <input class="form-input" v-model="materialForm.studentId" placeholder="请输入学号" />
        </view>
        <view class="form-item">
          <text class="form-label">专业</text>
          <input class="form-input" v-model="materialForm.major" placeholder="例如 计算机科学与技术" />
        </view>
        <view class="form-item">
          <text class="form-label">年级</text>
          <input class="form-input" v-model="materialForm.grade" placeholder="例如 2022级" />
        </view>
        <view class="form-item">
          <text class="form-label">校园邮箱</text>
          <input
            class="form-input"
            v-model="materialForm.email"
            placeholder="例如 xxx@stu.ecnu.cn"
          />
        </view>
        <view class="form-item">
          <text class="form-label">认证材料（可多张）</text>
          <view class="upload-row">
            <button class="upload-btn" :disabled="uploading" @tap="chooseAndUpload">选择并上传</button>
            <text class="upload-tip" v-if="uploading">上传中...</text>
          </view>
          <view class="file-list" v-if="materialFiles.length > 0">
            <view class="file-item" v-for="(f, idx) in materialFiles" :key="f.fileId">
              <text class="file-name">{{ f.fileName }}</text>
              <text class="file-del" @tap="removeFile(idx)">删除</text>
            </view>
          </view>
          <view class="tip-text">材料将上传到后端并用于人工审核。</view>
        </view>
        <view class="tip-text">以上信息仅用于校内身份核验，不会对外展示。</view>
        <button class="btn btn-primary" :disabled="submitting" @tap="submitMaterialVerify">
          {{ submitting ? '提交中...' : '提交认证' }}
        </button>
        </view>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  import api from '@/common/api/index.js'

  export default {
    data() {
      return {
        mode: 'email', // email | material
        status: 'unverified', // unverified / pending / passed / rejected
        statusRaw: null,
        statusLoading: true,
        submitting: false,
        uploading: false,
        codeSending: false,
        countdown: 0,
        timer: null,

        emailForm: {
          school: '华东师范大学',
          email: '',
          verifyCode: ''
        },

        passedInfo: {
          school: '',
          studentId: '',
          email: ''
        },

        materialForm: {
          studentId: '',
          realName: '',
          major: '',
          grade: '',
          email: '',
          materialFileIds: [],
          materialTypes: []
        },
        materialFiles: []
      }
    },
    computed: {
      statusText() {
        if (this.status === 'passed') return '已通过'
        if (this.status === 'pending') return '审核中'
        if (this.status === 'rejected') return '未通过'
        return '待提交'
      }
    },
    onUnload() {
      if (this.timer) clearInterval(this.timer)
    },
    onShow() {
      this.refreshStatus()
      this.hydratePassedInfo()
    },
    methods: {
      mapAuthStatus(authStatus) {
        // /auth/status: 0-待审核 1-已通过 2-已驳回
        if (authStatus === 1) return 'passed'
        if (authStatus === 0) return 'pending'
        if (authStatus === 2) return 'rejected'
        return 'unverified'
      },

      async refreshStatus() {
        const token = uni.getStorageSync('access-token')
        if (!token) {
          this.statusLoading = false
          return
        }
        this.statusLoading = true
        try {
          const res = await api.getAuthStatus()
          const authStatus = res?.data?.authStatus
          const applyTime = res?.data?.applyTime
          const materials = res?.data?.materials
          this.statusRaw = authStatus
          // 没有提交过材料/申请时间，则认为“待提交”（避免新用户一上来显示审核中）
          const hasMaterials = Array.isArray(materials) && materials.length > 0
          if (authStatus === 0 && !applyTime && !hasMaterials) {
            this.status = 'unverified'
          } else {
            this.status = this.mapAuthStatus(authStatus)
          }

          if (this.status === 'passed') {
            this.hydratePassedInfo()
          }
        } catch (e) {
          // 如果状态拉取失败，不要闪回默认状态
          console.error('拉取认证状态失败：', e)
        } finally {
          this.statusLoading = false
        }
      },

      async hydratePassedInfo() {
        const authMeta = uni.getStorageSync('authMeta') || {}
        if (authMeta?.school) this.passedInfo.school = authMeta.school

        const token = uni.getStorageSync('access-token')
        if (!token) return
        try {
          const res = await api.getUserProfile()
          const u = res?.data || {}
          this.passedInfo.studentId = u.studentId || this.passedInfo.studentId
          this.passedInfo.email = u.email || u.campusEmail || this.passedInfo.email
        } catch (e) {}
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

      async sendAuthCode() {
        const target = this.emailForm.email?.trim()
        if (!target) {
          uni.showToast({ title: '请先填写学生邮箱', icon: 'none' })
          return
        }
        this.codeSending = true
        try {
          await api.sendCode({ target, type: 'auth' })
          uni.showToast({ title: '验证码已发送', icon: 'success' })
          this.startCountdown(60)
        } catch (e) {
          console.error('发送验证码失败：', e)
          uni.showToast({ title: e?.message || '发送失败', icon: 'none' })
        } finally {
          this.codeSending = false
        }
      },

      async submitEmailVerify() {
        const email = this.emailForm.email?.trim()
        const verifyCode = this.emailForm.verifyCode?.trim()
        const school = this.emailForm.school?.trim()
        if (!school) return uni.showToast({ title: '请填写学校名称', icon: 'none' })
        if (!email) return uni.showToast({ title: '请填写学生邮箱', icon: 'none' })
        if (!verifyCode || verifyCode.length !== 6) return uni.showToast({ title: '请输入6位验证码', icon: 'none' })

        this.submitting = true
        try {
          const res = await api.verifyByEmail({ email, verifyCode, school })
          this.status = this.mapAuthStatus(res?.data?.authStatus)
          uni.showToast({ title: res?.data?.message || '认证成功', icon: 'success' })

          uni.setStorageSync('authMeta', { ...(uni.getStorageSync('authMeta') || {}), school })
          this.passedInfo.school = school
          this.passedInfo.email = email
        } catch (e) {
          console.error('邮箱认证失败：', e)
          const msg = e?.data?.message || e?.message || '认证失败'
          uni.showToast({ title: msg, icon: 'none' })
        } finally {
          this.submitting = false
        }
      },

      async chooseAndUpload() {
        this.uploading = true
        try {
          const chooseRes = await new Promise((resolve, reject) => {
            uni.chooseImage({
              count: 9,
              sizeType: ['compressed'],
              sourceType: ['album', 'camera'],
              success: resolve,
              fail: reject
            })
          })
          const filePaths = chooseRes?.tempFilePaths || []
          for (const filePath of filePaths) {
            const res = await api.uploadFile({ filePath, targetType: 8, isTemp: true })
            const file = res?.data
            if (file?.fileId) {
              this.materialFiles.push(file)
              this.materialForm.materialFileIds.push(file.fileId)
              // 默认按“学生证”类型
              this.materialForm.materialTypes.push(1)
            }
          }
          uni.showToast({ title: '上传成功', icon: 'success' })
        } catch (e) {
          console.error('上传失败：', e)
          uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
        } finally {
          this.uploading = false
        }
      },

      removeFile(idx) {
        this.materialFiles.splice(idx, 1)
        this.materialForm.materialFileIds.splice(idx, 1)
        this.materialForm.materialTypes.splice(idx, 1)
      },

      async submitMaterialVerify() {
        const p = this.materialForm
        if (!p.realName?.trim()) return uni.showToast({ title: '请填写姓名', icon: 'none' })
        if (!p.studentId?.trim()) return uni.showToast({ title: '请填写学号', icon: 'none' })
        if (!p.major?.trim()) return uni.showToast({ title: '请填写专业', icon: 'none' })
        if (!p.grade?.trim()) return uni.showToast({ title: '请填写年级', icon: 'none' })
        if (!p.email?.trim()) return uni.showToast({ title: '请填写校园邮箱', icon: 'none' })
        if (!Array.isArray(p.materialFileIds) || p.materialFileIds.length === 0) {
          return uni.showToast({ title: '请先上传认证材料', icon: 'none' })
        }

        this.submitting = true
        try {
          const res = await api.submitAuth({
            studentId: p.studentId,
            realName: p.realName,
            major: p.major,
            grade: p.grade,
            email: p.email,
            materialFileIds: p.materialFileIds,
            materialTypes: p.materialTypes
          })
          this.status = this.mapAuthStatus(res?.data?.authStatus)
          uni.showToast({ title: res?.data?.message || '已提交，等待审核', icon: 'success' })
        } catch (e) {
          console.error('提交认证失败：', e)
          uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
        } finally {
          this.submitting = false
        }
      }
    }
  }
  </script>
  
  <style lang="scss">
  .user-page {
    padding: 32rpx;
    background-color: #f5f7fb;
    min-height: 100vh;
    box-sizing: border-box;
  }
  
  .card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 24rpx 28rpx 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  }
  
  .auth-card {
    margin-top: 16rpx;
  }
  
  .auth-status {
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
  }
  
  .auth-status-label {
    font-size: 24rpx;
    color: #555;
  }
  
  .auth-status-value {
    font-size: 24rpx;
    margin-left: 8rpx;
  }
  
  .status-passed {
    color: #3bb95c;
  }
  
  .status-pending {
    color: #f0a930;
  }
  
  .status-rejected {
    color: #e64f4f;
  }

  .status-unverified {
    color: #888;
  }
  
  .form-item {
    margin-top: 16rpx;
  }
  
  .form-label {
    font-size: 24rpx;
    color: #555;
  }
  
  .form-input {
    margin-top: 8rpx;
    padding: 16rpx 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e0e0ea;
    font-size: 24rpx;
  }
  
  .tip-text {
    margin-top: 16rpx;
    font-size: 22rpx;
    color: #888;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .mode-tabs {
    display: flex;
    gap: 16rpx;
    margin: 12rpx 0 4rpx;
  }
  .mode-tab {
    padding: 12rpx 18rpx;
    border-radius: 18rpx;
    background: #f5f7fb;
    color: #355ac9;
    font-size: 24rpx;
  }
  .mode-tab.active {
    background: #355ac9;
    color: #fff;
  }

  .passed-panel {
    margin-top: 8rpx;
    padding: 16rpx 18rpx;
    border-radius: 18rpx;
    background: #f7faf8;
    border: 1rpx solid #e7f3ec;
  }
  .passed-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f7a3a;
    margin-bottom: 8rpx;
  }
  .passed-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 0;
    border-bottom: 1rpx solid #e7f3ec;
  }
  .passed-row:last-child {
    border-bottom: none;
  }
  .passed-label {
    font-size: 24rpx;
    color: #4a5a51;
  }
  .passed-value {
    font-size: 24rpx;
    color: #1f2d26;
    max-width: 520rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  .loading-panel {
    margin-top: 8rpx;
    padding: 18rpx 18rpx;
    border-radius: 18rpx;
    background: #f5f7fb;
    border: 1rpx solid #eef1ff;
  }
  .loading-text {
    font-size: 24rpx;
    color: #666;
  }

  .code-row {
    display: flex;
    gap: 16rpx;
    align-items: center;
    margin-top: 8rpx;
  }
  .code-input {
    flex: 1;
    margin-top: 0;
  }
  .code-btn {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 18rpx;
    border-radius: 16rpx;
    background: #f5f7fb;
    color: #355ac9;
    font-size: 24rpx;
  }

  .upload-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 10rpx;
  }
  .upload-btn {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 18rpx;
    border-radius: 16rpx;
    background: #f5f7fb;
    color: #355ac9;
    font-size: 24rpx;
  }
  .upload-tip {
    font-size: 22rpx;
    color: #888;
  }
  .file-list {
    margin-top: 12rpx;
  }
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 8rpx;
    border-bottom: 1rpx solid #eee;
  }
  .file-name {
    font-size: 24rpx;
    color: #333;
    max-width: 520rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .file-del {
    font-size: 24rpx;
    color: #e64f4f;
  }
  
  .btn {
    margin-top: 32rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    border-radius: 20rpx;
  }
  
  .btn-primary {
    background-color: #355ac9;
    color: #fff;
  }
  </style>
  
  