<template>
  <view class="container">
    <!-- 顶部搜索栏 -->
    <view class="header">
      <view class="search-bar">
        <view class="search-input-wrapper">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索人才"
            @confirm="onSearch"
            confirm-type="search"
            @focus="showSearchPanel"
          />
          <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">✕</text>
        </view>
        <view class="search-btn" @click="onSearch">搜索</view>
      </view>
      <view class="reset-btn" v-if="searchKeyword || searchResultCount > 0" @click="onReset">
        <text>重置</text>
      </view>
    </view>

    <!-- 搜索结果提示 -->
    <view class="search-tips" v-if="searchResultCount > 0">
      <text class="tips-text">找到 {{ searchResultCount }} 个相关人才</text>
    </view>

    <scroll-view class="card-list" scroll-y>
      <view class="card-wrapper">
        <view class="talent-card" v-for="(item, index) in filteredList" :key="index" @click="goUserProfile(item)">
          <view class="avatar">
            <image v-if="item.avatar" :src="item.avatar" mode="aspectFill" class="avatar-img"></image>
          </view>
          <view class="name">{{ item.displayName || '匿名用户' }}</view>
          <view class="info-row">
            <text class="info-text">{{ item.major }}</text>
            <text class="info-divider">|</text>
            <text class="info-text">{{ item.grade }}</text>
          </view>
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
          <view class="confirm" @click="submitCard">确认保存</view>
        </view>

        <view class="modal-body">
        <!-- 展示姓名 -->
        <view class="form-item">
          <view class="label">展示姓名（选填）</view>
          <input class="input" v-model="form.displayName" placeholder="例如：张同学" />
        </view>

        <!-- 卡片标题（必填） -->
        <view class="form-item">
          <view class="label">卡片标题 <text class="required">*</text></view>
          <input class="input" v-model="form.cardTitle" placeholder="例如：寻找大创队友" />
        </view>

        <!-- 期望方向（必填） -->
        <view class="form-item">
          <view class="label">期望方向 <text class="required">*</text></view>
          <input class="input" v-model="form.targetDirection" placeholder="例如：后端开发/算法/产品" />
        </view>

        <!-- 期望参赛（必填） -->
        <view class="form-item">
          <view class="label">期望参赛 <text class="required">*</text></view>
          <input class="input" v-model="form.expectedCompetition" placeholder="例如：大创/挑战杯/互联网+" />
        </view>

        <!-- 期望角色（必填） -->
        <view class="form-item">
          <view class="label">期望角色 <text class="required">*</text></view>
          <input class="input" v-model="form.expectedRole" placeholder="例如：队员/队长" />
        </view>

        <!-- 自我陈述 -->
        <view class="form-item">
          <view class="label">自我陈述</view>
          <textarea class="textarea" v-model="form.selfStatement" placeholder="介绍一下自己吧"></textarea>
        </view>

        <!-- 技术栈 -->
        <view class="form-item">
          <view class="label">技术栈</view>
          <view class="tag-list">
            <view class="tag-option" :class="{select: form.tags.includes(t)}" v-for="t in allTags" :key="t" @click="toggleTag(t)">
              {{ t }}
            </view>
          </view>
        </view>

        <!-- GitHub 地址 -->
        <view class="form-item">
          <view class="label">GitHub 地址</view>
          <input class="input" v-model="form.githubUrl" placeholder="https://github.com/username" />
        </view>

        <!-- 上传简历（暂时保留本地选择，后续对接上传接口） -->
        <view class="form-item">
          <view class="upload" @click="uploadResume">
            <block v-if="!resumeFileName">
              <text class="upload-text">📎 上传简历（选填，暂未对接上传接口）</text>
            </block>
            <block v-else>
              <view class="file-selected">
                <text class="file-icon">📄</text>
                <text class="file-name">{{ resumeFileName }}</text>
                <text class="delete-icon" @click.stop="removeResume">✕</text>
              </view>
            </block>
          </view>
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
      searchKeyword: '',
      searchResultCount: 0,
      showSearchModal: false,
      showAddModal: false,
      hasMyCard: false,
	  resumeFileName: '',
      form: {
        status: 1, 
        displayName: '',
        cardTitle: '',
        targetDirection: '',
        expectedCompetition: '',
        expectedRole: '',
        selfStatement: '',
        tags: [], // 前端用数组
        githubUrl: '',
        // 暂未对接上传接口
        resumeFileId: null,
        portfolioFileId: null
      },
      allTags: ['前端', '后端', '产品', 'AI', 'Java', 'Vue', '小程序', '设计'],
      talentList: []
    }
  },
  computed: {
    filteredList() {
      if (!this.searchKeyword) return this.talentList
      const k = this.searchKeyword.toLowerCase()
      return this.talentList.filter(item => 
        (item.displayName && item.displayName.toLowerCase().includes(k)) || 
        (item.skillTags && item.skillTags.toLowerCase().includes(k))
      )
    }
  },
  onLoad() {
	  console.log("========== onLoad 执行 ==========")
    this.loadTalentList()
    const my = uni.getStorageSync('myCard')
    if (my) {
      this.hasMyCard = true
    }
  },
  methods: {
    // 获取人才卡片列表
async loadTalentList() {
  console.log('=== 加载人才列表 ===')
  try {
    const res = await api.getTalentList({
      page: 1,
      size: 10
    })

    console.log('接口原始返回 res:', res)

    // 关键：适配后端返回结构，从 res.data.records 拿数组
    let list = []
    // 先判断返回格式正确
    if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
      list = res.data.records
    } else {
      console.warn('接口返回格式不匹配，使用空数组兜底', res)
      list = []
    }

    console.log('拿到的卡片数组 list:', list)

    // 转换 skillTags 字符串为标签数组，和页面渲染匹配
    this.talentList = list.map(item => ({
      ...item,
      tags: item.skillTags ? item.skillTags.split(',').map(t => t.trim()).filter(t => t) : []
    }))

    console.log('最终渲染用的 talentList:', this.talentList)

  } catch (e) {
    console.error('列表错误:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
},

 // 新增：调用接口获取我的人才卡片
    async loadMyTalentCard() {
      try {
        const res = await api.getMyTalentCard()
        console.log('我的人才卡片接口返回：', res)
        
        if (res && res.code === 200 && res.data) {
          this.hasMyCard = true
          // 把接口返回的数据，回填到 form 里
          this.form = {
            ...this.form, // 保留默认值
            ...res.data,
            // 把 skillTags 字符串转成数组
            tags: res.data.skillTags ? res.data.skillTags.split(',').map(t => t.trim()).filter(t => t) : []
          }
        } else {
          // 没有我的卡片，重置状态
          this.hasMyCard = false
          this.resetForm()
        }
      } catch (e) {
        console.error('获取我的卡片失败（可能还没有创建）', e)
        // 接口报错也没关系，可能是还没创建卡片
        this.hasMyCard = false
      }
    },

    // 新增：重置表单
    resetForm() {
      this.form = {
        status: 1,
        displayName: '',
        cardTitle: '',
        targetDirection: '',
        expectedCompetition: '',
        expectedRole: '',
        selfStatement: '',
        tags: [],
        githubUrl: '',
        resumeFileId: null,
        portfolioFileId: null
      }
      this.resumeFileName = ''
    },

// 修改：打开弹窗时，先获取我的卡片数据
    async openAddModal() {
      // 先重置表单
      this.resetForm()
      // 如果有我的卡片，重新获取一次最新数据
      if (this.hasMyCard) {
        await this.loadMyTalentCard()
      }
      this.showAddModal = true
    },

    showSearchPanel() {
      // 点击输入框时可以在这里做一些操作，比如显示历史搜索等
      console.log('触发搜索面板')
    },
    closeSearchModal() {
      this.showSearchModal = false
      // 如果有关键词，关闭时清空并恢复默认列表
      if (this.searchKeyword) {
        this.searchKeyword = ''
        this.searchResultCount = 0
        this.loadTalentList()
      }
    },
    clearSearch() {
      this.searchKeyword = ''
      this.searchResultCount = 0
    },
    async onSearch() {
      if (!this.searchKeyword.trim()) {
        uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
        return
      }
      uni.showLoading({ title: '搜索中...' })
      try {
        const res = await api.globalSearch({
          keyword: this.searchKeyword.trim(),
          type: 'talent',
          page: 1,
          size: 50
        })

        if (res && res.code === 200 && res.data) {
          // 处理人才列表数据
          const talents = res.data.talents || []
          this.talentList = talents.map(item => ({
            ...item,
            tags: item.skillTags
              ? item.skillTags.split(',').map(t => t.trim()).filter(t => t)
              : []
          }))
          this.searchResultCount = talents.length
          this.showSearchModal = false
          if (talents.length === 0) {
            uni.showToast({ title: '未找到相关人才', icon: 'none' })
          }
        } else {
          uni.showToast({ title: '搜索失败', icon: 'none' })
        }
      } catch (e) {
        console.error('搜索失败:', e)
        uni.showToast({ title: '搜索失败，请重试', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    async onReset() {
      this.searchKeyword = ''
      this.searchResultCount = 0
      // 重新加载默认的人才列表
      await this.loadTalentList()
      uni.showToast({ title: '已重置', icon: 'success' })
    },
    closeAddModal() { this.showAddModal = false },
    toggleTag(tag) {
      const i = this.form.tags.indexOf(tag)
      i > -1 ? this.form.tags.splice(i, 1) : this.form.tags.push(tag)
    },
    uploadResume() {
      // 1. 微信小程序端
      // #ifdef MP-WEIXIN
      uni.chooseMessageFile({
        count: 1,
        type: 'all', // 允许选择所有文件
        success: (res) => {
          const file = res.tempFiles[0];
          // 微信小程序返回的是 file.path
          this.handleFileResult(file.path, file.name);
        },
        fail: () => {
          // 如果用户取消选择文件，可以尝试备选方案（如选图片）
          this.fallbackToImagePicker();
        }
      });
      // #endif
    
      // 2. H5 和 App 端
      // #ifndef MP-WEIXIN
      uni.chooseFile({
        count: 1,
        type: 'all', // H5/App 下选择所有文件类型
        success: (res) => {
          const file = res.tempFiles[0];
		  // 1. 保存路径
		            this.form.resume = file.path || file.tempFilePath; 
		            
		            // 2. 保存文件名（用于显示）
		            this.resumeFileName = file.name; 
		            
		            uni.showToast({ title: '已选择', icon: 'success' });
          // H5/App 返回的路径通常在 tempFilePath 或 path
          const path = file.tempFilePath || file.path;
          this.handleFileResult(path, file.name);
        },
        fail: () => {
          // 如果选择文件失败（例如用户只想选图片），走备选方案
          this.fallbackToImagePicker();
        }
      });
      // #endif
    },
	
	
	// 新增：删除文件的方法
	    removeResume(e) {
	      // 阻止事件冒泡，防止点击叉号时触发外层的上传事件
	      e.stopPropagation(); 
	      
	      this.form.resume = '';
	      this.resumeFileName = '';
	      uni.showToast({ title: '已取消上传', icon: 'none' });
	    },
    
    // 备选方案：专门用于选择图片（兼容所有平台）
    fallbackToImagePicker() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // chooseImage 返回的是 tempFilePaths 数组
          const path = res.tempFilePaths[0];
          this.handleFileResult(path, '图片文件');
        }
      });
    },
    
    // 统一处理结果的方法
    handleFileResult(path, name) {
      if (path) {
        this.form.resume = path;
        uni.showToast({
          title: '已选择: ' + name,
          icon: 'none', // 使用 none 避免文字过长被截断
          duration: 2000
        });
      }
    },
	/*
    submitCard() {
      const { name, major, grade, tags, intro } = this.form
      if (!name || !major || !grade || !tags.length || !intro) {
        uni.showToast({ title: '请填必填项', icon: 'none' })
        return
      }
      const myCard = { ...this.form, cardId: 999, displayName: name }
      uni.setStorageSync('myCard', myCard)
      // 移除已有的个人卡片
      const idx = this.talentList.findIndex(i => i.cardId === 999)
      if (idx > -1) this.talentList.splice(idx, 1)
      this.talentList.unshift({ ...myCard })
      this.hasMyCard = true
      this.closeAddModal()
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
	*/
   
    async submitCard() {
         // 1. 前端校验必填项（和后端文档一致）
         if (!this.form.cardTitle || !this.form.targetDirection || 
             !this.form.expectedCompetition || !this.form.expectedRole) {
           uni.showToast({ 
             title: '请填写所有必填项', 
             icon: 'none' 
           })
           return
         }
   
         uni.showLoading({ title: '保存中...' })
         
         try {
           // 2. 构建完美适配后端文档的参数
           const payload = {
             status: this.form.status,
             cardTitle: this.form.cardTitle,
             targetDirection: this.form.targetDirection,
             expectedCompetition: this.form.expectedCompetition,
             expectedRole: this.form.expectedRole,
             // 选填项
             displayName: this.form.displayName || '',
             selfStatement: this.form.selfStatement || '',
             skillTags: this.form.tags && this.form.tags.length > 0 
               ? this.form.tags.join(',') 
               : '',
             githubUrl: this.form.githubUrl || ''
             // resumeFileId 和 portfolioFileId 暂未对接上传接口，先不传
           }
   
           console.log('保存人才卡片最终 payload：', payload)
   
           // 3. 调用接口
           const res = await api.upsertTalentCard(payload)
           console.log('保存人才卡片接口返回：', res)
   
           if (res.code === 200) {
             uni.showToast({ 
               title: '保存成功', 
               icon: 'success' 
             })
             
             // 保存成功后的操作
             this.hasMyCard = true
             this.closeAddModal()
             
             // 刷新人才列表
             await this.loadTalentList()
           } else {
             uni.showToast({ 
               title: res.message || '保存失败', 
               icon: 'none' 
             })
           }
         } catch (error) {
           console.error('保存人才卡片请求失败:', error)
           uni.showToast({ 
             title: '网络错误或请求失败', 
             icon: 'none' 
           })
         } finally {
           uni.hideLoading()
         }
       },
    
	
    goUserProfile(item) {
      try {
        // 只传 cardId
        uni.navigateTo({ 
          url: `/pages/community/userprofile?cardId=${item.cardId}` 
        })
      } catch (e) {
        uni.showToast({ title: '跳转失败', icon: 'none' })
      }
    }
	
  }
}
</script>

