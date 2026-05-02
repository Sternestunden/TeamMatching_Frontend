<template>
  <view class="invite-detail-page">
    <view class="detail-content">
      <view class="inviter-info">
        <Avatar :src="inviteInfo.avatar" size="60" />
        <view class="info-content">
          <text class="inviter-name">{{ inviteInfo.name }}</text>
          <text class="inviter-role">{{ inviteInfo.role || '沟通对象' }}</text>
        </view>
      </view>

      <view class="project-card">
        <text class="card-title">关联项目</text>
        <text class="project-name">{{ inviteInfo.projectName }}</text>
        <text class="project-desc">{{ inviteInfo.projectDesc }}</text>
        <text class="invite-time">时间：{{ inviteInfo.inviteTime || '--' }}</text>
      </view>

      <view class="invite-desc">
        <text class="desc-label">说明：</text>
        <text class="desc-content">{{ inviteInfo.inviteDesc || "暂无说明" }}</text>
      </view>

      <view class="operate-buttons">
        <button class="accept-btn" @click="goProjectDetail">查看项目详情</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/common/api/index.js'

export default {
  data() {
    return {
      projectId: null,
      inviteInfo: {
        id: '',
        avatar: '',
        name: '沟通对象',
        role: '',
        projectName: '项目',
        projectDesc: '',
        inviteTime: '',
        inviteDesc: '',
        projectId: null
      }
    }
  },
  async onLoad(options) {
    console.log('邀请详情页接收参数:', options)

    // 1. 优先从 URL 参数获取 projectId
    if (options?.projectId) {
      this.projectId = Number(options.projectId) || null
      console.log('从URL获取到 projectId:', this.projectId)
    }

    // 2. 解析 payload 获取更多信息
    if (options?.payload) {
      this.parsePayload(options.payload)
    }

    // 3. 如果有 projectId，调用接口获取详情
    if (this.projectId) {
      await this.fetchInviteDetail()
    } else {
      console.warn('缺少 projectId，无法加载详情')
      uni.showToast({ title: '缺少项目ID', icon: 'none' })
    }
  },
  methods: {
    parsePayload(payload) {
      if (!payload) return
      try {
        const item = JSON.parse(decodeURIComponent(payload))
        console.log('解析 payload 数据:', item)

        // 保存 projectId 到 inviteInfo 中
        if (item.projectId) {
          this.inviteInfo.projectId = item.projectId
        }

        this.inviteInfo = {
          ...this.inviteInfo,
          id: item?.id || '',
          avatar: item?.avatar || '',
          name: item?.name || item?.nickname || '沟通对象',
          role: item?.role || '申请/邀请相关用户',
          projectName: item?.projectName || item?.name || this.inviteInfo.projectName,
          inviteTime: item?.time || item?.createTime || '',
          inviteDesc: item?.content || ''
        }
      } catch (e) {
        console.warn('解析详情参数失败', e)
      }
    },
    async fetchInviteDetail() {
      if (!this.projectId) return

      uni.showLoading({ title: '加载中...' })
      try {
        const res = await api.getProjectDetail(this.projectId)
        console.log('项目详情接口返回:', res)

        if (res?.code === 200 && res?.data) {
          const data = res.data
          this.inviteInfo = {
            ...this.inviteInfo,
            projectName: data.name || this.inviteInfo.projectName,
            projectDesc: data.projectIntro || data.projectFeatures || '暂无项目介绍',
            inviteTime: data.releaseTime || this.inviteInfo.inviteTime
          }
        } else {
          console.warn('项目详情获取失败:', res?.message)
        }
      } catch (e) {
        console.error('获取项目详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    goProjectDetail() {
      console.log('准备跳转，当前 projectId:', this.projectId)

      if (!this.projectId) {
        uni.showToast({ title: '缺少项目ID', icon: 'none' })
        return
      }

      uni.navigateTo({
        url: `/pages/projectDetail/index?projectId=${this.projectId}`
      })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.invite-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.page-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}
.back-btn {
  font-size: 18px;
  color: #333;
}
.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.empty {
  width: 18px;
}

/* 详情内容区 */
.detail-content {
  padding: 15px;
}

/* 邀请人信息 */
.inviter-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}
.info-content {
  margin-left: 15px;
}
.inviter-name {
  font-size: 18px;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}
.inviter-role {
  font-size: 14px;
  color: #666;
}

/* 项目信息卡片 */
.project-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 15px;
}
.card-title {
  font-size: 14px;
  color: #999;
  display: block;
  margin-bottom: 8px;
}
.project-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}
.project-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: block;
  margin-bottom: 8px;
}
.invite-time {
  font-size: 12px;
  color: #999;
}

/* 邀请说明 */
.invite-desc {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 80px; /* 给底部按钮留空间 */
}
.desc-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}
.desc-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 底部操作按钮 */
.operate-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-sizing: border-box;
}
.reject-btn {
  flex: 1;
  height: 48px;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}
.accept-btn {
  flex: 1;
  height: 48px;
  background-color: #003399;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}
.accept-btn:active {
  background-color: #002673;
}
</style>