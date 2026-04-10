<template>
  <view class="container">
    <view class="user-card">
      <Avatar :src="userInfo.avatarUrl" size="64" />
      <view class="user-main">
        <text class="user-name">{{ userInfo.name || '用户' }}</text>
        <text class="user-sub">ID: {{ userId || '未知' }}</text>
      </view>
    </view>

    <view class="project-section">
      <view class="section-title">TA 发布的项目</view>
      <Loading show="true" text="加载中..." v-if="loading" />
      <view v-else>
        <view v-if="publishedProjects.length === 0" class="empty-tip">暂无可展示的项目</view>
        <view
          v-for="(item, index) in publishedProjects"
          :key="item.projectId || index"
          class="project-item"
          @tap="goProjectDetail(item)"
        >
          <text class="project-title">{{ item.name }}</text>
          <text class="project-intro">{{ item.projectIntro || `浏览 ${item.viewCount || 0} · 申请 ${item.applyCount || 0}` }}</text>
          <view class="project-meta">
            <text class="meta-chip">{{ item.belongTrack || '未分类' }}</text>
            <text class="meta-status" :class="statusClass(item.status)">{{ statusText(item.status) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import Loading from '@/components/Loading.vue'
import api from '@/common/api/index.js'

export default {
  components: {
    Avatar,
    Loading
  },
  data() {
    return {
      userId: '',
      userInfo: {
        name: '',
        avatarUrl: ''
      },
      loading: false,
      publishedProjects: []
    }
  },
  onLoad(options) {
    this.userId = String(options?.userId || '')
    this.userInfo = {
      name: options?.userName ? decodeURIComponent(options.userName) : '',
      avatarUrl: options?.avatar ? decodeURIComponent(options.avatar) : ''
    }
    this.fetchPublishedProjects()
  },
  methods: {
    statusText(status) {
      const m = { 0: '草拟', 1: '实施中', 2: '招募中', 3: '已完成', 4: '已终止' }
      const n = Number(status)
      return m[n] || '招募中'
    },
    statusClass(status) {
      const n = Number(status)
      if (n === 3 || n === 4) return 'ended'
      if (n === 0) return 'draft'
      return 'recruiting'
    },
    async fetchPublishedProjects() {
      this.loading = true
      try {
        if (!this.userId) {
          this.publishedProjects = []
          return
        }
        const res = await api.getUserPublishedProjects(this.userId, { page: 1, size: 50 })
        const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.list) ? res.data.list : [])
        this.publishedProjects = raw
      } catch (e) {
        console.error('获取用户发布项目失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    goProjectDetail(item) {
      if (!item?.projectId) return
      uni.navigateTo({
        url: `/pages/projectDetail/index?projectId=${item.projectId}`
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 24rpx;
}
.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.user-main {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.user-sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #888;
}
.project-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 18rpx;
}
.empty-tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx 0;
}
.project-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.project-item:last-child {
  border-bottom: none;
}
.project-title {
  display: block;
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}
.project-intro {
  display: block;
  margin-top: 8rpx;
  color: #666;
  font-size: 24rpx;
  line-height: 1.5;
}
.project-meta {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
  align-items: center;
}
.meta-chip {
  font-size: 22rpx;
  color: #1677ff;
  background: #e6f4ff;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
}
.meta-status {
  font-size: 22rpx;
}
.meta-status.recruiting {
  color: #1677ff;
}
.meta-status.ended {
  color: #999;
}
.meta-status.draft {
  color: #d48806;
}
</style>