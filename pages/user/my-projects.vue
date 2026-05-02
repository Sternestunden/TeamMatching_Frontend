<template>
  <view class="user-page">
    <view v-if="type === 'launched'" class="launched-wrapper">
      <view v-if="launchedList.length === 0 && !loading" class="empty-container">
        <text class="empty-text">暂无已发布的项目</text>
        <text class="empty-hint">在「新建项目」中发布后即可在此查看与管理</text>
      </view>
      <view
        v-for="(item, index) in launchedList"
        :key="item.projectId || index"
        class="project-card launched-card"
      >
        <view class="launched-head" @tap="onViewLaunched(item)">
          <text class="project-title">{{ item.title }}</text>
          <text class="status-pill" :class="'audit-' + (item.auditStatus ?? 0)">{{ item.auditLabel }}</text>
        </view>
        <text class="meta-line" @tap="onViewLaunched(item)">{{ item.statusLabel }} · {{ item.metaLine }}</text>
        <view class="launched-actions">
          <button class="launched-btn outline" @tap.stop="onViewLaunched(item)">查看</button>
          <button class="launched-btn primary" @tap.stop="onEditLaunched(item)">编辑</button>
        </view>
      </view>
      <button class="btn btn-primary create-btn" @tap="onCreateProject">创建新项目</button>
    </view>

    <view v-else-if="type === 'joined'" class="joined-wrapper">
      <view v-if="loading" class="empty-container joined-loading">
        <text class="empty-text">加载中…</text>
      </view>

      <view v-if="!loading" class="joined-intro-card">
        <text class="joined-intro-title">申请与团队</text>
        <text class="joined-intro-body">点击项目卡片可进入项目详情，查看完整信息与进度。</text>
      </view>

      <view v-if="!loading" class="team-section">
        <text class="team-section-title">沟通与申请</text>
        <view v-if="teamCommEmpty" class="empty-container section-empty">
          <text class="empty-text">暂无沟通或申请记录</text>
        </view>
        <view
          v-for="(item, index) in teamCommunicating"
          :key="'c-' + (item.projectId || index)"
          class="project-card joined-card"
          :class="'status-' + item.statusClass"
          @tap="onViewJoined(item)"
        >
          <view class="joined-main">
            <text class="project-title">{{ item.title }}</text>
            <text class="status-text">{{ item.statusText }}</text>
          </view>
          <text v-if="item.subLine" class="joined-sub">{{ item.subLine }}</text>
          <text class="joined-tip">点击查看项目详情</text>
        </view>
      </view>

      <view v-if="!loading" class="team-section">
        <text class="team-section-title">已通过（在队）</text>
        <view v-if="teamJoinedEmpty" class="empty-container section-empty">
          <text class="empty-text">暂无在队项目</text>
        </view>
        <view
          v-for="(item, index) in teamJoined"
          :key="'j-' + (item.projectId || index)"
          class="project-card joined-card status-passed"
          @tap="onViewJoined(item)"
        >
          <view class="joined-main">
            <text class="project-title">{{ item.title }}</text>
            <text class="status-text">{{ item.statusText }}</text>
          </view>
          <text v-if="item.subLine" class="joined-sub">{{ item.subLine }}</text>
          <text class="joined-tip">点击查看项目详情</text>
        </view>
      </view>
    </view>

    <!-- ✅ 草稿箱（带删除按钮） -->
    <view v-else class="launched-wrapper">
      <view v-if="draftedList.length === 0" class="empty-container">
        <text class="empty-text">草稿箱暂无内容</text>
      </view>

      <view v-else>
        <view v-for="(item, index) in draftedList" :key="item.id || index" class="project-card drafted-card">
          <text class="project-title">{{ item.title }}</text>
          
          <!-- 按钮组：删除 + 继续编辑 -->
          
            <!-- 靠右一行两个按钮 -->
            <view class="draft-btns">
              <button class="draft-btn del" @tap="onDeleteDraft(item)">删除</button>
              <button class="draft-btn edit" @tap="onGoOnEdit(item)">继续编辑</button>
            </view>
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
      type: 'launched',
      loading: false,
      launchedList: [],
      teamCommunicating: [],
      teamJoined: [],
      draftedList: [],
      isNavigating: false
    }
  },

  computed: {
    teamCommEmpty() {
      return !this.teamCommunicating.length
    },
    teamJoinedEmpty() {
      return !this.teamJoined.length
    }
  },

  onLoad(options) {
    if (options && options.type) {
      this.type = options.type
    }
    this.updateTitle()
    this.loadDraftList()
    this.fetchByType()
  },

  onShow() {
    // 从其他页面返回时（例如发布项目后），刷新当前列表
    this.fetchByType()
  },

  methods: {
    updateTitle() {
      let title = '我的项目'
      if (this.type === 'launched') title = '我发起的项目'
      else if (this.type === 'joined') title = '申请与团队'
      else if (this.type === 'draft') title = '草稿箱'
      uni.setNavigationBarTitle({ title })
    },

    async fetchByType() {
      if (this.type === 'draft') {
        this.loadDraftList()
        return
      }

      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }

      if (this.type === 'launched') return this.fetchLaunched()
      if (this.type === 'joined') return this.fetchJoined()
    },

    async fetchLaunched() {
      this.loading = true
      try {
        const res = await api.getMyPublishedProjects({ page: 1, size: 20 })
        const list = Array.isArray(res?.data) ? res.data : []
        this.launchedList = list.map(item => ({
          projectId: item.projectId,
          title: item.name,
          status: item.status,
          auditStatus: item.auditStatus,
          releaseTime: item.releaseTime,
          viewCount: item.viewCount,
          applyCount: item.applyCount,
          totalRoles: item.totalRoles,
          filledRoles: item.filledRoles,
          statusLabel: this.projectStatusLabel(item.status),
          auditLabel: this.auditStatusLabel(item.auditStatus),
          metaLine: this.buildMetaLine(item)
        }))
      } catch (err) {
        console.error('获取我发起的项目失败：', err)
        uni.showToast({ title: '获取失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async fetchJoined() {
      this.teamCommunicating = []
      this.teamJoined = []
      this.loading = true
      try {
        const res = await api.getMyAppliedProjects()
        const data = res?.data || {}

        this.teamJoined = Array.isArray(data.joined)
          ? data.joined.map((x) => ({
              projectId: x.projectId,
              title: x.name,
              statusClass: 'passed',
              statusText: '在队',
              subLine: this.buildJoinedSubLine(x)
            }))
          : []

        const applying = Array.isArray(data.applying)
          ? data.applying.map((x) => ({
              projectId: x.projectId,
              title: x.name,
              statusClass: 'pending',
              statusText: this.applyStatusText(x.status),
              subLine: x.applyTime ? `申请时间 ${this.formatTeamTime(x.applyTime)}` : ''
            }))
          : []

        const invited = Array.isArray(data.invited)
          ? data.invited.map((x) => ({
              projectId: x.projectId,
              title: x.name,
              statusClass: 'pending',
              statusText: '待确认邀请',
              subLine: [x.inviter && `来自 ${x.inviter}`, x.invitationTime && this.formatTeamTime(x.invitationTime)]
                .filter(Boolean)
                .join(' · ')
            }))
          : []

        this.teamCommunicating = [...applying, ...invited]
      } catch (err) {
        console.error('获取我加入的项目失败：', err)
        uni.showToast({ title: '获取失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    buildJoinedSubLine(x) {
      const parts = []
      if (x.belongTrack) parts.push(x.belongTrack)
      if (x.role) parts.push(`角色：${x.role}`)
      if (x.projectLeader) parts.push(`队长 ${x.projectLeader}`)
      return parts.join(' · ')
    },

    formatTeamTime(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return String(iso)
      const y = d.getFullYear()
      const m = `${d.getMonth() + 1}`.padStart(2, '0')
      const day = `${d.getDate()}`.padStart(2, '0')
      const hh = `${d.getHours()}`.padStart(2, '0')
      const mm = `${d.getMinutes()}`.padStart(2, '0')
      return `${y}-${m}-${day} ${hh}:${mm}`
    },

    /** 申请状态：与后端约定常见值，未知则显示「沟通中」 */
    applyStatusText(status) {
      const m = {
        0: '待审核',
        1: '沟通中',
        2: '已通过',
        3: '已拒绝'
      }
      if (m[status] != null) return m[status]
      return '沟通中'
    },

    loadDraftList() {
      this.draftedList = uni.getStorageSync('projectDrafts') || []
    },

    projectStatusLabel(status) {
      const m = { 0: '草拟', 1: '实施', 2: '招募中', 3: '完成', 4: '终止' }
      return m[status] != null ? m[status] : '未知状态'
    },
    auditStatusLabel(auditStatus) {
      const m = { 0: '待审核', 1: '已通过', 2: '未通过' }
      return m[auditStatus] != null ? m[auditStatus] : '审核中'
    },
    buildMetaLine(item) {
      const parts = []
      if (item.viewCount != null) parts.push(`浏览 ${item.viewCount}`)
      if (item.applyCount != null) parts.push(`申请 ${item.applyCount}`)
      if (item.totalRoles != null) {
        const filled = item.filledRoles != null ? item.filledRoles : 0
        parts.push(`招募 ${filled}/${item.totalRoles}`)
      }
      return parts.length ? parts.join(' · ') : '点击查看详情'
    },
    onViewLaunched(item) {
      if (!item.projectId) return
      uni.navigateTo({
        url: `/pages/projectDetail/index?projectId=${item.projectId}&hideCommunicate=1`
      })
    },
    onEditLaunched(item) {
      if (!item.projectId) return
      if (this.isNavigating) return
      this.isNavigating = true
      uni.switchTab({
        url: '/pages/create/index',
        success: () => {
          setTimeout(() => {
            uni.$emit('editProject', { projectId: item.projectId })
            this.isNavigating = false
          }, 320)
        },
        fail: () => {
          this.isNavigating = false
        }
      })
    },
    onViewJoined(item) {
      if (!item.projectId) return
      uni.navigateTo({
        url: `/pages/projectDetail/index?projectId=${item.projectId}`
      })
    },
    onCreateProject() {
      if (this.isNavigating) return
      this.isNavigating = true
      uni.switchTab({
        url: '/pages/create/index',
        complete: () => {
          setTimeout(() => {
            uni.$emit('clearProjectEdit')
            this.isNavigating = false
          }, 350)
        }
      })
    },

    onGoOnEdit(draft) {
      uni.switchTab({
        url: '/pages/create/index',
        success: () => setTimeout(() => uni.$emit('loadDraft', draft), 300)
      })
    },

    // ======================
    // ✅ 删除草稿（弹窗确认）
    // ======================
    onDeleteDraft(draft) {
      uni.showModal({
        title: '删除草稿',
        content: '确定要删除该草稿吗？',
        success: (res) => {
          if (res.confirm) {
            let drafts = uni.getStorageSync('projectDrafts') || []
            drafts = drafts.filter(d => d.id !== draft.id)
            uni.setStorageSync('projectDrafts', drafts)
            this.loadDraftList()
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
        }
      })
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
  
  .project-card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 28rpx 32rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
    margin-bottom: 24rpx;
  }
  
  .project-title {
    font-size: 30rpx;
    color: #333;
  }
  
  .create-btn {
    margin-top: 8rpx;
  }
  
  .btn {
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    border-radius: 20rpx;
  }
  
  .btn-primary {
    background-color: #355ac9;
    color: #fff;
  }
  
  /* 按钮容器：靠右、一行排列 */
  .draft-btns {
    display: flex;
    justify-content: flex-end;  /* 整体靠右 */
    gap: 20rpx;                 /* 按钮间距 */
    margin-top: 20rpx;
  }
  
  /* 按钮基础样式 */
  .draft-btn {
    width: 160rpx;      /* 固定宽度更整齐 */
    height: 70rpx;      /* 固定高度 */
    font-size: 26rpx;
    border-radius: 10rpx;
    display: flex;
    align-items: center;    /* 垂直居中 */
    justify-content: center;/* 水平居中 */
    box-sizing: border-box;
  }
  
  /* 删除按钮 */
  .draft-btn.del {
    background: transparent;
    color: #ff4d4f;
    border: 2rpx solid #ff4d4f;
  }
  
  /* 编辑按钮 */
  .draft-btn.edit {
    background: #003399;
    color: #fff;
    border: none;
  }
  
  /* 去掉按钮默认样式 */
  button::after { border: none; }
  
  .joined-wrapper {
    padding-bottom: 24rpx;
  }

  .joined-loading {
    padding-top: 80rpx;
  }

  .joined-intro-card {
    background: linear-gradient(135deg, #eef3ff 0%, #f7f9ff 100%);
    border-radius: 20rpx;
    padding: 24rpx 28rpx;
    margin-bottom: 28rpx;
    border: 1rpx solid rgba(53, 90, 201, 0.12);
  }

  .joined-intro-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #355ac9;
    margin-bottom: 10rpx;
  }

  .joined-intro-body {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 1.55;
  }

  .team-section {
    margin-bottom: 40rpx;
  }

  .team-section-muted .team-section-title {
    color: #999;
  }

  .team-section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }

  .team-section-desc {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
    line-height: 1.5;
  }

  .joined-card {
    padding: 24rpx 28rpx;
  }

  .joined-sub {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #888;
    line-height: 1.4;
  }

  .joined-tip {
    display: block;
    margin-top: 10rpx;
    font-size: 22rpx;
    color: #6a86d8;
  }
  
  .joined-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .status-text {
    font-size: 24rpx;
  }
  
  .status-pending {
    background-image: linear-gradient(90deg, #ffeaa7, #ffe9d2);
  }
  
  .status-pending .status-text {
    color: #f0a930;
  }
  
  .status-passed {
    background-image: linear-gradient(90deg, #e1f7e9, #f2fff6);
  }
  
  .status-passed .status-text {
    color: #3bb95c;
  }
  
  .status-rejected {
    background-image: linear-gradient(90deg, #ffe3e3, #fff2f2);
  }
  
  .status-rejected .status-text {
    color: #e64f4f;
  }
  
  .empty-wrapper {
    margin-top: 120rpx;
    display: flex;
    justify-content: center;
  }
  
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }

  .empty-hint {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #bbb;
    text-align: center;
  }

  .empty-container {
    padding: 48rpx 24rpx;
    text-align: center;
  }

  .section-empty {
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
  }

  .launched-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 12rpx;
  }

  .launched-head .project-title {
    flex: 1;
    font-weight: 600;
  }

  .status-pill {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: #f0f0f5;
    color: #666;
    flex-shrink: 0;
  }

  .status-pill.audit-1 {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .status-pill.audit-2 {
    background: #ffebee;
    color: #c62828;
  }

  .meta-line {
    font-size: 24rpx;
    color: #888;
    margin-bottom: 20rpx;
  }

  .launched-actions {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
  }

  .launched-btn {
    width: 160rpx;
    height: 70rpx;
    font-size: 26rpx;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    line-height: normal;
  }

  .launched-btn.outline {
    background: transparent;
    color: #355ac9;
    border: 2rpx solid #355ac9;
  }

  .launched-btn.primary {
    background: #355ac9;
    color: #fff;
    border: none;
  }
  </style>
  
  