<template>
  <view class="notice-page">


    <!-- 通知列表 -->
    <view class="notice-list">
      <!-- 单条通知 -->
      <view 
        class="notice-item" 
        v-for="(item, index) in noticeList" 
        :key="index"
        @click="handleNotice(item)"
      >
        <!-- 左侧系统头像（固定图标） -->
        <view class="system-avatar">
          <text class="avatar-icon">🔔</text>
        </view>
        
        <!-- 中间内容区 -->
        <view class="notice-content">
          <view class="notice-header">
            <text class="notice-title">{{ item.title }}</text>
            <text class="notice-time">{{ item.time }}</text>
          </view>
          <text class="notice-desc">{{ item.content }}</text>
          <!-- 通知状态标签 -->
          <view class="notice-status" :class="item.statusClass">{{ item.status }}</view>
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
      noticeList: [
        {
          id: 1,
          title: "项目审核通知",
          time: "今天 09:15",
          content: "你提交的「AI图像识别」项目已审核通过，可正常招募队员",
          status: "已读",
          statusClass: "status-read",
          isNew: false
        },
        {
          id: 2,
          title: "系统公告",
          time: "昨天 14:00",
          content: "本周日将关闭项目报名通道，请及时完成项目提交",
          status: "未读",
          statusClass: "status-unread",
          isNew: true
        }
      ]
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    // 处理通知
    handleNotice(item) {
      // 标记为已读
      item.isNew = false;
      item.status = "已读";
      item.statusClass = "status-read";
      // 可跳转到通知详情页
      uni.navigateTo({ url: `/pages/message/notice/noticeDetail?id=${item.id}` });
    }
  }
};
</script>

<style scoped>
/* 页面容器（和邀请页一致） */
.notice-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 页面标题栏（和邀请页样式完全一致） */
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

/* 通知列表（和邀请列表样式一致） */
.notice-list {
  padding: 15px;
}
.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  position: relative;
}

/* 系统头像（替代用户头像） */
.system-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-icon {
  font-size: 20px;
  color: #007aff;
}

/* 通知内容区（和邀请内容区样式一致） */
.notice-content {
  flex: 1;
  margin-left: 12px;
}
.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.notice-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}
.notice-time {
  font-size: 12px;
  color: #999;
}
.notice-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  display: block;
}

/* 通知状态标签 */
.notice-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}
.status-read {
  background-color: #f5f5f5;
  color: #999;
}
.status-unread {
  background-color: #e8f4f8;
  color: #007aff;
}

/* 新消息红点（样式统一） */
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