<style scoped>
/* ==================== 页面基础 ==================== */
.container { height: 100vh; background: #f5f7fa; }

/* ==================== 顶部搜索栏 ==================== */
.header {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  padding: 20rpx 30rpx 30rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  background: #fff;
  border-radius: 36rpx;
  padding: 0 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.search-input::placeholder {
  color: #bbb;
}

.clear-icon {
  width: 36rpx;
  height: 36rpx;
  background: #ddd;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 36rpx;
  font-size: 20rpx;
  margin-left: 12rpx;
}

.search-btn {
  flex-shrink: 0;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #4a90e2;
  background: #fff;
  border-radius: 36rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  align-self: flex-start;
}

.reset-btn:active {
  background: rgba(255, 255, 255, 0.25);
}

/* ==================== 搜索结果提示 ==================== */
.search-tips {
  background: #fff;
  padding: 16rpx 30rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.tips-text {
  font-size: 26rpx;
  color: #999;
}

/* ==================== 卡片列表 ==================== */
.card-list { padding: 20rpx; flex: 1; }
.card-wrapper { display: flex; flex-wrap: wrap; gap: 20rpx; }
.talent-card { width: 38%; background: #fff; border-radius: 20rpx; padding: 30rpx; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.avatar { width: 70rpx; height: 70rpx; border-radius: 50%; background: #007aff; margin-bottom: 15rpx; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; }
.name { font-size: 32rpx; font-weight: bold; margin-bottom: 10rpx; }
.info-row { display: flex; align-items: center; justify-content: center; margin-bottom: 10rpx; }
.info-text { font-size: 24rpx; color: #666; }
.info-divider { font-size: 24rpx; color: #ddd; margin: 0 8rpx; }
.tag-group { display: flex; flex-wrap: wrap; gap: 10rpx; justify-content: center; }
.tag { font-size: 22rpx; padding: 6rpx 12rpx; background: #e6f2ff; color: #007aff; border-radius: 10rpx; }
.add-btn { position: fixed; bottom: 150rpx; left: 50%; transform: translateX(-50%); width: 350rpx; height: 80rpx; background: #007aff; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 30rpx; z-index: 99; }
/* ==================== 模态框样式 ==================== */
.add-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-card {
  width: 100%;
  max-height: 90vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%);
  border-radius: 32rpx 32rpx 0 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f2f5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.cancel, .confirm {
  color: #666;
  font-size: 28rpx;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.cancel:active, .confirm:active {
  background: #f5f5f5;
  transform: scale(0.96);
}

.confirm {
  color: #4a90e2;
  font-weight: 600;
  background: linear-gradient(135deg, #e8f2ff 0%, #d4e6ff 100%);
}

.confirm:active {
  background: linear-gradient(135deg, #d4e6ff 0%, #c0d9ff 100%);
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* ==================== 表单样式 ==================== */
.modal-body {
  padding: 32rpx 40rpx 60rpx;
  max-height: calc(90vh - 120rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.form-item {
  margin-bottom: 36rpx;
}

.label {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.required {
  color: #ff5a5f;
  margin-left: 4rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  background: #f8f9fc;
  border: 2rpx solid transparent;
  box-sizing: border-box;
  transition: all 0.2s;
}

.input:focus {
  border-color: #4a90e2;
  background: #fff;
  box-shadow: 0 0 0 6rpx rgba(74, 144, 226, 0.1);
}

.input::placeholder {
  color: #c0c0c0;
}

.textarea {
  width: 100%;
  height: 180rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  background: #f8f9fc;
  border: 2rpx solid transparent;
  box-sizing: border-box;
  transition: all 0.2s;
  resize: none;
  line-height: 1.6;
}

.textarea:focus {
  border-color: #4a90e2;
  background: #fff;
  box-shadow: 0 0 0 6rpx rgba(74, 144, 226, 0.1);
}

.textarea::placeholder {
  color: #c0c0c0;
  line-height: 1.6;
}

/* ==================== 标签样式 ==================== */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-option {
  padding: 16rpx 24rpx;
  background: #f0f2f5;
  border-radius: 28rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.tag-option:active {
  transform: scale(0.95);
}

.tag-option.select {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
  border-color: #4a90e2;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

/* ==================== 上传区域样式 ==================== */
.upload {
  padding: 32rpx;
  border: 2rpx dashed #d0d5dd;
  border-radius: 16rpx;
  text-align: center;
  color: #666;
  background: #fafbfc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100rpx;
  transition: all 0.2s;
}

.upload:active {
  border-color: #4a90e2;
  background: #f0f7ff;
}

.upload-text {
  font-size: 28rpx;
  color: #999;
}

.file-selected {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  padding: 0 10rpx;
}

.file-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.file-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
}

.delete-icon {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5a5f 100%);
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 38rpx;
  font-size: 24rpx;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(255, 90, 95, 0.3);
}

/* ==================== 搜索组件样式 ==================== */
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-start;
  padding-top: 120rpx;
  box-sizing: border-box;
}

.search-card {
  width: 100%;
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.search-header {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  gap: 16rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f2f5;
}

.reset-btn {
  flex-shrink: 0;
  padding: 14rpx 24rpx;
  font-size: 26rpx;
  color: #999;
  background: #f5f5f5;
  border-radius: 20rpx;
  transition: all 0.2s;
}

.reset-btn:active {
  background: #e8e8e8;
  transform: scale(0.96);
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.search-icon {
  flex-shrink: 0;
  font-size: 28rpx;
  margin-right: 12rpx;
  opacity: 0.6;
}

.search-input-full {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.search-input-full::placeholder {
  color: #bbb;
}

.clear-icon {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  background: #ccc;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 36rpx;
  font-size: 20rpx;
  margin-left: 12rpx;
}

.clear-icon:active {
  background: #999;
}

.search-btn {
  flex-shrink: 0;
  padding: 14rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 20rpx;
  transition: all 0.2s;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.search-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 6rpx rgba(74, 144, 226, 0.2);
}

.search-tips {
  padding: 20rpx 30rpx;
  font-size: 24rpx;
  color: #999;
  background: #fafbfc;
  text-align: center;
  border-top: 1rpx solid #f0f2f5;
}
</style>
