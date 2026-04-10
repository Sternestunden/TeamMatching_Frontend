<template>
  <view class="detail-page" :class="{ 'detail-page--no-action': hideCommunicate }">

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

      <!-- 第四行：发布人（匿名时不展示真实身份，不跳转个人页） -->
      <view class="leader-info" :class="{ disabled: project.isAnonymous }" @click="goToLeaderPage">
        <Avatar :src="project.leaderAvatar" size="48" />
        <text class="leader-name">{{ project.leaderName }}</text>
        <text v-if="!project.isAnonymous" class="arrow">></text>
      </view>
      <view v-if="project.isAnonymous && project.contactInfo" class="anon-contact">
        <text class="anon-contact-label">联系方式</text>
        <text class="anon-contact-text">{{ project.contactInfo }}</text>
      </view>

      <!-- 第五行及以后：项目详情 -->
      <view class="project-detail">
        <text class="detail-title">项目详情</text>
        <text class="detail-content-text">{{ project.detail }}</text>
      </view>

      <view v-if="project.roles && project.roles.length" class="role-section">
        <text class="detail-title">招募角色</text>
        <view v-for="(r, idx) in project.roles" :key="idx" class="role-block">
          <view class="role-line">
            <text class="role-name">{{ r.role }}</text>
            <text class="role-quota">招 {{ r.memberQuota }} 人</text>
          </view>
          <text v-if="r.recruitRequirements" class="role-req-text">{{ r.recruitRequirements }}</text>
        </view>
      </view>
    </view>

    <!-- 底部固定按钮：立即沟通（发起人查看自己的项目时不展示） -->
    <view v-if="!hideCommunicate" class="bottom-btn">
      <button class="communicate-btn" @click="handleCommunicate">立即沟通</button>
    </view>

    <!-- 统一投递表单 -->
    <view v-if="showApplyPopup" class="apply-mask" @tap="closeApplyPopup">
      <view class="apply-panel" @tap.stop>
        <view class="apply-header">
          <text class="apply-title">申请加入项目</text>
          <text class="apply-close" @tap="closeApplyPopup">✕</text>
        </view>

        <view class="apply-item">
          <text class="apply-label">申请角色</text>
          <view class="role-select-grid">
            <view
              v-for="(roleLabel, idx) in roleOptionLabels"
              :key="idx"
              class="role-select-card"
              :class="{ active: applyForm.roleIndex === idx }"
              @tap="selectApplyRole(idx)"
            >
              <text class="role-select-text">{{ roleLabel }}</text>
            </view>
          </view>
        </view>

        <view class="apply-item">
          <text class="apply-label">申请理由</text>
          <textarea
            class="apply-textarea"
            v-model="applyForm.applyReason"
            placeholder="请输入申请原因/自我介绍"
            auto-height
          />
        </view>

        <view class="apply-item">
          <text class="apply-label">上传简历和附件</text>
          <view class="apply-row">
            <switch :checked="applyForm.useProfileResume" @change="onUseProfileResumeChange" />
            <text class="apply-row-text">复用个人简历</text>
          </view>
          <text class="apply-tip">{{ profileResumeText }}</text>

          <view v-if="!applyForm.useProfileResume" class="upload-line">
            <button class="upload-btn" @tap="onUploadApplyResume">上传投递简历</button>
            <text class="upload-name">{{ applyForm.customResumeFileName || '未上传' }}</text>
            <text v-if="applyForm.customResumeFileId" class="upload-op danger" @tap="clearApplyResume">移除</text>
          </view>

          <view class="upload-line">
            <button class="upload-btn" @tap="onUploadApplyAttachment">上传其他附件</button>
            <text class="upload-name">{{ applyForm.applicationAttachmentFileName || '未上传（可选）' }}</text>
            <text v-if="applyForm.applicationAttachmentFileId" class="upload-op danger" @tap="clearApplyAttachment">移除</text>
          </view>
        </view>

        <view class="apply-summary">
          <text class="summary-title">提交内容确认</text>
          <text class="summary-item">角色：{{ roleOptionLabels[applyForm.roleIndex] || '未选择' }}</text>
          <text class="summary-item">理由：{{ applyForm.applyReason ? '已填写' : '未填写' }}</text>
          <text class="summary-item">简历：{{ applyForm.useProfileResume ? (profileResume.fileName || '复用个人简历') : (applyForm.customResumeFileName || '未上传') }}</text>
          <text class="summary-item">附件：{{ applyForm.applicationAttachmentFileName || '未上传（可选）' }}</text>
        </view>

        <view class="apply-footer">
          <button class="apply-cancel" @tap="closeApplyPopup">取消</button>
          <button class="apply-submit" :disabled="applying" @tap="submitApplyFromPopup">
            {{ applying ? '提交中...' : '提交申请' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/common/api/index.js'

export default {
  computed: {
    roleOptionLabels() {
      const roles = Array.isArray(this.project.roles) ? this.project.roles : []
      return roles.map((r, idx) => `${r.role || `角色${idx + 1}`}（剩余${this.calcRemainQuota(r)}）`)
    },
    profileResumeText() {
      if (this.profileResume.fileId) {
        return `当前可复用：${this.profileResume.fileName || '个人简历'}`
      }
      return '个人主页暂无可复用简历，可改为“上传投递简历”'
    }
  },
  data() {
    return {
      projectId: '',
      /** 从「我发起的项目」进入时为 true，不展示「立即沟通」 */
      hideCommunicate: false,
      isCollected: false,
      project: {
        id: '',
        name: '',
        require: '',
        type: '',
        leaderAvatar: '',
        leaderName: '',
        publisherUserId: '',
        detail: '',
        roles: [],
        isAnonymous: false,
        contactInfo: ''
      },
      applying: false,
      showApplyPopup: false,
      profileResume: {
        fileId: null,
        fileName: ''
      },
      applyForm: {
        roleIndex: 0,
        applyReason: '',
        useProfileResume: false,
        customResumeFileId: null,
        customResumeFileName: '',
        applicationAttachmentFileId: null,
        applicationAttachmentFileName: ''
      }
    }
  },
  onLoad(options) {
    const id = options?.projectId || options?.id
    const hc = options?.hideCommunicate
    this.hideCommunicate = hc === '1' || hc === 'true' || hc === true
    if (id) {
      this.projectId = String(id)
      this.getProjectDetailFromApi()
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  methods: {
    async getProjectDetailFromApi() {
      try {
        const res = await api.getProjectDetail(this.projectId)
        const data = res?.data
        if (data == null || data.projectId == null) {
          uni.showToast({ title: '加载失败', icon: 'none' })
          return
        }
        const pub = data.publisherInfo || {}
        const anon =
          data.isAnonymous === true ||
          data.isAnonymous === 1 ||
          data.isAnonymous === '1' ||
          data.isAnonymous === 'true'
        this.project = {
          id: data.projectId,
          name: data.name || '',
          require: data.allowCrossMajor ? '允许跨专业' : '不允许跨专业',
          type: data.belongTrack || data.projectType || '',
          leaderAvatar: anon ? '' : (pub.avatar || ''),
          leaderName: anon ? '匿名用户' : (pub.nickname || '发布者'),
          publisherUserId: anon ? '' : String(pub.userId || ''),
          detail: data.projectIntro || '',
          roles: Array.isArray(data.roleRequirements) ? data.roleRequirements : [],
          isAnonymous: anon,
          contactInfo: anon ? (data.contactInfo || '') : ''
        }
      } catch (e) {
        console.error(e)
        uni.showToast({ title: '网络异常', icon: 'none' })
      }
    },

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
      if (this.project.isAnonymous) return
      const uid = encodeURIComponent(this.project.publisherUserId || '')
      const name = encodeURIComponent(this.project.leaderName || '')
      const avatar = encodeURIComponent(this.project.leaderAvatar || '')
      uni.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${uid}&userName=${name}&avatar=${avatar}`
      });
    },
    // 立即沟通（打开统一表单）
    handleCommunicate() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }
      if (this.applying) return
      const roles = Array.isArray(this.project.roles) ? this.project.roles : []
      if (roles.length === 0) {
        uni.showToast({ title: '该项目暂无可投递角色', icon: 'none' })
        return
      }
      this.openApplyPopup()
    },

    async openApplyPopup() {
      this.applyForm.roleIndex = 0
      this.applyForm.applyReason = ''
      this.applyForm.customResumeFileId = null
      this.applyForm.customResumeFileName = ''
      this.applyForm.applicationAttachmentFileId = null
      this.applyForm.applicationAttachmentFileName = ''
      await this.ensureProfileResume()
      this.applyForm.useProfileResume = !!this.profileResume.fileId
      this.showApplyPopup = true
    },

    closeApplyPopup() {
      if (this.applying) return
      this.showApplyPopup = false
    },

    selectApplyRole(index) {
      this.applyForm.roleIndex = Number(index || 0)
    },

    onUseProfileResumeChange(e) {
      const checked = !!e?.detail?.value
      if (checked && !this.profileResume.fileId) {
        uni.showToast({ title: '暂无可复用的个人简历', icon: 'none' })
        this.applyForm.useProfileResume = false
        return
      }
      this.applyForm.useProfileResume = checked
    },

    async ensureProfileResume() {
      const localResume = uni.getStorageSync('userApplyResume') || {}
      if (localResume?.fileId) {
        this.profileResume.fileId = localResume.fileId
        this.profileResume.fileName = localResume.fileName || '我的简历'
        return
      }
      try {
        const res = await api.getMyTalentCard()
        const resume = res?.data?.resumeFile || {}
        this.profileResume.fileId = resume.fileId || null
        this.profileResume.fileName = resume.fileName || ''
      } catch (e) {
        this.profileResume.fileId = null
        this.profileResume.fileName = ''
      }
    },

    async onUploadApplyResume() {
      const file = await this.uploadOptionalFile(1, '投递简历')
      if (!file?.fileId) return
      this.applyForm.customResumeFileId = file.fileId
      this.applyForm.customResumeFileName = file.fileName || '已上传简历'
    },

    async onUploadApplyAttachment() {
      const file = await this.uploadOptionalFile(5, '其他附件')
      if (!file?.fileId) return
      this.applyForm.applicationAttachmentFileId = file.fileId
      this.applyForm.applicationAttachmentFileName = file.fileName || '已上传附件'
    },
    clearApplyResume() {
      this.applyForm.customResumeFileId = null
      this.applyForm.customResumeFileName = ''
    },
    clearApplyAttachment() {
      this.applyForm.applicationAttachmentFileId = null
      this.applyForm.applicationAttachmentFileName = ''
    },

    chooseLocalFile(label) {
      return new Promise((resolve, reject) => {
        // 小程序环境优先 chooseMessageFile，可选任意类型文件
        if (typeof uni.chooseMessageFile === 'function') {
          uni.chooseMessageFile({
            count: 1,
            type: 'file',
            success: (res) => {
              const file = res?.tempFiles?.[0]
              const filePath = file?.path || file?.tempFilePath || ''
              resolve(filePath || '')
            },
            fail: (e) => {
              if (String(e?.errMsg || '').includes('cancel')) resolve('')
              else reject(e)
            }
          })
          return
        }

        // 兜底：使用选择图片
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => resolve(res?.tempFilePaths?.[0] || ''),
          fail: (e) => {
            if (String(e?.errMsg || '').includes('cancel')) resolve('')
            else reject(e)
          }
        })
      })
    },

    async uploadOptionalFile(targetType, label) {
      const filePath = await this.chooseLocalFile(label)
      if (!filePath) {
        return null
      }
      try {
        uni.showLoading({ title: `上传${label}中...` })
        const res = await api.uploadFile({ filePath, targetType, isTemp: false })
        const file = res?.data
        const fileId = file?.fileId
        if (!fileId) {
          throw new Error(`${label}上传失败`)
        }
        uni.showToast({ title: `${label}上传成功`, icon: 'success' })
        return file
      } finally {
        uni.hideLoading()
      }
    },

    calcRemainQuota(role) {
      const quota = Number(role?.memberQuota || 0)
      const current = Number(role?.currentMembers || 0)
      const remain = quota - current
      return Number.isFinite(remain) && remain >= 0 ? remain : 0
    },

    async submitApplyFromPopup() {
      const roles = Array.isArray(this.project.roles) ? this.project.roles : []
      const selected = roles[this.applyForm.roleIndex]
      if (!selected?.requirementId) {
        uni.showToast({ title: '请选择有效角色', icon: 'none' })
        return
      }
      const applyReason = String(this.applyForm.applyReason || '').trim()
      if (!applyReason) {
        uni.showToast({ title: '请填写申请理由', icon: 'none' })
        return
      }

      let customResumeFileId = null
      if (this.applyForm.useProfileResume) {
        customResumeFileId = this.profileResume.fileId || null
      } else {
        customResumeFileId = this.applyForm.customResumeFileId || null
      }
      const applicationAttachmentFileId = this.applyForm.applicationAttachmentFileId || null

      await this.submitApply(selected.requirementId, applyReason, {
        customResumeFileId,
        applicationAttachmentFileId
      })
    },

    async submitApply(requirementId, applyReason, extra = {}) {
      this.applying = true
      try {
        const payload = {
          requirementId: Number(requirementId),
          applyReason
        }
        if (extra.customResumeFileId) payload.customResumeFileId = Number(extra.customResumeFileId)
        if (extra.applicationAttachmentFileId) payload.applicationAttachmentFileId = Number(extra.applicationAttachmentFileId)
        const res = await api.applyProject(this.projectId, payload)
        uni.showToast({
          title: res?.data?.message || '投递成功',
          icon: 'success'
        })
        this.showApplyPopup = false
      } catch (e) {
        console.error('投递失败', e)
        uni.showToast({
          title: e?.data?.message || e?.message || '投递失败',
          icon: 'none'
        })
      } finally {
        this.applying = false
      }
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

.detail-page--no-action {
  padding-bottom: 24px;
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
.leader-info.disabled {
  opacity: 0.95;
}
.anon-contact {
  margin: -12px 0 20px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}
.anon-contact-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
}
.anon-contact-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
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

.role-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.role-block {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}
.role-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.role-name {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}
.role-quota {
  font-size: 13px;
  color: #666;
}
.role-req-text {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

.apply-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}
.apply-panel {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
}
.apply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.apply-title {
  font-size: 16px;
  font-weight: 600;
  color: #111;
}
.apply-close {
  font-size: 18px;
  color: #999;
}
.apply-item {
  margin-bottom: 12px;
}
.apply-label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}
.role-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.role-select-card {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
}
.role-select-card.active {
  border-color: #1677ff;
  background: #eef5ff;
}
.role-select-text {
  font-size: 12px;
  color: #222;
  line-height: 1.4;
}
.apply-textarea {
  width: 100%;
  min-height: 90px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  box-sizing: border-box;
  font-size: 14px;
  color: #222;
}
.apply-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.apply-row-text {
  font-size: 13px;
  color: #333;
}
.apply-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}
.upload-line {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.upload-btn {
  width: 140px;
  height: 34px;
  line-height: 34px;
  border-radius: 8px;
  background: #eef5ff;
  color: #1677ff;
  font-size: 13px;
  border: 1px solid #d6e6ff;
  margin: 0;
}
.upload-name {
  flex: 1;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-op {
  font-size: 12px;
  color: #1677ff;
  padding: 4px 0;
}
.upload-op.danger {
  color: #ff4d4f;
}
.apply-summary {
  margin-top: 12px;
  border: 1px solid #e8eef9;
  background: #f8fbff;
  border-radius: 10px;
  padding: 10px;
}
.summary-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 6px;
}
.summary-item {
  display: block;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.6;
}
.apply-footer {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}
.apply-cancel,
.apply-submit {
  flex: 1;
  height: 40px;
  line-height: 40px;
  border-radius: 10px;
  font-size: 14px;
}
.apply-cancel {
  background: #f3f4f6;
  color: #333;
}
.apply-submit {
  background: #1677ff;
  color: #fff;
}
</style>