<template>
  <view class="profile-page">
    <!-- 头图全宽，与下方白卡分离，避免负 margin 叠在头像/标签上 -->
    <view class="hero">
      <view class="hero-bg" />
      <view class="hero-inner">
        <view class="hero-avatar-ring">
          <Avatar :src="userInfo.avatarUrl" :size="88" />
        </view>
        <text class="hero-name">{{ displayName }}</text>
        <view class="hero-badges">
          <text class="hero-badge">项目发起人</text>
          <text v-if="profileStats.recruiting > 0" class="hero-badge hero-badge--live">有项目招募中</text>
        </view>
      </view>
    </view>

    <view class="page-inner">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ profileStats.total }}</text>
          <text class="stat-label">发布项目</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ profileStats.recruiting }}</text>
          <text class="stat-label">招募中</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ profileStats.views }}</text>
          <text class="stat-label">累计浏览</text>
        </view>
      </view>

      <view class="list-section">
        <view class="list-head">
          <view class="list-head-left">
            <view class="list-accent" />
            <view class="list-titles">
              <text class="list-title">公开项目</text>
              <text class="list-sub">点击查看详情</text>
            </view>
          </view>
          <text v-if="!loading" class="list-count">{{ publishedProjects.length }} 个</text>
        </view>

        <view v-if="loading" class="list-loading">
          <Loading show="true" text="加载项目…" />
        </view>
        <view v-else-if="publishedProjects.length === 0" class="list-empty">
          <text class="empty-title">暂无公开项目</text>
          <text class="empty-desc">该用户尚未发布项目，或项目未通过审核展示</text>
        </view>
        <view v-else class="proj-list">
          <view
            v-for="(item, index) in publishedProjects"
            :key="item.projectId || index"
            class="proj-card"
            @tap="goProjectDetail(item)"
          >
            <view class="proj-card-top">
              <text class="proj-name">{{ item.name }}</text>
              <text class="proj-arrow">›</text>
            </view>
            <view class="proj-chips">
              <text class="chip chip-track">{{ item.belongTrack || '未分类' }}</text>
              <text class="chip" :class="'chip-' + statusTone(item.status)">{{ statusText(item.status) }}</text>
            </view>
            <view class="proj-metrics">
              <text class="metric">浏览 {{ item.viewCount ?? 0 }}</text>
              <text class="metric">申请 {{ item.applyCount ?? 0 }}</text>
              <text
                v-if="item.totalRoles != null && Number(item.totalRoles) > 0"
                class="metric"
              >成员 {{ item.filledRoles ?? 0 }}/{{ item.totalRoles }}</text>
            </view>
            <text v-if="formatRelease(item.releaseTime)" class="proj-time">发布于 {{ formatRelease(item.releaseTime) }}</text>
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
  computed: {
    displayName() {
      const n = (this.userInfo.name || '').trim()
      return n || '用户'
    },
    profileStats() {
      const list = this.publishedProjects
      let recruiting = 0
      let views = 0
      for (let i = 0; i < list.length; i++) {
        const p = list[i] || {}
        if (Number(p.status) === 2) recruiting += 1
        views += Number(p.viewCount) || 0
      }
      return {
        total: list.length,
        recruiting,
        views
      }
    }
  },
  onLoad(options) {
    this.userId = String(options?.userId || '')
    const rawName = options?.userName ? decodeURIComponent(options.userName) : ''
    const rawAvatar = options?.avatar ? decodeURIComponent(options.avatar) : ''
    this.userInfo = {
      name: rawName,
      avatarUrl: rawAvatar
    }
    const title = rawName.trim() ? `${rawName.trim()}的主页` : '用户主页'
    uni.setNavigationBarTitle({ title })
    this.fetchPublishedProjects()
  },
  methods: {
    statusText(status) {
      const m = { 0: '草拟', 1: '实施中', 2: '招募中', 3: '已完成', 4: '已终止' }
      const n = Number(status)
      return m[n] || '招募中'
    },
    statusTone(status) {
      const n = Number(status)
      if (n === 3 || n === 4) return 'muted'
      if (n === 0) return 'draft'
      if (n === 2) return 'hot'
      return 'blue'
    },
    formatRelease(iso) {
      if (iso == null || iso === '') return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) {
        const s = String(iso)
        return s.length >= 10 ? s.slice(0, 10) : s
      }
      const y = d.getFullYear()
      const m = `${d.getMonth() + 1}`.padStart(2, '0')
      const day = `${d.getDate()}`.padStart(2, '0')
      return `${y}-${m}-${day}`
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
.profile-page {
  min-height: 100vh;
  background: #e8edf3;
  padding-bottom: 48rpx;
}

.hero {
  position: relative;
  margin: 0;
  padding: 40rpx 40rpx 72rpx;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(155deg, #355ac9 0%, #4a6fd8 42%, #7c9ef0 100%);
  border-radius: 0 0 36rpx 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(53, 90, 201, 0.22);
}
.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-avatar-ring {
  padding: 6rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.5) 100%);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}
.hero-name {
  margin-top: 28rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}
.hero-badges {
  margin-top: 16rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12rpx;
}
.hero-badge {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.95);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
}
.hero-badge--live {
  background: rgba(16, 185, 129, 0.35);
  border-color: rgba(167, 243, 208, 0.6);
}

.page-inner {
  padding: 0 24rpx;
  margin-top: 0;
}

.stats-card {
  margin-top: 20rpx;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.1;
}
.stat-label {
  font-size: 22rpx;
  color: #64748b;
}
.stat-divider {
  width: 1rpx;
  align-self: stretch;
  margin: 8rpx 0;
  background: #e2e8f0;
}

.list-section {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 24rpx 24rpx;
  border: 1rpx solid #e8edf5;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.05);
}
.list-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 4rpx;
}
.list-head-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}
.list-accent {
  width: 6rpx;
  height: 48rpx;
  border-radius: 6rpx;
  background: linear-gradient(180deg, #355ac9 0%, #5b7ee8 100%);
}
.list-titles {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.list-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}
.list-sub {
  font-size: 22rpx;
  color: #94a3b8;
}
.list-count {
  font-size: 24rpx;
  font-weight: 600;
  color: #355ac9;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #eef2ff;
}

.list-loading {
  padding: 48rpx 0 64rpx;
}
.list-empty {
  padding: 56rpx 24rpx 64rpx;
  text-align: center;
}
.empty-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #64748b;
}
.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.5;
}

.proj-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.proj-card {
  padding: 24rpx 22rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 1rpx solid #e8edf5;
}
.proj-card:active {
  opacity: 0.92;
}
.proj-card-top {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12rpx;
  min-width: 0;
}
.proj-name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
}
.proj-arrow {
  font-size: 36rpx;
  font-weight: 300;
  color: #94a3b8;
  line-height: 1;
  margin-top: -4rpx;
}
.proj-chips {
  margin-top: 16rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}
.chip {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-weight: 500;
}
.chip-track {
  background: #eef2ff;
  color: #355ac9;
  border: 1rpx solid #d8def8;
}
.chip-blue {
  background: #e0f2fe;
  color: #0369a1;
}
.chip-hot {
  background: #ecfdf5;
  color: #047857;
}
.chip-draft {
  background: #fffbeb;
  color: #b45309;
}
.chip-muted {
  background: #f1f5f9;
  color: #64748b;
}
.proj-metrics {
  margin-top: 16rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx 24rpx;
}
.metric {
  font-size: 22rpx;
  color: #64748b;
}
.proj-time {
  display: block;
  margin-top: 14rpx;
  font-size: 22rpx;
  color: #94a3b8;
}
</style>
