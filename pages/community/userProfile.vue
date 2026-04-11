<template>
  <view class="page">
    <scroll-view scroll-y class="scroll">
      <view class="card info-card">
        <view class="left"><view class="avatar"></view></view>
        <view class="right">
          <view class="name">{{ user.name }}</view>
          <view class="row">{{ user.major }} · {{ user.grade }}</view>
          <view class="tag-group">
            <view class="tag" v-for="(t,i) in user.tags" :key="i">{{ t }}</view>
          </view>
        </view>
      </view>
      <view class="card">
        <view class="card-title">自我介绍</view>
        <view class="text">{{ user.intro }}</view>
      </view>
      <view class="card" v-if="user.interest">
        <view class="card-title">感兴趣的方向</view>
        <view class="text">{{ user.interest }}</view>
      </view>
    </scroll-view>
    <view class="resume-btn" v-if="user.resume" @click="previewResume">查看简历</view>
  </view>
</template>

<script>
export default {
  data() { return { user: {} } },
  onLoad(options) {
    try {
      const decoded = decodeURIComponent(options.user)
      this.user = JSON.parse(decoded)
      uni.setNavigationBarTitle({ title: this.user.name })
    } catch (e) {
      this.user = { name: '加载失败', tags: [] }
      uni.showToast({ title: '数据异常', icon: 'none' })
    }
  },
  methods: {
    previewResume() {
      const path = this.user.resume
      if (!path) return
      if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(path)) {
        uni.previewImage({ urls: [path] })
      } else {
        uni.openDocument({
          filePath: path,
          fail: () => uni.showToast({ title: '无法打开', icon: 'none' })
        })
      }
    }
  }
}
</script>

<style scoped>
.page { background: #f5f7fa; min-height: 100vh; padding: 20rpx; position: relative; }
.scroll { padding-bottom: 120rpx; }
.card { background: #fff; border-radius: 24rpx; padding: 30rpx; margin-bottom: 20rpx; }
.info-card { display: flex; align-items: center; gap: 30rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: #007aff; }
.name { font-size: 38rpx; font-weight: bold; margin-bottom: 10rpx; }
.row { font-size: 28rpx; color: #666; margin-bottom: 15rpx; }
.tag-group { display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag { background: #e6f2ff; color: #007aff; padding: 8rpx 14rpx; border-radius: 12rpx; font-size: 24rpx; }
.card-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; }
.text { font-size: 28rpx; color: #333; line-height: 1.6; }
.resume-btn { position: fixed; bottom: 60rpx; right: 30rpx; background: #007aff; color: #fff; padding: 16rpx 28rpx; border-radius: 40rpx; font-size: 26rpx; z-index: 10; }
</style>
