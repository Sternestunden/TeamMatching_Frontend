<template>
  <view class="invite-detail-page">

    <!-- 详情内容区 -->
    <view class="detail-content">
      <!-- 邀请人信息 -->
      <view class="inviter-info">
        <Avatar :src="inviteInfo.avatar" size="60" />
        <view class="info-content">
          <text class="inviter-name">{{ inviteInfo.name }}</text>
          <text class="inviter-role">{{ inviteInfo.role }}</text>
        </view>
      </view>

      <!-- 项目信息卡片 -->
      <view class="project-card">
        <text class="card-title">邀请加入项目</text>
        <text class="project-name">{{ inviteInfo.projectName }}</text>
        <text class="project-desc">{{ inviteInfo.projectDesc }}</text>
        <text class="invite-time">邀请时间：{{ inviteInfo.inviteTime }}</text>
      </view>

      <!-- 邀请说明 -->
      <view class="invite-desc">
        <text class="desc-label">邀请说明：</text>
        <text class="desc-content">{{ inviteInfo.inviteDesc || "暂无说明" }}</text>
      </view>

      <!-- 操作按钮区（底部固定） -->
      <view class="operate-buttons">
        <button class="reject-btn" @click="rejectInvite">拒绝</button>
        <button class="accept-btn" @click="acceptInvite">接受</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviteInfo: {
        id: "",
        avatar: "",
        name: "李队长",
        role: "项目队长",
        projectName: "第十届互联网+创新大赛",
        projectDesc: "AI图像识别 需要前端开发",
        inviteTime: "2026-03-15 10:20",
        inviteDesc: "希望你能加入负责前端开发，有vue经验优先"
      }
    };
  },
  onLoad(options) {
    // 接收从列表页传递的邀请ID
    this.inviteInfo.id = options.id;
    // 模拟请求邀请详情（真实项目替换为接口）
    this.fetchInviteDetail();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    // 获取邀请详情
    fetchInviteDetail() {
      // 真实项目：根据ID请求接口
      console.log("请求邀请详情，ID：", this.inviteInfo.id);
    },
    // 拒绝邀请
    rejectInvite() {
      uni.showModal({
        title: "提示",
        content: "确定拒绝该邀请吗？",
        success: (res) => {
          if (res.confirm) {
            // 模拟接口请求
            uni.showToast({ title: "已拒绝邀请", icon: "none" });
            setTimeout(() => {
              this.goBack(); // 拒绝后返回列表页
            }, 1000);
          }
        }
      });
    },
    // 接受邀请
    acceptInvite() {
      uni.showModal({
        title: "提示",
        content: "确定接受该邀请吗？",
        success: (res) => {
          if (res.confirm) {
            // 模拟接口请求
            uni.showToast({ title: "已接受邀请", icon: "success" });
            setTimeout(() => {
              this.goBack(); // 接受后返回列表页
            }, 1000);
          }
        }
      });
    }
  }
};
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