<template>
  <view class="user-page">
    
    <!-- 顶部个人信息卡片 -->
    <UserInfo
      :user-info="userInfo"
      @upload-avatar="onUploadAvatar"
      @edit="goProfile"
      @show-auth="openAuthInfo"
    />

    <!-- 我的项目 -->
    <view class="card section-card">
      <view class="section-header">
        <view class="section-icon section-icon-doc"></view>
        <text class="section-title">我的项目</text>
      </view>
      <view class="divider"></view>
      <view class="section-list">
        <view class="list-item" @tap="goMyProjects('launched')">
          <view class="item-left">
            <view class="item-icon-circle">
              <text class="item-icon-text">发</text>
            </view>
            <text class="item-text">我发起的项目</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        <view class="list-item" @tap="goMyProjects('joined')">
          <view class="item-left item-left-stack">
            <view class="item-icon-circle">
              <text class="item-icon-text">队</text>
            </view>
            <view class="item-text-block">
              <text class="item-text">申请与团队</text>
              <text class="item-sub">沟通中、在队与邀请</text>
            </view>
          </view>
          <text class="item-arrow">›</text>
        </view>
        <view class="list-item" @tap="goMyProjects('draft')">
          <view class="item-left">
            <view class="item-icon-circle item-icon-lock">
              <text class="item-icon-text">草</text>
            </view>
            <text class="item-text">草稿箱</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        <view class="divider"></view>
        <view class="list-item" @tap="goMyFavorites">
          <view class="item-left">
            <view class="item-icon-circle">
              <text class="item-icon-text">藏</text>
            </view>
            <text class="item-text">我的收藏</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 我的简历 / 技能树 -->
    <SkillTags
      :skills="skills"
      @add="openSkillModal"
      @view="onViewSkill"
      @delete="onDeleteSkill" ></SkillTags>

    <!-- 系统设置 / 反馈建议 -->
    <view class="card section-card">
      <view class="section-list">
        <view class="list-item" @tap="goUserInfo">
          <view class="item-left">
            <view class="item-icon-circle item-icon-doc"></view>
            <text class="item-text">个人信息</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        <view class="divider"></view>
        <view class="list-item" @tap="goAuth">
          <view class="item-left">
            <view class="item-icon-circle item-icon-lock"></view>
            <text class="item-text">身份认证</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        <view class="divider"></view>
        <view class="list-item" @tap="goSettings">
          <view class="item-left">
            <view class="item-icon-circle item-icon-gear"></view>
            <text class="item-text">系统设置</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        <view class="divider"></view>
        <view class="list-item" @tap="goFeedback">
          <view class="item-left">
            <view class="item-icon-circle item-icon-mail"></view>
            <text class="item-text">反馈建议</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 添加技能弹窗 -->
    <view v-if="showSkillModal" class="modal-mask" @tap="closeSkillModal">
      <view class="modal-container" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加技能 / 经历</text>
          <text class="modal-close" @tap="closeSkillModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">技术栈（如Python, C++等，10字以内）</text>
            <input
              class="form-input"
              type="text"
              v-model="skillForm.stack"
              placeholder="请输入"
              maxlength="10"
            />
          </view>
          <view class="form-item">
            <text class="form-label">相关项目经历</text>
            <textarea
              class="form-textarea"
              v-model="skillForm.experience"
              placeholder="请输入"
              auto-height
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn btn-cancel" @tap="closeSkillModal">取消</button>
          <button class="btn btn-primary" @tap="confirmAddSkill">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import UserInfo from '../../components/user/UserInfo.vue'
import SkillTags from '../../components/user/SkillTags.vue'
import api from '@/common/api/index.js'
import { scheduleRelogin, shouldTriggerReloginFromError } from '@/common/http/authRedirect.js'

