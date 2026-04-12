<template>
  <view class="container">
    <view class="nav-bar">
      <view class="page-title">人才广场</view>
      <view class="search-box" @click="goSearch">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索人才" disabled />
        <view class="search-icon">🔍</view>
      </view>
    </view>

    <scroll-view class="card-list" scroll-y>
      <view class="card-wrapper">
        <view class="talent-card" v-for="(item, index) in filteredList" :key="index" @click="goUserProfile(item)">
          <view class="avatar"></view>
          <view class="name">{{ item.name }}</view>
          <view class="tag-group">
            <view class="tag" v-for="(tag, i) in item.tags" :key="i">{{ tag }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="add-btn" @click="openAddModal">
      <text class="btn-text">{{ hasMyCard ? '编辑我的卡片' : '添加我的卡片' }}</text>
    </view>

    <view class="add-modal" v-if="showAddModal" @click.self="closeAddModal">
      <view class="modal-card">
        <view class="modal-header">
          <view class="cancel" @click="closeAddModal">取消</view>
          <view class="title">{{ hasMyCard ? '编辑我的卡片' : '添加我的卡片' }}</view>
          <view class="confirm" @click="submitCard">确认上传</view>
        </view>
        
        <view class="form-item">
          <view class="avatar-row">
            <view class="avatar-big"></view>
            <input class="input" v-model="form.name" placeholder="请输入昵称" />
          </view>
        </view>
        <view class="form-item"><input class="input" v-model="form.major" placeholder="专业（必填）" /></view>
        <view class="form-item"><input class="input" v-model="form.grade" placeholder="年级（必填）" /></view>
        
        <view class="form-item">
          <view class="label">技术栈</view>
          <view class="tag-list">
            <view class="tag-option" :class="{select: form.tags.includes(t)}" v-for="t in allTags" :key="t" @click="toggleTag(t)">
              {{ t }}
            </view>
          </view>
        </view>

        <view class="form-item"><textarea class="textarea" v-model="form.intro" placeholder="自我介绍（必填）"></textarea></view>
        <view class="form-item"><textarea class="textarea" v-model="form.interest" placeholder="感兴趣方向（选填）"></textarea></view>

        <view class="form-item">
          <view class="upload" @click="uploadResume">
            <text>上传简历（图片/文件，选填）</text>
          </view>
        </view>
      </view>
    </view>

    <view class="search-modal" v-if="showSearchModal" @click.self="closeSearchModal">
      <view class="search-card">
        <view class="search-header">
          <view class="cancel-btn" @click="closeSearchModal">取消</view>
          <input class="search-input-full" v-model="searchKeyword" placeholder="搜索人才" @confirm="onSearch" autofocus />
          <view class="confirm-btn" @click="onSearch">搜索</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      showSearchModal: false,
      showAddModal: false,
      hasMyCard: false,
      form: { name: '', major: '', grade: '', tags: [], intro: '', interest: '', resume: '' },
      allTags: ['前端', '后端', '产品', 'AI', 'Java', 'Vue', '小程序', '设计'],
      talentList: [
        { id: 1, name: '李同学', tags: ['前端', 'Vue'], major: '计算机', grade: '大二', intro: '擅长小程序', interest: '互联网+', resume: '' },
        { id: 2, name: '张同学', tags: ['后端', 'Java'], major: '软工', grade: '大三', intro: '接口开发', interest: '大创', resume: '' },
        { id: 3, name: '王同学', tags: ['产品', '设计'], major: '数媒', grade: '大四', intro: '产品策划', interest: '', resume: '' }
      ]
    }
  },
  computed: {
    filteredList() {
      if (!this.searchKeyword) return this.talentList
      const k = this.searchKeyword.toLowerCase()
      return this.talentList.filter(item => 
        item.name.toLowerCase().includes(k) || item.tags.some(t => t.toLowerCase().includes(k))
      )
    }
  },
  onLoad() {
    const my = uni.getStorageSync('myCard')
    if (my) {
      this.hasMyCard = true
      const exist = this.talentList.find(i => i.id === 999)
      if (!exist) this.talentList.unshift({ ...my, id: 999 })
    }
  },
  methods: {
    goSearch() { this.showSearchModal = true },
    closeSearchModal() { this.showSearchModal = false },
    onSearch() { this.closeSearchModal() },
    openAddModal() {
      const my = uni.getStorageSync('myCard')
      if (my) this.form = { ...my }
      this.showAddModal = true
    },
    closeAddModal() { this.showAddModal = false },
    toggleTag(tag) {
      const i = this.form.tags.indexOf(tag)
      i > -1 ? this.form.tags.splice(i, 1) : this.form.tags.push(tag)
    },
    uploadResume() {
      uni.chooseMessageFile({
        count: 1, type: 'all',
        success: (res) => {
          this.form.resume = res.tempFiles[0].path
          uni.showToast({ title: '已选：' + res.tempFiles[0].name, icon: 'success' })
        },
        fail: () => {
          uni.chooseMedia({
            count: 1, mediaType: ['image'],
            success: (res) => {
              this.form.resume = res.tempFiles[0].tempFilePath
              uni.showToast({ title: '已选图片', icon: 'success' })
            }
          })
        }
      })
    },
    submitCard() {
      const { name, major, grade, tags, intro } = this.form
      if (!name || !major || !grade || !tags.length || !intro) {
        uni.showToast({ title: '请填必填项', icon: 'none' })
        return
      }
      const myCard = { ...this.form }
      uni.setStorageSync('myCard', myCard)
      const idx = this.talentList.findIndex(i => i.id === 999)
      if (idx > -1) this.talentList.splice(idx, 1)
      this.talentList.unshift({ ...myCard, id: 999 })
      this.hasMyCard = true
      this.closeAddModal()
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    goUserProfile(user) {
      try {
        const str = encodeURIComponent(JSON.stringify(user))
        uni.navigateTo({ url: `/pages/community/userprofile?user=${str}` })
      } catch (e) {
        uni.showToast({ title: '跳转失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.container { height: 100vh; background: #f5f7fa; }
.nav-bar { display: flex; justify-content: space-between; align-items: center; padding: 25rpx 30rpx; background: #fff; }
.page-title { font-size: 36rpx; font-weight: bold; }
.search-box { position: relative; width: 280rpx; }
.search-input { height: 64rpx; border-radius: 32rpx; background: #f2f3f5; padding: 0 30rpx 0 60rpx; font-size: 28rpx; }
.search-icon { position: absolute; left: 20rpx; top: 50%; transform: translateY(-50%); }
.card-list { padding: 20rpx; flex: 1; }
.card-wrapper { display: flex; flex-wrap: wrap; gap: 20rpx; }
.talent-card { width: 335rpx; background: #fff; border-radius: 20rpx; padding: 30rpx; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.avatar { width: 70rpx; height: 70rpx; border-radius: 50%; background: #007aff; margin-bottom: 15rpx; }
.name { font-size: 32rpx; font-weight: bold; margin-bottom: 15rpx; }
.tag-group { display: flex; flex-wrap: wrap; gap: 10rpx; justify-content: center; }
.tag { font-size: 22rpx; padding: 6rpx 12rpx; background: #e6f2ff; color: #007aff; border-radius: 10rpx; }
.add-btn { position: fixed; bottom: 100rpx; left: 50%; transform: translateX(-50%); width: 380rpx; height: 80rpx; background: #007aff; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 30rpx; z-index: 99; }
.add-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { width: 90%; max-height: 85vh; background: #fff; border-radius: 20rpx; padding: 30rpx; box-sizing: border-box; }
.modal-header { display: flex; justify-content: space-between; padding-bottom: 20rpx; margin-bottom: 20rpx; border-bottom: 1rpx solid #eee; }
.cancel, .confirm { color: #007aff; font-size: 30rpx; }
.title { font-size: 34rpx; font-weight: bold; }
.form-item { margin-bottom: 25rpx; }
.avatar-row { display: flex; align-items: center; gap: 20rpx; }
.avatar-big { width: 80rpx; height: 80rpx; border-radius: 50%; background: #007aff; }
.input { border: 1rpx solid #eee; height: 70rpx; border-radius: 10rpx; padding: 0 20rpx; font-size: 28rpx; flex: 1; }
.textarea { border: 1rpx solid #eee; height: 120rpx; border-radius: 10rpx; padding: 20rpx; font-size: 28rpx; }
.tag-list { display: flex; flex-wrap: wrap; gap: 15rpx; }
.tag-option { padding: 10rpx 18rpx; background: #f2f3f5; border-radius: 20rpx; font-size: 26rpx; }
.tag-option.select { background: #007aff; color: #fff; }
.upload { padding: 20rpx; border: 1rpx dashed #ccc; border-radius: 10rpx; text-align: center; color: #666; }
.search-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #fff; z-index: 999; }
.search-header { display: flex; align-items: center; padding: 20rpx 30rpx; gap: 20rpx; border-bottom: 1rpx solid #eee; }
.search-input-full { flex: 1; height: 64rpx; border-radius: 32rpx; background: #f2f3f5; padding: 0 30rpx; }
.confirm-btn, .cancel-btn { color: #007aff; }
</style>
