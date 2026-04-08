<template>
  <view class="message-page">
    <!-- 1. 顶部功能按钮区（组队邀请 + 系统通知） -->
    <view class="function-buttons">
      <view class="function-item" @click="goToInviteList">
        <view class="function-icon invite-icon">✉️</view>
        <text class="function-title">组队邀请</text>
        <text class="function-badge" v-if="inviteCount > 0">{{ inviteCount }}条新邀请</text>
      </view>
      <view class="function-item" @click="goToNoticeList">
        <view class="function-icon notice-icon">🔔</view>
        <text class="function-title">系统通知</text>
        <text class="function-desc">项目审核通过</text>
      </view>
    </view>

    <!-- 2. 消息列表区 -->
    <view class="message-list">
      <!-- 单条消息 -->
      <view 
        class="message-item" 
        v-for="(item, index) in messageList" 
        :key="index"
        @click="goToChat(item)"
      >
        <!-- 左侧头像 -->
        <Avatar :src="item.avatar" size="48" />
        
        <!-- 中间内容区 -->
        <view class="message-content">
          <view class="message-header">
            <view class="name-row">
              <text class="user-name">{{ item.name }}</text>
              <text class="user-tag" v-if="item.tag">{{ item.tag }}</text>
            </view>
            <text class="message-time">{{ item.time }}</text>
          </view>
          <text class="message-desc">{{ item.content }}</text>
        </view>
        
        <!-- 右侧新消息红点 -->
        <view class="message-badge" v-if="item.isNew">
          <text class="badge-text">{{ item.badgeCount || 1 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviteCount: 2, // 组队邀请新消息数
      messageList: [
        {
          id: 1,
          avatar: "",
          name: "队长",
          tag: "队长",
          time: "10:30",
          content: "你好，我对你的前端经历很感兴趣，能聊聊吗？",
          isNew: true,
          badgeCount: 1
        }
        // 可继续添加更多消息
        // { id: 2, ... }
      ]
    };
  },
  methods: {
    // 跳转到组队邀请列表
    goToInviteList() {
      uni.navigateTo({ url: "/pages/message/invite/index" });
    },
    // 跳转到系统通知列表
    goToNoticeList() {
      uni.navigateTo({ url: "/pages/message/notice/index" });
    },
    // 跳转到聊天页
    goToChat(item) {
      // 标记为已读
      item.isNew = false;
      uni.navigateTo({ url: `/pages/message/chat/index?userId=${item.id}` });
    }
  }
};
</script>

<style scoped>
/* 页面容器 */
.message-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 15px;
}

/* 顶部功能按钮区 */
.function-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.function-item {
  flex: 1;
  background-color: #fff;
  padding: 20px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.function-icon {
  width: 48px;
  height: 48px;
  line-height: 48px;
  border-radius: 50%;
  background-color: #003399;
  color: #fff;
  font-size: 24px;
  margin: 0 auto 10px;
}
.function-title {
  font-size: 16px;
  color: #000;
  display: block;
  margin-bottom: 5px;
}
.function-badge {
  font-size: 14px;
  color: #ff6600;
}
.function-desc {
  font-size: 14px;
  color: #666;
}

/* 消息列表 */
.message-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.message-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}
.message-item:last-child {
  border-bottom: none;
}

/* 消息内容区 */
.message-content {
  flex: 1;
  margin-left: 12px;
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name {
  font-size: 16px;
  color: #000;
}
.user-tag {
  font-size: 12px;
  color: #003399;
  border: 1px solid #003399;
  padding: 1px 6px;
  border-radius: 4px;
}
.message-time {
  font-size: 12px;
  color: #999;
}
.message-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 新消息红点 */
.message-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ff3333;
  color: #fff;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}
.badge-text {
  color: #fff;
}
</style>