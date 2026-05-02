<template>
  <view class="page">
    <scroll-view scroll-y class="scroll">
      <!-- 顶部信息卡片 -->
      <view class="card info-card">
        <view class="left"><view class="avatar"></view></view>
        <view class="right">
          <view class="name">{{ user.displayName || user.name || '加载中...' }}</view>
          <view class="row">{{ user.major }} · {{ user.grade }}</view>
          <view class="tag-group">
            <view class="tag" v-for="(t,i) in user.tags" :key="i">{{ t }}</view>
          </view>
          <!-- 新增：浏览量和邀请量 -->
          <view class="stats-row">
            <text class="stat-item">👁️ {{ user.viewCount || 0 }} 浏览</text>
            <text class="stat-divider">|</text>
            <text class="stat-item">📩 {{ user.inviteCount || 0 }} 邀请</text>
          </view>
        </view>
      </view>

      <!-- 卡片标题/求职意向 -->
      <view class="card" v-if="user.cardTitle">
        <view class="card-title">求职意向</view>
        <view class="text highlight">{{ user.cardTitle }}</view>
      </view>

      <!-- 自我介绍 (用户说用 selfStatement) -->
      <view class="card" v-if="user.selfStatement">
        <view class="card-title">自我介绍</view>
        <view class="text">{{ user.selfStatement }}</view>
      </view>

      <!-- 目标方向 -->
      <view class="card" v-if="user.targetDirection">
        <view class="card-title">目标方向</view>
        <view class="text">{{ user.targetDirection }}</view>
      </view>

      <!-- 期望比赛 -->
      <view class="card" v-if="user.expectedCompetition">
        <view class="card-title">期望比赛</view>
        <view class="text">{{ user.expectedCompetition }}</view>
      </view>

      <!-- 期望角色 -->
      <view class="card" v-if="user.expectedRole">
        <view class="card-title">期望角色</view>
        <view class="text">{{ user.expectedRole }}</view>
      </view>

      <!-- GitHub 链接 -->
      <view class="card" v-if="user.githubUrl">
        <view class="card-title">GitHub</view>
        <view class="link" @click="openLink(user.githubUrl)">{{ user.githubUrl }}</view>
      </view>

      <!-- 作品集链接 -->
      <view class="card" v-if="user.portfolioUrl">
        <view class="card-title">作品集</view>
        <view class="link" @click="openLink(user.portfolioUrl)">{{ user.portfolioUrl }}</view>
      </view>
    </scroll-view>

    <!-- 底部按钮区域 -->
    <view class="action-bar">
      <view class="resume-btn" v-if="user.resumeUrl" @click="previewResume">查看简历</view>
      <view class="invite-btn" @click="openInviteModal" v-if="!isMySelf">立即邀请</view>
    </view>

    <!-- 邀请浮窗 (保持原样) -->
    <view class="modal-mask" v-if="showInviteModal" @click="closeInviteModal">
      <view class="invite-modal" @click.stop>
        <view class="modal-header">
          <view class="title">发送项目邀请</view>
          <view class="close" @click="closeInviteModal">✕</view>
        </view>
        
        <view class="modal-body">
          <!-- 项目选择下拉框 -->
          <!-- 项目选择下拉框 -->
          <view class="form-group">
            <text class="label">选择项目 <text class="required">*</text></text>
            
            <view class="select-wrapper" @click="toggleProjectDropdown">
              <view class="select-display">
                <view class="placeholder" v-if="!selectedProject && !hasManualInput">请选择项目...</view>
                
                <view v-else>
                  <!-- 显示选中的项目名称 -->
                  <view class="selected-tag" v-if="selectedProject">
                    {{ selectedProject.name }}
                    <text class="remove-icon" @click.stop="clearSelectedProject">✕</text>
                  </view>
          
                  <!-- 显示手动输入的项目名 -->
                  <view class="selected-tag custom" v-if="hasManualInput">
                    {{ customProjectName || '手动输入项目' }}
                    <text class="remove-icon" @click.stop="clearCustomProject">✕</text>
                  </view>
                </view>
          
                <view class="arrow" :class="{ up: showProjectDropdown }">▼</view>
              </view>
              
              <view class="dropdown-list" v-if="showProjectDropdown">
                <scroll-view scroll-y style="max-height: 300rpx;">
                  <view 
                    class="dropdown-item" 
                    v-for="proj in myProjects" 
                    :key="proj.projectId"
                    @click.stop="selectProject(proj)"
                  >
                    {{ proj.name }}
                  </view>
          
                  <view class="divider-line" v-if="myProjects.length"></view>
          
                  <view class="dropdown-item manual-input-item" @click.stop="selectManualInput">
                    手动填写项目名称
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>
		  
		  
		  
		  

          <!-- 手动输入项目名称的输入框 -->
          <view class="form-group" v-if="hasManualInput">
            <text class="label">手动输入项目名称 <text class="required">*</text></text>
            <input 
              class="input" 
              v-model="customProjectName" 
              @blur="onCustomProjectBlur"
              placeholder="请输入项目名称"
            />
          </view>

          <!-- 担任角色输入框 -->
          <view class="form-group">
            <text class="label">担任角色 <text class="required">*</text></text>
            <input 
              class="input" 
              v-model="inviteData.projectRole" 
              placeholder="例如：后端开发、UI设计"
            />
          </view>

          <!-- 邀请附言输入框 -->
          <view class="form-group">
            <text class="label">邀请附言</text>
            <textarea 
              class="textarea" 
              v-model="inviteData.invitationMessage" 
              placeholder="对TA说点什么..."
              maxlength="200"
            ></textarea>
          </view>

          <!-- 联系方式输入框 -->
          <view class="form-group">
            <text class="label">联系方式</text>
            <view class="contact-input-wrapper">
              <input 
                class="input" 
                v-model="inviteData.contactInfo" 
                placeholder="请输入微信号或其他联系方式"
              />
              <view class="quick-fill-btn" @click="fillWechat">填入微信</view>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <view class="btn cancel" @click="closeInviteModal">取消</view>
          <view class="btn confirm" @click="confirmSendInvite" :disabled="!canSubmit">确认发送</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/common/api/index.js'

