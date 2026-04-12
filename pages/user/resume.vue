<template>
  <view class="user-page">
    <view class="card section-card resume-card">
      <view class="resume-toolbar">
        <view class="resume-toolbar-text">
          <text class="resume-toolbar-line">{{ resumeToolbarTitle }}</text>
        </view>
        <view class="resume-upload-pill" :class="{ disabled: resumeUploading }" @tap="onUploadResume">
          <text class="resume-upload-plus">＋</text>
          <text class="resume-upload-txt">{{ resumeUploading ? '上传中' : '上传' }}</text>
        </view>
      </view>

      <view v-if="resumeLoading" class="resume-state">
        <text class="resume-state-text">加载中…</text>
      </view>
      <view v-else-if="!resumeList.length" class="resume-state resume-state--empty">
        <text class="resume-state-text">暂无附件，点右侧「上传」</text>
      </view>
      <view v-else class="resume-list">
        <view
          v-for="(f, ri) in resumeList"
          :key="f.fileId || ri"
          class="resume-file-card"
        >
          <view class="resume-file-icon">{{ resumeBadgeText(f) }}</view>
          <view class="resume-file-body" @tap="onOpenResume(f)">
            <text class="resume-file-name">{{ f.fileName || '未命名文件' }}</text>
            <text class="resume-file-meta">{{ formatResumeTime(f.createdTime) }} · {{ formatResumeSize(f.fileSize) }}</text>
          </view>
          <view class="resume-file-actions">
            <text class="resume-action-btn" @tap.stop="onOpenResume(f)">打开</text>
            <text class="resume-action-btn danger" @tap.stop="onDeleteResume(f)">删除</text>
          </view>
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
      resumeList: [],
      resumeLoading: false,
      resumeUploading: false
    }
  },
  computed: {
    resumeToolbarTitle() {
      if (this.resumeLoading) return '同步中…'
      const n = this.resumeList.length
      if (n === 0) return 'PDF / Word · 投递时可复用'
      return `共 ${n} 份 · 默认复用最新一份`
    }
  },
  async onShow() {
    const token = uni.getStorageSync('access-token')
    if (!token) {
      this.resumeList = []
      return
    }
    try {
      await this.loadResumeList()
    } catch (e) {
      console.error('简历列表加载失败', e)
    }
  },
  methods: {
    normalizeUploadedFiles(res) {
      const d = res?.data
      if (Array.isArray(d)) return d
      if (d && Array.isArray(d.list)) return d.list
      if (d && Array.isArray(d.records)) return d.records
      return []
    },

    syncApplyResumeCache(list) {
      if (!Array.isArray(list) || !list.length) {
        uni.removeStorageSync('userApplyResume')
        return
      }
      const latest = list[0]
      uni.setStorageSync('userApplyResume', {
        fileId: latest.fileId,
        fileName: latest.fileName || '',
        fileUrl: latest.fileUrl || ''
      })
    },

    async loadResumeList() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        this.resumeList = []
        return
      }
      this.resumeLoading = true
      try {
        const res = await api.getMyUploadedFiles({ targetType: 1, page: 1, size: 50 })
        const arr = this.normalizeUploadedFiles(res)
        this.resumeList = arr
        this.syncApplyResumeCache(arr)
      } catch (e) {
        console.error('加载简历列表失败', e)
        this.resumeList = []
      } finally {
        this.resumeLoading = false
      }
    },

    async pickResumeFilePath() {
      return new Promise((resolve, reject) => {
        if (typeof uni.chooseMessageFile === 'function') {
          uni.chooseMessageFile({
            count: 1,
            type: 'file',
            success: (res) => {
              const f = res?.tempFiles?.[0]
              resolve(f?.path || f?.tempFilePath || '')
            },
            fail: (e) => {
              if (String(e?.errMsg || '').includes('cancel')) resolve('')
              else reject(e)
            }
          })
          return
        }
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (r) => resolve(r?.tempFilePaths?.[0] || ''),
          fail: (e) => {
            if (String(e?.errMsg || '').includes('cancel')) resolve('')
            else reject(e)
          }
        })
      })
    },

    async onUploadResume() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }
      if (this.resumeUploading) return
      try {
        const filePath = await this.pickResumeFilePath()
        if (!filePath) return
        this.resumeUploading = true
        uni.showLoading({ title: '上传中…' })
        const uploadRes = await api.uploadFile({ filePath, targetType: 1, isTemp: false })
        const file = uploadRes?.data
        if (!file?.fileId) {
          uni.showToast({ title: '上传失败', icon: 'none' })
          return
        }
        await this.loadResumeList()
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (e) {
        console.error(e)
        uni.showToast({ title: e?.data?.message || e?.message || '上传失败', icon: 'none' })
      } finally {
        this.resumeUploading = false
        uni.hideLoading()
      }
    },

    formatResumeTime(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
      const y = d.getFullYear()
      const m = `${d.getMonth() + 1}`.padStart(2, '0')
      const day = `${d.getDate()}`.padStart(2, '0')
      return `${y}-${m}-${day}`
    },

    formatResumeSize(n) {
      const v = Number(n)
      if (!Number.isFinite(v) || v <= 0) return ''
      if (v < 1024) return `${v} B`
      if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
      return `${(v / 1024 / 1024).toFixed(1)} MB`
    },

    resumeBadgeText(f) {
      const ext = String(f?.fileExtension || '')
        .replace(/^\./, '')
        .toUpperCase()
      if (ext) return ext.length > 4 ? ext.slice(0, 4) : ext
      const name = String(f?.fileName || '')
      const m = name.match(/\.([a-zA-Z0-9]+)$/)
      if (m) {
        const e = m[1].toUpperCase()
        return e.length > 4 ? e.slice(0, 4) : e
      }
      return 'CV'
    },

    async onOpenResume(item) {
      let url = item?.fileUrl
      if (!url && item?.fileId) {
        try {
          const res = await api.getFileInfo(item.fileId)
          url = res?.data?.fileUrl
        } catch (e) {
          console.error(e)
        }
      }
      if (!url) {
        uni.showToast({ title: '暂无可预览链接', icon: 'none' })
        return
      }
      uni.showActionSheet({
        itemList: ['复制文件链接', '下载并打开'],
        success: (tap) => {
          if (tap.tapIndex === 0) {
            uni.setClipboardData({ data: url })
            uni.showToast({ title: '已复制', icon: 'none' })
            return
          }
          uni.downloadFile({
            url,
            success: (dr) => {
              if (dr.statusCode === 200 && dr.tempFilePath) {
                uni.openDocument({
                  filePath: dr.tempFilePath,
                  fail: () => {
                    uni.showToast({ title: '无法打开该类型', icon: 'none' })
                  }
                })
              } else {
                uni.showToast({ title: '下载失败', icon: 'none' })
              }
            },
            fail: () => {
              uni.showToast({ title: '下载失败', icon: 'none' })
            }
          })
        }
      })
    },

    onDeleteResume(item) {
      if (!item?.fileId) return
      uni.showModal({
        title: '删除简历',
        content: `确定删除「${item.fileName || '该文件'}」？`,
        success: async (res) => {
          if (!res.confirm) return
          try {
            await api.deleteFile(item.fileId)
            uni.showToast({ title: '已删除', icon: 'success' })
            await this.loadResumeList()
          } catch (e) {
            uni.showToast({ title: e?.data?.message || e?.message || '删除失败', icon: 'none' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-page {
  padding: 32rpx;
  background-color: #f5f7fb;
  min-height: 100vh;
  box-sizing: border-box;
}

.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-card {
  padding-top: 20rpx;
  padding-bottom: 20rpx;
}

.resume-card {
  .resume-toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 8rpx 0 20rpx;
  }

  .resume-toolbar-text {
    flex: 1;
    min-width: 0;
  }

  .resume-toolbar-line {
    font-size: 24rpx;
    color: #64748b;
    line-height: 1.45;
  }

  .resume-upload-pill {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6rpx;
    padding: 12rpx 28rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #eef3ff 0%, #e8edff 100%);
    border: 1rpx solid rgba(53, 90, 201, 0.35);
  }

  .resume-upload-pill.disabled {
    opacity: 0.55;
  }

  .resume-upload-plus {
    font-size: 28rpx;
    color: #355ac9;
    font-weight: 600;
    line-height: 1;
  }

  .resume-upload-txt {
    font-size: 26rpx;
    color: #355ac9;
    font-weight: 600;
  }

  .resume-state {
    padding: 32rpx 16rpx 8rpx;
    text-align: center;
  }

  .resume-state--empty {
    padding-top: 24rpx;
    padding-bottom: 16rpx;
  }

  .resume-state-text {
    font-size: 24rpx;
    color: #94a3b8;
  }

  .resume-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .resume-file-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20rpx;
    padding: 22rpx 22rpx 22rpx 20rpx;
    background: #f8fafc;
    border-radius: 20rpx;
    border: 1rpx solid #e8edf5;
  }

  .resume-file-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
    background: linear-gradient(145deg, #355ac9 0%, #4a6fd8 100%);
    color: #fff;
    font-size: 20rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: -0.02em;
  }

  .resume-file-body {
    flex: 1;
    min-width: 0;
  }

  .resume-file-name {
    display: block;
    font-size: 28rpx;
    color: #1e293b;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .resume-file-meta {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #94a3b8;
  }

  .resume-file-actions {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20rpx;
  }

  .resume-action-btn {
    font-size: 24rpx;
    color: #355ac9;
    padding: 4rpx 8rpx;
  }

  .resume-action-btn.danger {
    color: #ef4444;
  }
}
</style>
