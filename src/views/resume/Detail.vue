<template>
  <div class="resume-detail-container">
    <div class="resume-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <span class="icon">←</span>
          返回
        </button>
        <h1>简历详情</h1>
        <div class="header-actions">
          <button class="mode-switch-btn" @click="goToEdit">
            编辑模式
          </button>
          <button class="export-btn" @click="exportToPDF" :disabled="exporting">
            <span v-if="exporting" class="loading-spinner"></span>
            {{ exporting ? '导出中...' : '导出PDF' }}
          </button>
          <button class="export-word-btn" @click="exportToWord" :disabled="exporting">
            <span v-if="exporting" class="loading-spinner"></span>
            {{ exporting ? '导出中...' : '导出Word' }}
          </button>
        </div>
      </div>
    </div>

    <div class="resume-content">
      <!-- 预览模式 -->
      <div class="preview-container">
        <div class="resume-preview">
          <div class="preview-header">
            <h3>简历预览</h3>
            <div class="preview-controls">
              <div class="zoom-controls">
                <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 0.5">-</button>
                <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
                <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 1.1">+</button>
                <button class="zoom-reset-btn" @click="resetZoom">重置</button>
              </div>
              <div class="template-badge">
                模板：{{ getTemplateName(resume.template_id) }}
              </div>
            </div>
          </div>
          <div class="preview-content">
            <div class="scaled-content" :style="{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'center center'
            }">
              <div id="resume-preview" class="resume-container" v-html="enhancedMarkdownPreview"></div>
            </div>
          </div>
        </div>

        <div class="resume-sidebar">
          <div class="sidebar-section">
            <h4>简历信息</h4>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatTime(resume.CreatedAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后更新：</span>
              <span class="value">{{ formatTime(resume.UpdatedAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <span class="value status-badge" :class="getStatusClass(resume.status)">
                {{ getStatusText(resume.status) }}
              </span>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>快捷操作</h4>
            <button class="action-btn primary" @click="useForInterview">
              <span class="icon">🎯</span>
              用于面试
            </button>
            <button class="action-btn secondary" @click="duplicateResume">
              <span class="icon">📋</span>
              复制简历
            </button>
            <button class="action-btn danger" 
                    @click="deleteResume"
                    :disabled="isDeleting">
              <span v-if="isDeleting" class="loading-spinner"></span>
              <span v-else class="icon">🗑️</span>
              {{ isDeleting ? '删除中...' : '删除简历' }}
            </button>
          </div>

          <div class="sidebar-section">
            <h4>相关面试</h4>
            <div v-if="relatedInterviews.length > 0">
              <div v-for="interview in relatedInterviews" :key="interview.id" class="interview-item">
                <div class="interview-header">
                  <h5>{{ interview.candidate }}</h5>
                  <span class="interview-status" :class="getInterviewStatusClass(interview.status)">
                    {{ getInterviewStatusText(interview.status) }}
                  </span>
                </div>
                <p class="interview-position">{{ interview.position }}</p>
                <p class="interview-time">{{ formatTime(interview.time) }}</p>
              </div>
            </div>
            <p v-else class="no-data">暂无相关面试</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getResumeDetail, deleteResume as deleteResumeAPI, type ResumeDetailResponse } from '@/service/resume'
import { EnhancedMarkdownParser } from '@/utils/MarkdownParser'
import { PDFExportService } from '@/services/PDFExportService'

const router = useRouter()
const route = useRoute()

// 简历数据
const resume = ref<ResumeDetailResponse>({
  ID: 0,
  CreatedAt: '',
  UpdatedAt: '',
  DeletedAt: null,
  user_id: 0,
  name: '',
  content: '',
  template_id: 1,
  status: 0
})
const relatedInterviews = ref<any[]>([])
const isDeleting = ref(false) // 添加删除状态
const exporting = ref(false) // 添加导出状态
const zoomLevel = ref(1) // 缩放级别

// 模板名称映射
const templateNames: { [key: number]: string } = {
  1: '经典模板',
  2: '现代简约',
  3: '创意设计',
  4: '专业商务'
}

const getTemplateName = (templateId: number) => {
  return templateNames[templateId] || '未知模板'
}

const getStatusClass = (status: number) => {
  const statusClasses: { [key: number]: string } = {
    0: 'status-draft',
    1: 'status-completed',
    2: 'status-published'
  }
  return statusClasses[status] || 'status-draft'
}

const getStatusText = (status: number) => {
  const statusTexts: { [key: number]: string } = {
    0: '草稿',
    1: '已完成',
    2: '已发布'
  }
  return statusTexts[status] || '草稿'
}

const getInterviewStatusClass = (status: string) => {
  const statusClasses: { [key: string]: string } = {
    planned: 'status-planned',
    interviewing: 'status-progress',
    completed: 'status-completed',
    canceled: 'status-canceled'
  }
  return statusClasses[status] || 'status-planned'
}

const getInterviewStatusText = (status: string) => {
  const statusTexts: { [key: string]: string } = {
    planned: '待开始',
    interviewing: '进行中',
    completed: '已完成',
    canceled: '已取消'
  }
  return statusTexts[status] || '待开始'
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 增强的Markdown预览
const enhancedMarkdownPreview = computed(() => {
  let content = resume.value.content || ''
  
  // 如果内容为空，显示示例内容
  if (!content.trim()) {
    content = `# 张三
男 | 25岁 | 前端开发工程师 | 本科 | 138-0000-0000 | zhangsan@example.com

## 自我评价
具有3年前端开发经验，熟练掌握Vue、React等主流框架，具备良好的团队协作能力和学习能力。

## 工作经历
::: start
**ABC科技有限公司**
**前端开发工程师**
**2021年6月 - 2024年12月**
::: end
负责公司核心产品的前端开发工作，使用Vue.js框架开发用户界面，参与产品需求分析和技术方案设计。

::: start
**XYZ互联网公司**
**前端实习生**
**2020年7月 - 2021年5月**
::: end
参与多个项目的前端开发，学习并掌握了现代前端开发技术栈。

## 项目经历
::: start
**电商管理系统**
**前端负责人**
**负责开发电商后台管理系统，包括商品管理、订单管理、用户管理等功能模块。**
**2022年3月 - 2023年8月**
::: end
使用Vue3 + TypeScript + Element Plus技术栈，实现了响应式设计和组件化开发，提升了开发效率和用户体验。

## 专业技能
- 精通：JavaScript, TypeScript, Vue.js, React
- 熟悉：Node.js, Webpack, Vite, Git
- 了解：Python, Java, 数据库设计

## 教育背景
::: start
**北京大学**
**计算机科学与技术 | 本科**
**2016年9月 - 2020年6月**
::: end
主修课程：数据结构、算法设计、软件工程、数据库原理等。`
  }
  
  return EnhancedMarkdownParser.parse(content)
})

// 跳转到编辑页面
const goToEdit = () => {
  const id = route.params.id as string
  router.push(`/resume/edit/${id}`)
}

// 缩放控制方法
const zoomIn = () => {
  if (zoomLevel.value < 1.1) {
    zoomLevel.value = Math.min(1.1, zoomLevel.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}


const goBack = () => {
  router.go(-1)
}


const useForInterview = () => {
  router.push('/interview')
}

const duplicateResume = () => {
  // 这里实现复制功能
  alert('复制功能开发中...')
}

const exportToPDF = async () => {
  exporting.value = true
  
  try {
    const filename = resume.value.name || 'resume'
    await PDFExportService.exportResumePreviewWithPuppeteer(filename)
    alert('PDF导出成功！')
  } catch (error) {
    console.error('PDF导出失败:', error)
    alert('PDF导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const exportToWord = async () => {
  exporting.value = true
  
  try {
    const filename = resume.value.name || 'resume'
    await PDFExportService.exportResumePreviewToWord(filename)
    alert('Word导出成功！')
  } catch (error) {
    console.error('Word导出失败:', error)
    alert('Word导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const deleteResume = async () => {
  if (isDeleting.value) {
    return
  }
  isDeleting.value = true

  if (!confirm('确定要删除这份简历吗？此操作不可恢复。')) {
    isDeleting.value = false
    return
  }

  try {
    const response = await deleteResumeAPI(parseInt(route.params.id as string))
    
    // DELETE请求可能没有返回数据，或者返回空对象
    if (response && (response.data?.code === 1000 || response.status === 200)) {
      alert('简历删除成功')
      router.push('/resume')
    } else {
      alert('简历删除失败，请重试')
    }
  } catch (error) {
    console.error('删除简历失败:', error)
    alert('删除简历失败，请重试')
  } finally {
    isDeleting.value = false
  }
}

const loadResumeDetail = async () => {
  try {
    const response = await getResumeDetail(route.params.id as string)
    console.log('API响应:', response) // 添加调试信息
    
    // API返回格式：{ code: 1000, msg: "success", data: {...} }
    if (response.data.code === 1000) {
      resume.value = response.data.data
      console.log('简历数据加载成功:', resume.value)
    } else {
      console.error('获取简历详情失败:', response.data.msg)
      alert('获取简历详情失败，请重试')
    }
  } catch (error) {
    console.error('获取简历详情失败:', error)
    // 使用模拟数据
    resume.value = {
      ID: parseInt(route.params.id as string),
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      DeletedAt: null,
      user_id: 0, // 使用默认值，而不是route.params.id
      name: '软件工程师简历',
      content: `# 张三
男 ｜ 28岁 ｜ 软件工程师 ｜ 本科 ｜ 13800138000 ｜ zhangsan@example.com

## 自我评价
5年Java开发经验，熟悉微服务架构，有大型项目经验，具备良好的团队协作能力和问题解决能力。

## 工作经历

::: start
**腾讯科技**

:::
**高级软件工程师**

:::
**2020-2022**

::: end
负责微信支付系统的开发和维护

::: start
**阿里巴巴**

:::
**软件工程师**

:::
**2018-2020**

::: end
参与电商平台的开发

## 项目经历

::: start
**微信支付系统**

:::
**微服务架构**

:::
**2020-2022**

::: end
负责支付核心模块的设计和实现

::: start
**电商平台**

:::
**React+Node.js**

:::
**2018-2020**

::: end
参与用户端和商家端的开发

## 专业技能
Java, Spring Boot, MySQL, Redis, Docker, Kubernetes, 微服务架构

## 目标职位
高级软件工程师

## 获奖情况
优秀员工奖`,
      template_id: 1,
      status: 1
    }
    console.log('使用模拟数据:', resume.value)
  }
}

const loadRelatedInterviews = async () => {
  try {
    // 这里应该调用API获取相关面试
    // const response = await getRelatedInterviews(route.params.id)
    // relatedInterviews.value = response.data
    
    // 使用模拟数据
    relatedInterviews.value = [
      {
        id: 1,
        candidate: '张三',
        position: '高级软件工程师',
        status: 'completed',
        time: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('获取相关面试失败:', error)
  }
}

onMounted(() => {
  loadResumeDetail()
  loadRelatedInterviews()
})
</script>

<style scoped>
.resume-detail-container {
  min-height: 100vh;
  background: #F8FAFC;
}

.resume-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 1rem 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: #F3F4F6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #E5E7EB;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.mode-switch-btn, .export-btn, .export-word-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.mode-switch-btn {
  background: #FEF3C7;
  color: #D97706;
}

.mode-switch-btn:hover {
  background: #FDE68A;
}

.export-btn {
  background: #DBEAFE;
  color: #1E40AF;
}

.export-btn:hover {
  background: #BFDBFE;
}

.export-word-btn {
  background: #E0F2FE;
  color: #1E40AF;
}

.export-word-btn:hover {
  background: #C6EAFE;
}

.save-btn {
  background: #D1FAE5;
  color: #065F46;
}

.save-btn:hover {
  background: #A7F3D0;
}

.resume-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}


.markdown-editor-area {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.editor-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1F2937;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-textarea {
  flex: 1;
  width: 100%;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.3s ease;
}

.markdown-textarea:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.markdown-textarea::placeholder {
  color: #9CA3AF;
  font-style: italic;
}

/* 预览模式布局 */
.preview-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #E5E7EB;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1F2937;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.zoom-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #495057;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  min-width: 40px;
  text-align: center;
}

.zoom-reset-btn {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  color: #495057;
  transition: all 0.2s ease;
}

.zoom-reset-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  max-height: calc(100vh - 200px);
  min-height: calc(100vh - 200px);
}

.scaled-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: fit-content;
  min-width: 100%;
  min-height: 100%;
}

.resume-preview {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  overflow: visible;
  display: flex;
  flex-direction: column;
}


.template-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #DBEAFE;
  color: #1E40AF;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}


.resume-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.sidebar-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F2937;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-weight: 500;
  color: #6B7280;
  font-size: 0.9rem;
}

.info-item .value {
  color: #374151;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-draft {
  background: #FEF3C7;
  color: #D97706;
}

.status-completed {
  background: #D1FAE5;
  color: #065F46;
}

.status-published {
  background: #DBEAFE;
  color: #1E40AF;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-btn.primary {
  background: #2563EB;
  color: white;
}

.action-btn.primary:hover {
  background: #1D4ED8;
}

.action-btn.secondary {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.action-btn.secondary:hover {
  background: #E5E7EB;
}

.action-btn.danger {
  background: #FEE2E2;
  color: #DC2626;
}

.action-btn.danger:hover {
  background: #FECACA;
}

.action-btn.export {
  background: #E0F2FE;
  color: #1E40AF;
}

.action-btn.export:hover {
  background: #C6EAFE;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #DC2626;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 禁用状态 */
.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn:disabled:hover {
  background: inherit;
}

.interview-item {
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.interview-item:last-child {
  margin-bottom: 0;
}

.interview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.interview-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.interview-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-planned {
  background: #FEF3C7;
  color: #D97706;
}

.status-progress {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-completed {
  background: #D1FAE5;
  color: #065F46;
}

.status-canceled {
  background: #FEE2E2;
  color: #DC2626;
}

.interview-position {
  margin: 0 0 0.25rem 0;
  color: #6B7280;
  font-size: 0.9rem;
}

.interview-time {
  margin: 0;
  color: #9CA3AF;
  font-size: 0.8rem;
}

.no-data {
  color: #9CA3AF;
  font-style: italic;
  text-align: center;
  margin: 1rem 0;
}

@media (max-width: 1024px) {
  .resume-content {
    grid-template-columns: 1fr;
  }
  
  .resume-sidebar {
    order: -1;
  }
}

/* 简洁专业的简历样式 */
:deep(.resume-container) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
  line-height: 1.6;
  color: #333;
  width: 800px;
  min-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  border-radius: 10px;
}

:deep(.resume-container .resume-title) {
  font-size: 18pt;
  font-weight: 700;
  margin: 0 0 16pt 0;
  text-align: center;
  line-height: 1.2;
  color: #000;
}

:deep(.resume-container .section-title) {
  font-size: 14pt;
  font-weight: 600;
  margin: 20pt 0 12pt 0;
  padding-bottom: 4pt;
  border-bottom: 2pt solid #3b82f6;
  color: #000;
}

:deep(.resume-container .contact-info) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
  justify-content: center;
}

:deep(.resume-container .contact-item) {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}

:deep(.resume-container .experience-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 0;
}

:deep(.resume-container .experience-header.one-item) {
  justify-content: flex-start;
}

:deep(.resume-container .experience-header.two-items) {
  justify-content: space-between;
}

:deep(.resume-container .experience-header.three-items) {
  justify-content: space-between;
}

:deep(.resume-container .experience-line) {
  flex: 0 0 auto;
}

:deep(.resume-container .experience-line.company) {
  font-weight: bold;
  font-size: 15px;
  color: #000;
  text-align: left;
  margin-right: auto;
}

:deep(.resume-container .experience-line.position) {
  font-weight: bold;
  font-size: 13px;
  color: #374151;
  text-align: center;
}

:deep(.resume-container .experience-line.duration) {
  font-weight: bold;
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  margin-left: auto;
}

:deep(.resume-container .tech-stack-section) {
  margin: 15px 0;
}

:deep(.resume-container .tech-tags) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.resume-container .tech-tag) {
  background-color: #f3f4f6;
  color: #374151;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

:deep(.resume-container ul) {
  margin: 8px 0;
  padding-left: 0;
  list-style: none;
}

:deep(.resume-container li) {
  margin: 4px 0;
  position: relative;
  padding-left: 16px;
}

:deep(.resume-container li::before) {
  content: "•";
  color: #1e40af;
  font-weight: bold;
  position: absolute;
  left: 0;
}

:deep(.resume-container strong) {
  font-weight: bold;
}

:deep(.resume-container .description) {
  margin-top: 8px;
  line-height: 1.5;
  font-size: 14px;
  color: #374151;
}

:deep(.resume-container .highlight-keyword) {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .resume-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .mode-switch-btn, .export-btn, .export-word-btn, .save-btn {
    width: 100%;
  }
  
  .resume-content {
    padding: 1rem;
  }
  
  .resume-preview {
    padding: 1.5rem;
  }
  
  .preview-content {
    max-height: calc(100vh - 180px);
    min-height: calc(100vh - 180px);
  }
  
  .editor-container {
    gap: 1rem;
  }
  
  .markdown-editor-area {
    padding: 1rem;
  }
  
  .preview-controls {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  
  .zoom-controls {
    padding: 0.25rem;
  }
  
  .zoom-btn {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }
  
  .zoom-level {
    font-size: 11px;
    min-width: 35px;
  }
  
  .zoom-reset-btn {
    padding: 2px 6px;
    font-size: 10px;
  }
}
</style>