export default {
  data() {
    return {
      user: {},
      showInviteModal: false,
      showProjectDropdown: false,
      myProjects: [],
      selectedProject: null, // 单选项目（修复显示用）
      hasManualInput: false,
      customProjectName: '',
      inviteData: {
        talentCardId: 0,
        projectId: null,
        projectIds: [],
        projectRole: '',
        invitationMessage: '',
        contactInfo: '',
        hasManualInput: false
      },
      presetWechat: 'your_wechat_id_here',
      isMySelf: false // 标记：是否是自己的卡片
    }
  },
  onLoad(options) {
    const cardId = options.cardId
    if (!cardId) {
      uni.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
      return
    }
    this.inviteData.talentCardId = parseInt(cardId)
    this.loadUserDetail(cardId)
  },
  computed: {
    canSubmit() {
      const hasProject = this.selectedProject || (this.hasManualInput && this.customProjectName.trim())
      return hasProject && this.inviteData.projectRole.trim()
    }
  },
  methods: {
    async loadUserDetail(cardId) {
      uni.showLoading({ title: '加载中...' })
      try {
        const res = await api.getTalentCardDetail(cardId)
        if (res && res.code === 200 && res.data) {
          this.user = {
            ...res.data,
            name: res.data.displayName || res.data.name,
            tags: res.data.skillTags ? res.data.skillTags.split(',').map(t => t.trim()).filter(t => t) : []
          }

          // ======================
          // 关键：判断是不是自己
          // ======================
          this.checkIsMySelf(cardId)

          uni.setNavigationBarTitle({ title: this.user.displayName || this.user.name || '人才详情' })
        }
      } catch (e) {
        console.error('详情接口错误：', e)
      } finally {
        uni.hideLoading()
      }
    },

    // ======================
    // 判断是否是自己的卡片
    // ======================
    async checkIsMySelf(cardId) {
      try {
        const myRes = await api.getMyTalentCard()
        if (myRes.code === 200 && myRes.data) {
          const myCardId = myRes.data.cardId
          this.isMySelf = (myCardId == cardId)
        }
      } catch (e) {
        this.isMySelf = false
      }
    },

    async loadMyProjects() {
      uni.showLoading({ title: '加载项目列表...' })
      try {
        const response = await api.getMyPublishedProjects({ page: 1, size: 100 })
        if (response.code === 200) {
          this.myProjects = response.data || []
        }
      } catch (error) {
        console.error('加载项目失败', error)
      } finally {
        uni.hideLoading()
      }
    },

    // ======================
    // 选择项目（单选，修复显示）
    // ======================
    selectProject(project) {
      this.selectedProject = project
      this.inviteData.projectId = project.projectId
      this.inviteData.projectIds = [project.projectId]
      this.hasManualInput = false
      this.inviteData.hasManualInput = false
      this.customProjectName = ''
      this.showProjectDropdown = false
    },

    // 手动输入
    selectManualInput() {
      this.hasManualInput = true
      this.inviteData.hasManualInput = true
      this.selectedProject = null
      this.inviteData.projectId = null
      this.inviteData.projectIds = []
      this.showProjectDropdown = false
    },

    // 清空选择
    clearSelectedProject() {
      this.selectedProject = null
      this.inviteData.projectId = null
      this.inviteData.projectIds = []
    },

    clearCustomProject() {
      this.hasManualInput = false
      this.inviteData.hasManualInput = false
      this.customProjectName = ''
    },

    toggleProjectDropdown() {
      this.showProjectDropdown = !this.showProjectDropdown
    },

    async openInviteModal() {
      if (this.isMySelf) return // 自己不能邀请自己

      this.selectedProject = null
      this.hasManualInput = false
      this.customProjectName = ''
      this.inviteData = {
        talentCardId: this.inviteData.talentCardId,
        projectId: null,
        projectIds: [],
        projectRole: '',
        invitationMessage: '',
        contactInfo: '',
        hasManualInput: false
      }
      await this.loadMyProjects()
      this.showInviteModal = true
    },

    closeInviteModal() {
      this.showInviteModal = false
      this.showProjectDropdown = false
    },

    fillWechat() {
      this.inviteData.contactInfo = this.presetWechat
    },

    async confirmSendInvite() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请选择项目并填写角色', icon: 'none' })
        return
      }

      uni.showLoading({ title: '发送中...' })

      const payload = {
        talentCardId: this.inviteData.talentCardId,
        projectRole: this.inviteData.projectRole,
        invitationMessage: this.inviteData.invitationMessage,
        contactInfo: this.inviteData.contactInfo,
        hasManualInput: this.hasManualInput
      }

      if (this.hasManualInput) {
        payload.customProjectName = this.customProjectName.trim()
      } else {
        payload.projectId = this.inviteData.projectId
        payload.projectIds = this.inviteData.projectIds
      }

      try {
        const res = await api.inviteTalent(payload)
        if (res.code === 200) {
          uni.showToast({ title: '邀请成功', icon: 'success' })
          this.closeInviteModal()
        } else {
          uni.showToast({ title: res.message || '发送失败', icon: 'none' })
        }
      } catch (err) {
        uni.showToast({ title: '发送失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    previewResume() {
      const path = this.user.resumeUrl
      if (!path) return
      if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(path)) {
        uni.previewImage({ urls: [path] })
      } else {
        uni.openDocument({ filePath: path, fail: () => uni.showToast({ title: '无法打开', icon: 'none' }) })
      }
    },

    openLink(url) {
      if (!url) return
      // #ifdef H5
      window.open(url, '_blank')
      // #endif
      // #ifndef H5
      uni.showToast({ title: '请在浏览器中打开', icon: 'none' })
      // #endif
    }
  }
}
</script>

