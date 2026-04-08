<template>
  <view class="detail-page">

    <!-- 页面内容区（给 NavBar 和底部按钮留空间） -->
    <view class="detail-content">
      <!-- 第二行：项目名称（黑体粗字） -->
      <view class="project-title">
        <text>{{ project.name }}</text>
      </view>

      <!-- 第三行：项目要求 + 项目类型（灰色 Tag） -->
      <view class="project-tags">
        <view class="tag-item">
          <text class="tag-icon">💼</text>
          <text class="tag-text">{{ project.require }}</text>
        </view>
        <view class="tag-item">
          <text class="tag-icon">🎒</text>
          <text class="tag-text">{{ project.type }}</text>
        </view>
      </view>

      <!-- 第四行：队长信息（头像 + 名字） -->
      <view class="leader-info" @click="goToLeaderPage">
        <Avatar :src="project.leaderAvatar" size="48" />
        <text class="leader-name">{{ project.leaderName }}</text>
        <text class="arrow">></text>
      </view>

      <!-- 第五行及以后：项目详情 -->
      <view class="project-detail">
        <text class="detail-title">项目详情</text>
        <text class="detail-content-text">{{ project.detail }}</text>
      </view>
    </view>

    <!-- 底部固定按钮：立即沟通 -->
    <view class="bottom-btn">
      <button class="communicate-btn" @click="handleCommunicate">立即沟通</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
		projectId: '',
      isCollected: false, // 收藏状态
      project: {
        id: '',
        name: '第十届互联网+创新大赛',
        require: '经验不限',
        type: '前端',
        leaderAvatar: '',
        leaderName: '李队长',
        detail: '本项目致力于开发一款AI图像识别应用，需要具备Vue.js和小程序开发经验的同学加入，共同完成产品设计、前端开发和测试上线。'
      }
    }
  },
  onLoad(options) {
	  console.log('接收到的参数:', options)
	      // 1. 兼容处理：有时候参数会在 options 里，有时候可能需要从其他途径获取
	      const id = options.projectId;
	  
	      if (id) {
	          this.projectId = id;
	          this.getProjectDetailFromApi();
	      } else {
	          // 2. 修改点：不要使用 navigateBack，这会打断页面跳转
	          console.error('缺少项目ID');
	          uni.showToast({
	              title: '参数错误',
	              icon: 'none',
	              duration: 2000
	          });
	          // 如果需要返回，建议加个延时，或者让用户手动点返回
	      }
  },
  methods: {
	  async getProjectDetailFromApi() {
	      uni.showLoading({ title: '加载中...' })
	  
	      uni.request({
	        url: `http://8.159.150.156:8080/project/${Number(this.projectId)}`,
	        method: 'GET',
	        success: (res) => {
	          const result = res.data
	          if (result.success && result.code === 200) {
	            const data = result.data
	  
	            // 把后端字段 → 映射到你页面的 project 字段
	            this.project = {
	              id: data.projectId,
	              name: data.name,
	              require: data.allowCrossMajor ? '允许跨专业' : '不允许跨专业',
	              type: data.belongTrack,
	              leaderAvatar: '', // 后端没给就留空
	              leaderName: '队长', // 后端没给就留空
	              detail: data.projectIntro
	            }
	  
	          } else {
	            uni.showToast({ title: '加载失败', icon: 'none' })
	          }
	        },
	        fail: () => {
	          uni.showToast({ title: '网络异常', icon: 'none' })
	        },
	        complete: () => {
	          uni.hideLoading()
	        }
	      })
	    },
	  
    // 获取项目详情
	/*
    fetchProjectDetail() {
      // 这里替换为真实接口请求
      this.project = {
        id: this.project.id,
        name: '第十届互联网+创新大赛',
        require: '经验不限',
        type: '前端',
        leaderAvatar: '',
        leaderName: '李队长',
        detail: '本项目致力于开发一款AI图像识别应用，需要具备Vue.js和小程序开发经验的同学加入，共同完成产品设计、前端开发和测试上线。'
      };
    },
	*/
    // 切换收藏状态
    toggleCollect() {
      this.isCollected = !this.isCollected;
      uni.showToast({
        title: this.isCollected ? '收藏成功' : '取消收藏',
        icon: 'none'
      });
      // 真实项目：调用接口更新收藏状态
    },
    // 跳转到队长个人页
    goToLeaderPage() {
      uni.navigateTo({
        url: `/pages/leader/index?name=${this.project.leaderName}`
      });
    },
    // 立即沟通
    handleCommunicate() {
      uni.showModal({
        title: '沟通提示',
        content: '是否要联系项目队长？',
        success: (res) => {
          if (res.confirm) {
            // 真实项目：跳转到聊天页/复制联系方式
            uni.showToast({
              title: '已复制队长微信',
              icon: 'none'
            });
          }
        }
      });
    }
	
  }
};
</script>

<style scoped>
/* 页面容器：给 NavBar 和底部按钮留空间 */
.detail-page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 80px; /* 给底部按钮预留空间 */
}

/* 内容区 */
.detail-content {
  padding: 15px 20px;
}

/* 第二行：项目名称（黑体粗字） */
.project-title {
  font-size: 28px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
}

/* 第三行：项目 Tag */
.project-tags {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
}
.tag-icon {
  font-size: 16px;
}
.tag-text {
  color: #666;
}

/* 第四行：队长信息 */
.leader-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}
.leader-name {
  font-size: 16px;
  color: #000;
  flex: 1;
}
.arrow {
  font-size: 18px;
  color: #999;
}

/* 项目详情 */
.project-detail {
  margin-top: 20px;
}
.detail-title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  margin-bottom: 12px;
}
.detail-content-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

/* 底部固定按钮 */
.bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
}
.communicate-btn {
  width: 80%;
  height: 48px;
  background-color: #003399;
  color: #fff;
  font-size: 18px;
  border-radius: 4px;
  border: none;
  left:-20px;
}
.communicate-btn:active {
  background-color: #002673;
}
</style>