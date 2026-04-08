<template>
  <view class="user-page">
    <view v-if="type === 'launched'" class="launched-wrapper">
      <view v-for="(item, index) in launchedList" :key="index" class="project-card launched-card">
        <text class="project-title">{{ item.title }}</text>
      </view>
      <button class="btn btn-primary create-btn" @tap="onCreateProject">创建新项目</button>
    </view>

    <view v-else-if="type === 'joined'" class="joined-wrapper">
      <view v-for="(item, index) in joinedList" :key="index" class="project-card joined-card" :class="`status-${item.status}`">
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
export default {
  data() {
    return {
      type: 'launched',
      launchedList: [
        { title: '基于AI的校园组队平台' },
        { title: '何意味' }
      ],
      joinedList: [
        { title: '基于校园的AI组队平台', status: 'pending', statusText: '申请中' },
        { title: '项目二', status: 'passed', statusText: '已通过' },
        { title: '项目三', status: 'rejected', statusText: '被拒' }
      ],
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
  },

  methods: {
    updateTitle() {
      let title = '我的项目'
      if (this.type === 'launched') title = '我发起的项目'
      else if (this.type === 'joined') title = '我加入的项目'
      else if (this.type === 'draft') title = '草稿箱'
      uni.setNavigationBarTitle({ title })
    },

    loadDraftList() {
      this.draftedList = uni.getStorageSync('projectDrafts') || []
    },

    onCreateProject() {
      if (this.isNavigating) return
      this.isNavigating = true
      uni.switchTab({
        url: '/pages/create/index',
        complete: () => setTimeout(() => this.isNavigating = false, 500)
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
  </style>
  
  