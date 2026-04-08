<template>
  <view class="feedback-page">
    <!-- 1. 满意度评分模块 -->
    <view class="card satisfaction-card">
      <view class="greeting">
        <text class="greeting-text">亲爱的{{ userName }}：</text>
        <text class="question">你喜欢这个产品吗？</text>
      </view>
      <view class="emoji-list">
        <view 
          class="emoji-item" 
          :class="{ active: selectedScore === 1 }"
          @click="selectScore(1)"
        >
          <text class="emoji">😠</text>
          <text class="emoji-label">非常不满意</text>
        </view>
        <view 
          class="emoji-item" 
          :class="{ active: selectedScore === 2 }"
          @click="selectScore(2)"
        >
          <text class="emoji">🙁</text>
          <text class="emoji-label">不满意</text>
        </view>
        <view 
          class="emoji-item" 
          :class="{ active: selectedScore === 3 }"
          @click="selectScore(3)"
        >
          <text class="emoji">😐</text>
          <text class="emoji-label">一般</text>
        </view>
        <view 
          class="emoji-item" 
          :class="{ active: selectedScore === 4 }"
          @click="selectScore(4)"
        >
          <text class="emoji">😊</text>
          <text class="emoji-label">满意</text>
        </view>
        <view 
          class="emoji-item" 
          :class="{ active: selectedScore === 5 }"
          @click="selectScore(5)"
        >
          <text class="emoji">😍</text>
          <text class="emoji-label">非常满意</text>
        </view>
      </view>
    </view>

    <!-- 2. 意见建议输入框 -->
    <view class="card input-card">
      <text class="section-title">请将你的意见和建议告诉我们吧</text>
      <textarea
        class="feedback-textarea"
        v-model="feedbackContent"
        placeholder="开发团队感谢你，并立即吸纳进产品的更新中"
        auto-height
        :max-height="300"
      />
    </view>

    <!-- 3. 图片上传模块 -->
    <view class="card upload-card">
      <text class="section-title">你可以上传图片，以说明你的意见</text>
      <view class="upload-list">
        <view 
          class="upload-add-btn" 
          @click="chooseImage"
          v-if="uploadImages.length < 9"
        >
          <text class="add-icon">+</text>
        </view>
        <view 
          class="upload-img-item" 
          v-for="(img, index) in uploadImages" 
          :key="index"
        >
          <image :src="img" class="upload-img" mode="aspectFill" />
          <text class="del-img" @click="deleteImage(index)">×</text>
        </view>
      </view>
    </view>

    <!-- 4. 联系方式输入框 -->
    <view class="card contact-card">
      <text class="section-title">联系方式</text>
      <input
        class="contact-input"
        v-model="contactInfo"
        placeholder="留下联系方式，方便我们向你回复"
        type="text"
      />
    </view>

    <!-- 底部固定提交按钮 -->
    <view class="submit-footer">
      <button class="submit-btn" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userName: '',          // 从父页面传过来的用户名
      selectedScore: 0,      // 选中的评分 1-5
      feedbackContent: '',  // 反馈内容
      uploadImages: [],     // 上传的图片列表
      contactInfo: ''       // 联系方式
    }
  },
  onLoad(options) {
    // 从跳转参数获取用户名
    if (options.userName) {
      this.userName = decodeURIComponent(options.userName)
    }
    // 设置导航栏标题
    uni.setNavigationBarTitle({ title: '意见反馈' })
  },
  methods: {
    // 选择评分
    selectScore(score) {
      this.selectedScore = score
    },
	
    // 选择图片（兼容 H5 + 小程序）
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.uploadImages.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // res.tempFilePaths 是图片临时路径数组
          this.uploadImages = [...this.uploadImages, ...res.tempFilePaths]
        },
        fail: (err) => {
          console.error('选择图片失败', err)
        }
      })
    },

    // 删除图片
    deleteImage(index) {
      this.uploadImages.splice(index, 1)
    },

    // 提交反馈
    handleSubmit() {
      // 1. 校验必填项（评分）
      if (this.selectedScore === 0) {
        uni.showToast({ title: '请先选择满意度', icon: 'none' })
        return
      }

      // 2. 构造提交数据
      const submitData = {
        userName: this.userName,
        score: this.selectedScore,
        content: this.feedbackContent,
        images: this.uploadImages,
        contact: this.contactInfo
      }

      console.log('提交的反馈数据：', submitData)

      // 3. 这里替换为你的真实接口请求
      // uni.request({
      //   url: '你的反馈接口地址',
      //   method: 'POST',
      //   data: submitData,
      //   success: () => {
      //     uni.showToast({ title: '提交成功', icon: 'success' })
      //     setTimeout(() => uni.navigateBack(), 1500)
      //   }
      // })

      // 模拟提交成功
      uni.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  }
}
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background-color: #f5f7fb;
  padding: 20rpx;
  box-sizing: border-box;
  padding-bottom: 120rpx; /* 给底部按钮留空间 */
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

/* 1. 满意度模块 */
.greeting {
  margin-bottom: 40rpx;
}
.greeting-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
}
.question {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}

.emoji-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.emoji-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
  transition: all 0.2s;
}
.emoji-item.active {
  opacity: 1;
  transform: scale(1.1);
}
.emoji {
  font-size: 80rpx;
  margin-bottom: 10rpx;
}
.emoji-label {
  font-size: 26rpx;
  color: #666;
}

/* 2. 通用标题样式 */
.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #222;
  margin-bottom: 20rpx;
}

/* 3. 意见输入框 */
.feedback-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}
.feedback-textarea::placeholder {
  color: #999;
}

/* 4. 图片上传 */
.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.upload-add-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-icon {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
}
.upload-img-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
.upload-img {
  width: 100%;
  height: 100%;
}
.del-img {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 0 0 0 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

/* 5. 联系方式输入框 */
.contact-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}
.contact-input::placeholder {
  color: #999;
}

/* 6. 底部提交按钮 */
.submit-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx 30rpx;
  background: #fff;
  box-sizing: border-box;
  border-top: 1rpx solid #eee;
}
.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #f54336;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
}
button::after {
  border: none;
}
</style>