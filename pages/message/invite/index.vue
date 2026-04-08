<template>
  <view class="invite-page">

    <!-- 邀请列表 -->
    <view class="invite-list">
      <!-- 单条邀请 -->
      <view 
        class="invite-item" 
        v-for="(item, index) in inviteList" 
        :key="index"
        @click="handleInvite(item)"
      >
        <!-- 左侧头像 -->
        <Avatar :src="item.avatar" size="48" />
        
        <!-- 中间内容区 -->
        <view class="invite-content">
          <view class="invite-header">
            <text class="invite-name">{{ item.name }}</text>
            <text class="invite-time">{{ item.time }}</text>
          </view>
          <text class="invite-desc">{{ item.content }}</text>
          <!-- 邀请状态标签 -->
          <view class="invite-status" :class="item.statusClass">{{ item.status }}</view>
        </view>
        
        <!-- 右侧新消息红点 -->
        <view class="message-badge" v-if="item.isNew"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviteList: [
        {
          id: 1,
          avatar: "",
          name: "李队长",
          time: "今天 10:20",
          content: "邀请你加入「第十届互联网+创新大赛」项目组",
          status: "待确认",
          statusClass: "status-pending",
          isNew: true
        },
        {
          id: 2,
          avatar: "",
          name: "王同学",
          time: "昨天 18:30",
          content: "邀请你加入「校园二手交易平台」项目组",
          status: "已拒绝",
          statusClass: "status-reject",
          isNew: false
        }
      ]
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    // 处理邀请（点击进入详情/操作）
    handleInvite(item) {
      // 标记为已读
      item.isNew = false;
      // 跳转到邀请详情页（可扩展）
      uni.navigateTo({ url: `/pages/message/invite/inviteDetail?id=${item.id}` });
    }
  }
};
</script>

<style scoped>
/* 页面容器 */
.invite-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 页面标题栏 */
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

/* 邀请列表 */
.invite-list {
  padding: 15px;
}
.invite-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  position: relative;
}

/* 邀请内容区 */
.invite-content {
  flex: 1;
  margin-left: 12px;
}
.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.invite-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}
.invite-time {
  font-size: 12px;
  color: #999;
}
.invite-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  display: block;
}

/* 邀请状态标签 */
.invite-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}
.status-pending {
  background-color: #e8f4f8;
  color: #007aff;
}
.status-accept {
  background-color: #e8f8e8;
  color: #00c853;
}
.status-reject {
  background-color: #fef0f0;
  color: #ff4757;
}

/* 新消息红点（和主页面样式一致） */
.message-badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ff3333;
  position: absolute;
  right: 15px;
  top: 20px;
}
</style>