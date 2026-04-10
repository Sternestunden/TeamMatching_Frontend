<template>
  <view class="page">
    <view class="card">
      <view class="header">
        <view class="avatar">
          <text class="avatar-text">头像</text>
        </view>
        <view class="header-main">
          <text class="nickname">{{ profile.nickname || profile.username || '未命名用户' }}</text>
          <text class="sub">{{ profile.major || '' }} {{ profile.grade || '' }}</text>
        </view>
        <button class="edit-btn" @tap="goEdit">编辑</button>
      </view>

      <view class="row">
        <text class="label">邮箱</text>
        <text class="value">{{ profile.email || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">性别</text>
        <text class="value">{{ genderText }}</text>
      </view>
      <view class="row">
        <text class="label">生日</text>
        <text class="value">{{ profile.birthday || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">技术栈</text>
        <text class="value">{{ profile.techStack || '—' }}</text>
      </view>
      <view class="row column">
        <text class="label">个人简介</text>
        <text class="value block">{{ profile.personalIntro || '—' }}</text>
      </view>
      <view class="row column">
        <text class="label">获奖经历</text>
        <text class="value block">{{ profile.awardExperience || '—' }}</text>
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
      profile: {}
    }
  },
  computed: {
    genderText() {
      const g = this.profile.gender
      if (g === 1) return '男'
      if (g === 2) return '女'
      if (g === 0) return '未知'
      return '—'
    }
  },
  onShow() {
    this.fetchProfile()
  },
  methods: {
    goEdit() {
      uni.navigateTo({ url: '/pages/user/profile' })
    },
    async fetchProfile() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }
      this.loading = true
      try {
        const res = await api.getUserProfile()
        this.profile = res?.data || {}
      } catch (e) {
        console.error('获取个人资料失败：', e)
        uni.showToast({ title: e?.data?.message || e?.message || '获取失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
}
.header {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding-bottom: 18rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 18rpx;
}
.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 4rpx solid #355ac9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-text {
  font-size: 22rpx;
  color: #355ac9;
}
.header-main {
  flex: 1;
}
.nickname {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}
.sub {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #888;
}
.edit-btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 22rpx;
  border-radius: 16rpx;
  background: #355ac9;
  color: #fff;
  font-size: 24rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f3f3f3;
}
.row:last-child {
  border-bottom: none;
}
.row.column {
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}
.label {
  font-size: 24rpx;
  color: #666;
}
.value {
  font-size: 24rpx;
  color: #222;
  max-width: 520rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}
.value.block {
  max-width: 100%;
  white-space: pre-wrap;
  text-align: left;
}
</style>