<style scoped>
/* 原有样式保持不变... */
.page { background: #f5f7fa; min-height: 100vh; padding: 20rpx; position: relative; }
.scroll { padding-bottom: 160rpx; }
.card { background: #fff; border-radius: 24rpx; padding: 30rpx; margin-bottom: 20rpx; }
.info-card { display: flex; align-items: center; gap: 30rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: #007aff; }
.name { font-size: 38rpx; font-weight: bold; margin-bottom: 10rpx; }
.row { font-size: 28rpx; color: #666; margin-bottom: 15rpx; }
.tag-group { display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag { background: #e6f2ff; color: #007aff; padding: 8rpx 14rpx; border-radius: 12rpx; font-size: 24rpx; }
.card-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; }
.text { font-size: 28rpx; color: #333; line-height: 1.6; }

/* 底部按钮区域 */
.action-bar {
  position: fixed;
  bottom: 40rpx;
  right: 30rpx;
  display: flex;
  gap: 20rpx;
  z-index: 10;
}

.resume-btn {
  background: #fff;
  color: #007aff;
  padding: 16rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: 1rpx solid #007aff;
}

.invite-btn {
  background: #007aff;
  color: #fff;
  padding: 16rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

/* 邀请浮窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.invite-modal {
  background-color: #fff;
  border-radius: 20rpx;
  width: 85vw;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out forwards;
}

@keyframes modalSlideIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 34rpx;
  font-weight: bold;
}

.close {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
}

.form-group {
  margin-bottom: 25rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.required {
  color: #ff5a5f;
}

.input {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  height: 150rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.btn {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 32rpx;
}

.cancel {
  color: #666;
  border-right: 1rpx solid #eee;
}

.confirm {
  color: #007aff;
  font-weight: bold;
}

/* 自定义下拉选择器样式 */
.select-wrapper {
  position: relative;
  width: 100%;
}

.select-display {
  width: 100%;
  min-height: 70rpx; /* 改为最小高度，以适应多标签 */
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 8rpx;
}

.placeholder {
  color: #999;
  flex: 1;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  flex: 1;
}

.selected-tag {
  background: #e6f2ff;
  color: #007aff;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.selected-tag.custom {
  background: #fff3cd;
  color: #856404;
  border: 1rpx solid #ffeaa7;
}

.remove-icon {
  font-size: 20rpx;
  color: #999;
  cursor: pointer;
  padding: 2rpx;
}

.arrow {
  transition: transform 0.3s;
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}

.arrow.up {
  transform: rotate(180deg);
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 5rpx);
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1001;
  max-height: 300rpx;
  overflow: hidden;
}

.dropdown-item {
  padding: 20rpx;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-item.manual-input-item {
  color: #007aff;
  font-style: italic;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item.selected {
  background-color: #e6f2ff;
  color: #007aff;
}

.divider-line {
  height: 1rpx;
  background-color: #eee;
  margin: 5rpx 0;
}

.item-text {
  flex: 1;
}

.checkmark {
  color: #007aff;
  font-weight: bold;
  margin-left: 10rpx;
}

/* 联系方式输入框样式 */
.contact-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.quick-fill-btn {
  background-color: #007aff;
  color: white;
  padding: 10rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  white-space: nowrap;
}


/* 新增：统计行样式 */
.stats-row {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  gap: 10rpx;
}
.stat-item {
  font-size: 24rpx;
  color: #999;
}
.stat-divider {
  font-size: 24rpx;
  color: #ddd;
}

/* 新增：高亮文本样式 */
.highlight {
  color: #007aff;
  font-weight: 500;
}

/* 新增：链接样式 */
.link {
  color: #007aff;
  font-size: 28rpx;
  text-decoration: underline;
  word-break: break-all;
}
</style>