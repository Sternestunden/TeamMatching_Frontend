<template>
    <view class="user-page">
      <view class="card profile-card">
        <view class="profile-avatar" @tap="onUploadAvatar">
          <view class="avatar-circle">
            <image
              v-if="avatarUrl"
              class="avatar-img"
              :src="avatarUrl"
              mode="aspectFill"
            />
            <text v-else class="avatar-text">上传头像</text>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
        </view>
        <view class="form-item">
          <text class="form-label">性别</text>
          <picker :range="genderOptions" range-key="label" :value="genderIndex" @change="onGenderChange">
            <view class="picker-value">{{ genderOptions[genderIndex]?.label || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">出生日期</text>
          <picker mode="date" :value="form.birthday" @change="onBirthdayChange">
            <view class="picker-value">{{ form.birthday || '请选择日期' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">年级</text>
          <input class="form-input" v-model="form.grade" placeholder="如 2022级" />
        </view>
        <view class="form-item">
          <text class="form-label">专业</text>
          <input class="form-input" v-model="form.major" placeholder="请输入专业" />
        </view>
        <view class="form-item">
          <text class="form-label">技术栈</text>
          <input class="form-input" v-model="form.techStack" placeholder="逗号分隔，如 Vue,Java" />
        </view>
        <view class="form-item">
          <text class="form-label">个人简介</text>
          <textarea
            class="form-textarea"
            v-model="form.personalIntro"
            placeholder="简单介绍一下自己和擅长方向"
            auto-height
          />
        </view>
        <view class="form-item">
          <text class="form-label">获奖经历</text>
          <textarea
            class="form-textarea"
            v-model="form.awardExperience"
            placeholder="如 2023年挑战杯省赛一等奖"
            auto-height
          />
        </view>
        <button class="btn btn-primary" @tap="onSave">保存修改</button>
      </view>
    </view>
  </template>
  
  <script>
  import api from '@/common/api/index.js'

  export default {
    data() {
      return {
        loading: false,
        avatarUrl: '',
        genderOptions: [
          { label: '未知', value: 0 },
          { label: '男', value: 1 },
          { label: '女', value: 2 }
        ],
        form: {
          nickname: '',
          avatarFileId: null,
          gender: 0,
          birthday: '',
          major: '',
          grade: '',
          techStack: '',
          personalIntro: '',
          awardExperience: ''
        }
      }
    },
    computed: {
      genderIndex() {
        const idx = this.genderOptions.findIndex(x => x.value === this.form.gender)
        return idx > -1 ? idx : 0
      }
    },
    onShow() {
      this.loadProfile()
    },
    methods: {
      onGenderChange(e) {
        const idx = Number(e.detail.value) || 0
        this.form.gender = this.genderOptions[idx]?.value ?? 0
      },
      onBirthdayChange(e) {
        // picker 返回格式为 YYYY-MM-DD
        this.form.birthday = e.detail.value
      },
      onUploadAvatar() {
        const token = uni.getStorageSync('access-token')
        if (!token) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
          return
        }

        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: async (chooseRes) => {
            const filePath = chooseRes?.tempFilePaths?.[0]
            if (!filePath) return
            this.loading = true
            try {
              const uploadRes = await api.uploadFile({ filePath, targetType: 7, isTemp: false })
              const file = uploadRes?.data
              if (!file?.fileId) {
                uni.showToast({ title: '上传失败', icon: 'none' })
                return
              }

              this.form.avatarFileId = file.fileId
              this.avatarUrl = file.fileUrl || this.avatarUrl

              // 上传完立即保存头像ID（避免用户忘记点保存）
              await api.updateUserProfile({ avatarFileId: file.fileId })
              try {
                const res = await api.getUserProfile()
                if (res?.data) uni.setStorageSync('userInfo', res.data)
              } catch (e) {}

              uni.showToast({ title: '头像已更新', icon: 'success' })
            } catch (e) {
              console.error('上传头像失败：', e)
              uni.showToast({ title: e?.data?.message || e?.message || '上传失败', icon: 'none' })
            } finally {
              this.loading = false
            }
          },
          fail: () => {
            // 用户取消不提示
          }
        })
      },
      async loadProfile() {
        const token = uni.getStorageSync('access-token')
        if (!token) return
        this.loading = true
        try {
          const res = await api.getUserProfile()
          const u = res?.data || {}
          this.form.nickname = u.nickname || ''
          this.form.gender = typeof u.gender === 'number' ? u.gender : 0
          this.form.birthday = u.birthday || ''
          this.form.major = u.major || ''
          this.form.grade = u.grade || ''
          this.form.techStack = u.techStack || ''
          this.form.personalIntro = u.personalIntro || ''
          this.form.awardExperience = u.awardExperience || ''
          this.form.avatarFileId = u.avatarFile?.fileId ?? null
          this.avatarUrl = u.avatarFile?.fileUrl || ''
        } catch (e) {
          console.error('加载个人资料失败：', e)
          uni.showToast({ title: e?.data?.message || e?.message || '加载失败', icon: 'none' })
        } finally {
          this.loading = false
        }
      },
      async onSave() {
        const token = uni.getStorageSync('access-token')
        if (!token) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
          return
        }

        this.loading = true
        try {
          await api.updateUserProfile({
            nickname: this.form.nickname?.trim() || undefined,
            avatarFileId: this.form.avatarFileId || undefined,
            gender: this.form.gender,
            birthday: this.form.birthday ? String(this.form.birthday).slice(0, 10) : undefined,
            major: this.form.major?.trim() || undefined,
            grade: this.form.grade?.trim() || undefined,
            techStack: this.form.techStack?.trim() || undefined,
            personalIntro: this.form.personalIntro?.trim() || undefined,
            awardExperience: this.form.awardExperience?.trim() || undefined
          })

          // 保存成功后刷新缓存，返回时展示最新数据
          try {
            const res = await api.getUserProfile()
            if (res?.data) uni.setStorageSync('userInfo', res.data)
          } catch (e) {}

          uni.showToast({ title: '已保存', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 400)
        } catch (e) {
          console.error('保存失败：', e)
          uni.showToast({ title: e?.data?.message || e?.message || '保存失败', icon: 'none' })
        } finally {
          this.loading = false
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
  
  .profile-card {
    margin-top: 16rpx;
  }
  
  .profile-avatar {
    display: flex;
    justify-content: center;
    margin-bottom: 24rpx;
  }
  
  .avatar-circle {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 4rpx solid #355ac9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .avatar-text {
    font-size: 24rpx;
    color: #355ac9;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
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

  .picker-value {
    margin-top: 8rpx;
    padding: 16rpx 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e0e0ea;
    font-size: 24rpx;
    color: #333;
    background: #fff;
  }
  
  .form-textarea {
    margin-top: 8rpx;
    padding: 16rpx 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e0e0ea;
    font-size: 24rpx;
    min-height: 160rpx;
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
  
  