export default {
  components: {
    UserInfo,
    SkillTags
  },
  data() {
    return {
      // 不用写死「演示用户」：未登录/会话失效时应为空，避免被误认为 mock
      userInfo: {
        name: '',
        grade: '',
        college: '',
        avatarUrl: ''
      },
      skills: [],
      showSkillModal: false,
      skillForm: {
        stack: '',
        experience: ''
      }
    }
  },
  async onShow() {
    const token = uni.getStorageSync('access-token')
    if (!token) {
      this.applyGuestState()
      return
    }
    const cached = uni.getStorageSync('userInfo')
    if (cached && typeof cached === 'object') {
      this.applyProfileToView(cached)
    }
    try {
      const res = await api.getUserProfile()
      if (res?.data) {
        uni.setStorageSync('userInfo', res.data)
        this.applyProfileToView(res.data)
      }
    } catch (e) {
      console.error('个人中心拉取用户信息失败', e)
      this.applyGuestState()
      // 拦截器通常会处理 401；此处兜底（例如异常响应结构、或拦截器未走到）
      if (shouldTriggerReloginFromError(e)) {
        scheduleRelogin({ url: '/user/profile' }, e?.message || e?.data?.message)
      }
    }
  },
  methods: {
    applyGuestState() {
      this.userInfo = { name: '', grade: '', college: '', avatarUrl: '' }
      this.skills = []
    },

    applyProfileToView(data) {
      if (!data) return
      this.userInfo = {
        name: data.nickname || data.username || '未命名用户',
        grade: data.grade || '',
        college: data.major || '',
        avatarUrl: data.avatarFile?.fileUrl || ''
      }
    },
    onUploadAvatar() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }

      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (chooseRes) => {
          const filePath = chooseRes?.tempFilePaths?.[0]
          if (!filePath) return
          try {
            uni.showLoading({ title: '上传中' })
            const uploadRes = await api.uploadFile({ filePath, targetType: 7, isTemp: false })
            const file = uploadRes?.data
            if (!file?.fileId) {
              uni.showToast({ title: '上传失败', icon: 'none' })
              return
            }
            await api.updateUserProfile({ avatarFileId: file.fileId })

            // 刷新用户信息与头像显示
            const res = await api.getUserProfile()
            if (res?.data) {
              uni.setStorageSync('userInfo', res.data)
              this.applyProfileToView(res.data)
              if (file.fileUrl && !this.userInfo.avatarUrl) {
                this.userInfo = { ...this.userInfo, avatarUrl: file.fileUrl }
              }
            } else {
              this.userInfo = { ...this.userInfo, avatarUrl: file.fileUrl || this.userInfo.avatarUrl }
            }

            uni.showToast({ title: '头像已更新', icon: 'success' })
          } catch (e) {
            console.error('上传头像失败：', e)
            uni.showToast({ title: e?.data?.message || e?.message || '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        },
        fail: () => {
          // 用户取消不提示
        }
      })
    },
    goProfile() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },
    goUserInfo() {
      uni.navigateTo({ url: '/pages/user/info' })
    },
    goAuth() {
      uni.navigateTo({ url: '/pages/user/auth' })
    },
    openAuthInfo() {
      // 顶部卡片的认证状态按钮点击，也跳转到认证页
      this.goAuth()
    },
    openSkillModal() {
      this.skillForm.stack = ''
      this.skillForm.experience = ''
      this.showSkillModal = true
    },
    closeSkillModal() {
      this.showSkillModal = false
    },
    confirmAddSkill() {
      const name = this.skillForm.stack?.trim()
      const exp = this.skillForm.experience?.trim()
      
      if (!name) {
        uni.showToast({ title: '请填写技术栈', icon: 'none' })
        return
      }
    
      // 推入对象：包含名字 + 经历
      this.skills.push({
        name: name,
        exp: exp
      })
      
      this.closeSkillModal()
    },
    goMyProjects(type) {
      uni.navigateTo({
        url: `/pages/user/my-projects?type=${type}`
      })
    },
    goMyFavorites() {
      uni.navigateTo({
        url: '/pages/user/my-favorites'
      })
    },
    goSettings() {
  // 注释掉原来的跳转代码（不要删，等同学做好后取消注释即可）
  uni.navigateTo({
     url: '/pages/settings/settings'
  });
},
    goFeedback() {
      uni.navigateTo({
        url: `/pages/user/feedback?userName=${encodeURIComponent(this.userInfo.name)}`
      });
    },
	// 查看技能详情
	  onViewSkill({ skill, index }) {
	    uni.showModal({
	      title: '技能详情',
	      content: `技能：${skill.name}\n经历：${skill.exp || '暂无填写'}`,
	      showCancel: false
	    })
	  },
	
	  // 删除技能
	  onDeleteSkill(index) {
	    uni.showModal({
	      title: '确认删除',
	      content: '确定要删除该技能吗？',
	      success: (res) => {
	        if (res.confirm) {
	          this.skills.splice(index, 1)
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

.page-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 24rpx;
}

.card {
  background-color: #ffffff; /* 更亮的白色 */
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06); /* 更柔和的阴影 */
  margin-bottom: 24rpx;
}

.user-card {
  display: flex;
  align-items: center;
}

.user-card-left {
  margin-right: 32rpx;
}

.avatar-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid #355ac9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 24rpx;
  color: #355ac9;
}

.user-card-right {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}

.edit-icon {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.user-subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #888;
}

.auth-badge {
  margin-top: 16rpx;
  align-self: flex-start;
  padding: 0 24rpx;
  height: 48rpx; /* 固定高度 */
  border-radius: 24rpx; /* 高度的一半，保证圆角 */
  background-color: #355ac9;
  width: 180rpx;
  text-align: center;
  display: flex;
  align-items: center;    /* 垂直居中 */
  justify-content: center;/* 水平居中 */
}

.auth-badge-text {
  font-size: 22rpx;
  color: #fff;
}

.section-card {
  padding-top: 20rpx;
  padding-bottom: 20rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.section-icon-doc {
  background-color: #355ac9;
}

.section-icon-tag {
  background-color: #355ac9;
}

.section-title {
  font-size: 28rpx;
  color: #222;
}

.divider {
  height: 2rpx;
  background-color: #f0f0f5;
  margin: 12rpx 0;
}

.section-list {
  margin-top: 8rpx;
}

.list-item {
  padding: 16rpx 4rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-item.disabled {
  opacity: 0.6;
}

.item-left {
  display: flex;
  align-items: center;
}

.item-left-stack {
  align-items: flex-start;
}

.item-text-block {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.item-sub {
  font-size: 22rpx;
  color: #999;
  line-height: 1.35;
}

.item-icon-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #355ac9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.item-icon-lock {
  border-color: #999;
}

.item-icon-gear {
  background-color: #355ac9;
}

.item-icon-mail {
  background-color: #355ac9;
}

.item-icon-text {
  font-size: 22rpx;
  color: #355ac9;
}

.item-text {
  font-size: 26rpx;
  color: #333;
}

.item-arrow {
  font-size: 32rpx;
  color: #c0c0c8;
}

.timeline-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  border: 4rpx solid #e0b14a;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8rpx;
}

.skill-chip {
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

.skill-text {
  font-size: 22rpx;
  color: #355ac9;
}

.skill-actions {
  margin-top: 8rpx;
  display: flex;
}

.add-btn {
  margin-right: 16rpx;
  padding: 8rpx 22rpx;
  border-radius: 32rpx;
  border: 2rpx dashed #355ac9;
  display: flex;
  align-items: center;
}

.add-btn-plus {
  font-size: 26rpx;
  color: #355ac9;
  margin-right: 4rpx;
}

.add-btn-text {
  font-size: 22rpx;
  color: #355ac9;
}

.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-container {
  width: 80%;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.modal-title {
  font-size: 28rpx;
  color: #222;
}

.modal-close {
  font-size: 28rpx;
  color: #999;
}

.modal-body {
  margin-top: 4rpx;
}

.modal-row {
  display: flex;
  margin-bottom: 12rpx;
}

.modal-label {
  width: 160rpx;
  font-size: 24rpx;
  color: #666;
}

.modal-value {
  flex: 1;
  font-size: 24rpx;
  color: #333;
}

.form-item {
  margin-top: 16rpx;
}

.form-label {
  font-size: 24rpx;
  color: #555;
}

.form-input {
  margin-top: 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0ea;
  font-size: 24rpx;
}

.form-textarea {
  margin-top: 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0ea;
  font-size: 24rpx;
  min-height: 160rpx;
}

.modal-footer {
  margin-top: 24rpx;
  display: flex;
  justify-content: flex-end;
}

.btn {
  width: 200rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 26rpx;
  border-radius: 16rpx;
}

.btn-cancel {
  margin-right: 24rpx;
  background-color: #f3f3f7;
  color: #333;
}

.btn-primary {
  background-color: #355ac9;
  color: #fff;
}
</style>

