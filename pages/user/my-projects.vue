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
      <view
        v-for="(item, index) in joinedList"
        :key="item.projectId || index"
        class="project-card joined-card"
        :class="`status-${item.status}`"
        @tap="onViewJoined(item)"
      >
        <view class="joined-main">
          <text class="project-title">{{ item.title }}</text>
          <text class="status-text">{{ item.statusText }}</text>
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
      joinedList: [],
      draftedList: [],
      isNavigating: false
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
      else if (this.type === 'joined') title = '我加入的项目'
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
      this.loading = true
      try {
        const res = await api.getMyTeams()
        const data = res?.data || {}

        const joined = Array.isArray(data.joined) ? data.joined.map(x => ({
          projectId: x.projectId,
          title: x.name,
          status: 'passed',
          statusText: '已加入',
          belongTrack: x.belongTrack,
          role: x.role,
          projectLeader: x.projectLeader
        })) : []

        const applying = Array.isArray(data.applying) ? data.applying.map(x => ({
          projectId: x.projectId,
          title: x.name,
          status: 'pending',
          statusText: '申请中'
        })) : []

        const invited = Array.isArray(data.invited) ? data.invited.map(x => ({
          projectId: x.projectId,
          title: x.name,
          status: 'pending',
          statusText: '被邀请'
        })) : []

        const rejected = Array.isArray(data.rejected) ? data.rejected.map(x => ({
          projectId: x.projectId,
          title: x.name,
          status: 'rejected',
          statusText: '已退出/被拒'
        })) : []

        this.joinedList = [...applying, ...invited, ...joined, ...rejected]
      } catch (err) {
        console.error('获取我加入的项目失败：', err)
        uni.showToast({ title: '获取失败', icon: 'none' })
      } finally {
        this.loading = false
      }
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
  
  .joined-card {
    padding: 24rpx 28rpx;
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
  
  