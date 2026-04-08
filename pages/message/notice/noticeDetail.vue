<template>
  <view class="notice-detail-page">

    <!-- 详情内容区 -->
    <view class="detail-content">
      <!-- 通知头部（系统图标 + 标题 + 时间） -->
      <view class="notice-header">
        <view class="system-icon">🔔</view>
        <view class="header-content">
          <text class="notice-title">{{ noticeInfo.title }}</text>
          <text class="notice-time">{{ noticeInfo.time }}</text>
        </view>
      </view>

      <!-- 通知内容 -->
      <view class="notice-content">
        <text class="content-text">{{ noticeInfo.content }}</text>
      </view>

      <!-- 操作按钮（可选：如“查看项目”） -->
      <view class="operate-btn" v-if="noticeInfo.hasProject" @click="goToProject">
        <button class="view-project-btn">查看项目</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      noticeInfo: {
        id: "",
        title: "项目审核通知",
        time: "2026-03-15 09:15",
        content: "你提交的「AI图像识别」项目已审核通过，可正常招募队员。请及时完善项目信息，确保招募信息准确。",
        hasProject: true, // 是否关联项目
        projectId: 1
      }
    };
  },
  onLoad(options) {
    // 接收从列表页传递的通知ID
    this.noticeInfo.id = options.id;
    // 模拟请求通知详情
    this.fetchNoticeDetail();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    // 获取通知详情
    fetchNoticeDetail() {
      console.log("请求通知详情，ID：", this.noticeInfo.id);
    },
    // 跳转到关联项目
    goToProject() {
      uni.navigateTo({
        url: `/pages/projectDetail/index?id=${this.noticeInfo.projectId}`
      });
    }
  }
};
</script>

<style scoped>
/* 页面容器 */
.notice-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏（和邀请详情页一致） */
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

/* 通知头部 */
.notice-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}
.system-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e8f4f8;
  color: #007aff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-content {
  margin-left: 15px;
}
.notice-title {
  font-size: 18px;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}
.notice-time {
  font-size: 14px;
  color: #999;
}

/* 通知内容 */
.notice-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 20px 15px;
  margin-bottom: 20px;
}
.content-text {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
}

/* 操作按钮 */
.operate-btn {
  padding: 0 15px;
}
.view-project-btn {
  width: 100%;
  height: 48px;
  background-color: #003399;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}
.view-project-btn:active {
  background-color: #002673;
}
</style>