<template>
  <view class="invite-page">
    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="content-wrap">
      <view class="section">
        <view class="section-head">
          <text class="section-title">组队邀请</text>
        </view>

        <view class="sub-block">
          <text class="sub-title">我发送的邀请</text>
          <view v-if="!sentInviteList.length" class="empty-box">
            <text class="empty-text">暂无我发出的组队邀请</text>
          </view>
          <view
            v-for="(item, index) in sentInviteList"
            :key="'si-' + (item.id || index)"
            class="invite-item"
            @tap="handleInvite(item)"
          >
            <Avatar :src="item.avatar" size="44" />
            <view class="invite-content">
              <view class="invite-header">
                <text class="invite-name">{{ item.name }}</text>
                <text class="invite-time">{{ item.time }}</text>
              </view>
              <text class="invite-desc">{{ item.content }}</text>
              <text class="invite-status status-accept">{{ item.status }}</text>
            </view>
            <view class="message-badge" v-if="item.isNew"></view>
          </view>
        </view>

        <view class="sub-block">
          <text class="sub-title">我收到的邀请</text>
          <view v-if="!receivedInviteList.length" class="empty-box">
            <text class="empty-text">暂无收到的组队邀请</text>
          </view>
          <view
            v-for="(item, index) in receivedInviteList"
            :key="'ri-' + (item.id || index)"
            class="invite-item"
            @tap="handleInvite(item)"
          >
            <Avatar :src="item.avatar" size="44" />
            <view class="invite-content">
              <view class="invite-header">
                <text class="invite-name">{{ item.name }}</text>
                <text class="invite-time">{{ item.time }}</text>
              </view>
              <text class="invite-desc">{{ item.content }}</text>
              <text class="invite-status status-pending">{{ item.status }}</text>
            </view>
            <view class="message-badge" v-if="item.isNew"></view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">加入申请</text>
        </view>

        <view class="sub-block">
          <text class="sub-title">我发送的申请</text>
          <view v-if="!myExchangeRequestList.length" class="empty-box">
            <text class="empty-text">暂无我发起的联系方式交换请求</text>
          </view>
          <view
            v-for="(item, index) in myExchangeRequestList"
            :key="'me-' + (item.id || index)"
            class="invite-item"
            @tap="handleInvite(item)"
          >
            <Avatar :src="item.avatar" size="44" />
            <view class="invite-content">
              <view class="invite-header">
                <text class="invite-name">{{ item.name }}</text>
                <text class="invite-time">{{ item.time }}</text>
              </view>
              <text class="invite-desc">{{ item.content }}</text>
              <text class="invite-status status-pending">{{ item.status }}</text>
            </view>
          </view>
        </view>

        <view class="sub-block">
          <text class="sub-title">我收到的申请</text>
          <view v-if="!receivedExchangeRequestList.length" class="empty-box">
            <text class="empty-text">暂无收到的联系方式交换请求</text>
          </view>
          <view
            v-for="(item, index) in receivedExchangeRequestList"
            :key="'re-' + (item.id || index)"
            class="invite-item"
            @tap="handleInvite(item)"
          >
            <Avatar :src="item.avatar" size="44" />
            <view class="invite-content">
              <view class="invite-header">
                <text class="invite-name">{{ item.name }}</text>
                <text class="invite-time">{{ item.time }}</text>
              </view>
              <text class="invite-desc">{{ item.content }}</text>
              <text class="invite-status status-accept">{{ item.status }}</text>
            </view>
            <view class="message-badge" v-if="item.isNew"></view>
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
      loading: false,
	  // 组队邀请
      sentInviteList: [], // 我发送的
      receivedInviteList: [], // 我收到的

      // 加入申请 (交换请求)
      myExchangeRequestList: [], // 我发送的申请
      receivedExchangeRequestList: [] // 我收到的申请
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
     // 统一加载数据
        async loadData() {
          try {
            // 1. 加载组队邀请数据
            const [sentRes, receivedRes] = await Promise.all([
              api.getSentTalentInvitations({ page: 1, size: 10 }),
              api.getReceivedTalentInvitations({ page: 1, size: 10 })
            ])
    
            if (sentRes.code === 200) {
              this.sentInviteList = this.formatInviteData(sentRes.data || [])
            }
    
            if (receivedRes.code === 200) {
              this.receivedInviteList = this.formatInviteData(receivedRes.data || [])
            }
    
            // 2. 加载加入申请数据
            const [myAppRes, receivedAppRes] = await Promise.all([
              api.getMyApplications({ page: 1, size: 10 }),
              api.getMyReceivedApplications({ page: 1, size: 10 })
            ])
    
            if (myAppRes.code === 200) {
              this.myExchangeRequestList = this.formatRequestData(myAppRes.data || [])
            }
    
            if (receivedAppRes.code === 200) {
              this.receivedExchangeRequestList = this.formatRequestData(receivedAppRes.data || [])
            }
          } catch (error) {
            console.error('加载消息数据失败', error)
            uni.$u.toast('数据加载失败')
          }
        },

    mergeApplyList(localList, apiList) {
      const used = new Set()
      const merged = []
      ;[...localList, ...apiList].forEach((item) => {
        const key = `${item.projectId || ''}-${item.name || ''}`
        if (used.has(key)) return
        used.add(key)
        merged.push(item)
      })
      return merged
    },
    formatTime(value) {
      if (!value) return ''
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return String(value)
      const y = d.getFullYear()
      const m = `${d.getMonth() + 1}`.padStart(2, '0')
      const day = `${d.getDate()}`.padStart(2, '0')
      const hh = `${d.getHours()}`.padStart(2, '0')
      const mm = `${d.getMinutes()}`.padStart(2, '0')
      return `${y}-${m}-${day} ${hh}:${mm}`
    },
    recruitStatusText(status) {
      const m = {
        communicating: '沟通中',
        offer: '已发出邀约',
        reject: '已拒绝'
      }
      return m[status] || '沟通中'
    },
    applyStatusText(status) {
      const m = {
        0: '待处理',
        1: '沟通中',
        2: '已通过',
        3: '已拒绝'
      }
      return m[status] != null ? m[status] : '沟通中'
    },
	
	
	    // 格式化组队邀请数据 (根据实际接口返回字段调整)
	    formatInviteData(list) {
	      return list.map((item) => ({
	        id: item.id,
			projectId: item.projectId || item.id,
	        avatar: item.avatar || '/static/default-avatar.png',
	        name: item.name || item.projectName || '未知用户',
	        time: item.time || item.createTime || '刚刚',
	        content: item.content || `邀请您加入 ${item.projectName || '项目'}`,
	        status: item.status || '待处理',
	        isNew: item.isNew || false
	      }))
	    },
	
	// 格式化申请数据 (根据实际接口返回字段调整)
	    formatRequestData(list) {
	      return list.map((item) => ({
	        id: item.id,
			 projectId: item.projectId || item.id,
	        avatar: item.avatar || '/static/default-avatar.png',
	        name: item.name || item.projectName || '未知项目',
	        time: item.time || item.createTime || '刚刚',
	        content: item.content || `申请加入 ${item.projectName || '项目'}`,
	        status: item.status || '待处理',
	        isNew: item.isNew || false
	      }))
	    },
	
    handleInvite(item) {
      console.log('点击卡片:', item)
      const payload = encodeURIComponent(JSON.stringify(item || {}))
      // 修复：传递真实的 projectId，而不是 item.id
      const targetProjectId = item.projectId || item.id
      uni.navigateTo({
        url: `/pages/message/invite/inviteDetail?projectId=${targetProjectId}&payload=${payload}`
      })
    }
  }
}
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  background: #f5f7fb;
}
.loading-wrap {
  padding: 120rpx 24rpx;
  text-align: center;
}
.loading-text {
  font-size: 28rpx;
  color: #888;
}
.content-wrap {
  padding: 24rpx;
}
.section {
  margin-bottom: 28rpx;
}
.section-head {
  margin-bottom: 14rpx;
}
.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
}
.sub-block {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 18rpx;
}
.sub-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #355ac9;
  margin-bottom: 14rpx;
}
.empty-box {
  padding: 24rpx 8rpx 12rpx;
}
.empty-text {
  font-size: 24rpx;
  color: #999;
}
.invite-item {
  display: flex;
  align-items: flex-start;
  background: #f9fbff;
  border: 1rpx solid #edf1ff;
  border-radius: 14rpx;
  padding: 18rpx;
  margin-bottom: 12rpx;
  position: relative;
}
.invite-item:last-child {
  margin-bottom: 0;
}
.invite-content {
  flex: 1;
  margin-left: 14rpx;
}
.invite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
  gap: 12rpx;
}
.invite-name {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}
.invite-time {
  font-size: 22rpx;
  color: #999;
}
.invite-desc {
  display: block;
  font-size: 24rpx;
  color: #5f6470;
  line-height: 1.5;
  margin-bottom: 10rpx;
}
.invite-status {
  display: inline-block;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
}
.status-pending {
  background: #eaf2ff;
  color: #2f64f5;
}
.status-accept {
  background: #e8f8e8;
  color: #2f9d53;
}
.message-badge {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #ff4d4f;
  position: absolute;
  top: 14rpx;
  right: 14rpx;
}
</style>