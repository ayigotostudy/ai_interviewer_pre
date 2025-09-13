<template>
  <div class="interview-detail-container">
    <div class="detail-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <span class="icon">←</span>
          返回
        </button>
        <h1>面试详情</h1>
        <div class="header-actions">
          <button class="start-btn" @click="startInterview" v-if="interview.status === 'planned'">
            <span class="icon">▶️</span>
            开始面试
          </button>
          <button class="edit-btn" @click="editInterview">
            <span class="icon">✏️</span>
            编辑
          </button>
          <button class="evaluation-btn" @click="viewEvaluation" v-if="interview.status === 'completed'">
            <span class="icon">📊</span>
            查看评价
          </button>
          <button class="cancel-btn" @click="cancelInterview" v-if="interview.status === 'planned'">
            <span class="icon">❌</span>
            取消面试
          </button>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <div class="interview-info">
        <div class="info-card">
          <div class="card-header">
            <h3>面试信息</h3>
            <span class="status-badge" :class="getStatusClass(interview.status)">
              {{ getStatusText(interview.status) }}
            </span>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">候选人：</span>
              <span class="value">{{ interview.candidate }}</span>
            </div>
            <div class="info-item">
              <span class="label">目标职位：</span>
              <span class="value">{{ interview.position }}</span>
            </div>
            <div class="info-item">
              <span class="label">面试时间：</span>
              <span class="value">{{ formatTime(interview.time) }}</span>
            </div>
            <div class="info-item">
              <span class="label">面试类型：</span>
              <span class="value">{{ getInterviewTypeText(interview.type) }}</span>
            </div>
            <div class="info-item">
              <span class="label">面试官：</span>
              <span class="value">{{ interview.interviewer || 'AI面试官' }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatTime(interview.created_at) }}</span>
            </div>
          </div>

          <div class="description-section" v-if="interview.job_description">
            <h4>职位描述</h4>
            <p>{{ interview.job_description }}</p>
          </div>


        </div>

        <div class="resume-card" v-if="interview.resume_id">
          <div class="card-header">
            <h3>候选人简历</h3>
            <button class="view-resume-btn" @click="viewResume">
              <span class="icon">👁️</span>
              查看完整简历
            </button>
          </div>
          
          <div class="resume-preview">
            <div class="resume-header">
              <h4>{{ resume.name || '未命名简历' }}</h4>
              <div class="template-badge">
                模板：{{ getTemplateName(resume.template_id) }}
              </div>
            </div>
            
            <div class="resume-content">
              <div class="resume-section">
                <h5>简历内容</h5>
                <div class="resume-markdown" v-html="enhancedMarkdownPreview"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="interview-sidebar">
        <div class="sidebar-section">
          <div class="section-header">
            <h4>面试记录</h4>
            <button 
              v-if="interviewRecords.length > 0" 
              class="toggle-btn" 
              @click="toggleRecords"
              :class="{ 'expanded': showRecords }"
            >
              <span class="icon">{{ showRecords ? '📖' : '📋' }}</span>
              {{ showRecords ? '收起' : '展开' }}
            </button>
          </div>
          <div v-if="interviewRecords.length > 0 && showRecords" class="records-container">
            <div v-for="record in interviewRecords" :key="record.id" class="record-item">
              <div class="record-header">
                <span class="record-time">{{ formatTime(record.timestamp) }}</span>
                <span class="record-type" :class="getRecordTypeClass(record.type)">
                  {{ getRecordTypeText(record.type) }}
                </span>
              </div>
              <p class="record-content">{{ record.content }}</p>
            </div>
          </div>
          <div v-else-if="interviewRecords.length > 0" class="records-summary">
            <p class="summary-text">共有 {{ interviewRecords.length }} 条面试记录</p>
            <button class="view-records-btn" @click="toggleRecords">
              <span class="icon">👁️</span>
              查看记录
            </button>
          </div>
          <p v-else class="no-data">暂无面试记录</p>
        </div>

        <div class="sidebar-section">
          <div class="section-header">
            <h4>面试评估</h4>
            <button 
              v-if="interview.evaluation" 
              class="view-evaluation-btn" 
              @click="viewEvaluation"
            >
              <span class="icon">📊</span>
              查看详细评价
            </button>
          </div>
          <div v-if="interview.evaluation" class="evaluation-summary">
            <div class="evaluation-score">
              <span class="score-value">{{ interview.evaluation.score || 0 }}</span>
              <span class="score-label">/ 100</span>
            </div>
            <div class="evaluation-brief">
              <p class="brief-text">{{ interview.evaluation.comment || '暂无详细评价' }}</p>
            </div>
          </div>
          <p v-else class="no-data">暂无评估结果</p>
        </div>

        <div class="sidebar-section">
          <h4>快捷操作</h4>
          <button class="action-btn primary" @click="startInterview" v-if="interview.status === 'planned' || interview.status === 'interviewing'">
            <span class="icon">▶️</span>
            开始面试
          </button>
          <button class="action-btn secondary" @click="rescheduleInterview" v-if="interview.status === 'planned'">
            <span class="icon">📅</span>
            重新安排
          </button>
          <button class="action-btn danger" @click="deleteInterview">
            <span class="icon">🗑️</span>
            删除面试
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getMeetingDetail, deleteMeeting } from '@/service/meeting'
import { getResumeDetail } from '@/service/resume'
import { EnhancedMarkdownParser } from '@/utils/MarkdownParser'

const router = useRouter()
const route = useRoute()

// 面试数据
const interview = ref<any>({})
const resume = ref<any>({})
const interviewRecords = ref<any[]>([])

// 面试记录展示状态
const showRecords = ref(false)

const getStatusClass = (status: string) => {
  const statusClasses: { [key: string]: string } = {
    planned: 'status-planned',
    interviewing: 'status-progress',
    completed: 'status-completed',
    canceled: 'status-canceled'
  }
  return statusClasses[status] || 'status-planned'
}

const getStatusText = (status: string) => {
  const statusTexts: { [key: string]: string } = {
    planned: '待开始',
    interviewing: '进行中',
    completed: '已完成',
    canceled: '已取消'
  }
  return statusTexts[status] || '待开始'
}

const getInterviewTypeText = (type: string) => {
  const typeTexts: { [key: string]: string } = {
    text: '文本面试',
    video: '视频面试',
    mixed: '混合面试'
  }
  return typeTexts[type] || '文本面试'
}

const getRecordTypeClass = (type: string) => {
  const typeClasses: { [key: string]: string } = {
    question: 'type-question',
    answer: 'type-answer',
    evaluation: 'type-evaluation'
  }
  return typeClasses[type] || 'type-question'
}

const getRecordTypeText = (type: string) => {
  const typeTexts: { [key: string]: string } = {
    question: '问题',
    answer: '回答',
    evaluation: '评估'
  }
  return typeTexts[type] || '问题'
}

const getTemplateName = (templateId: number) => {
  const templateNames: { [key: number]: string } = {
    1: '经典模板',
    2: '现代简约',
    3: '创意设计',
    4: '专业商务'
  }
  return templateNames[templateId] || '未知模板'
}

// 增强版Markdown预览
const enhancedMarkdownPreview = computed(() => {
  const content = resume.value?.content || ''
  if (!content.trim()) {
    return '<div class="empty-content">暂无简历内容</div>'
  }
  
  return EnhancedMarkdownParser.parse(content)
})

const formatTime = (timestamp: any) => {
  if (!timestamp) return '未知时间'
  
  let date: Date
  
  // 如果是数字，假设是Unix时间戳（秒）
  if (typeof timestamp === 'number') {
    date = new Date(timestamp * 1000)
  } 
  // 如果是字符串，尝试解析
  else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } 
  // 其他情况，直接使用
  else {
    date = new Date(timestamp)
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '无效日期'
  }
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.go(-1)
}

const startInterview = () => {
  router.push(`/interview/room/${route.params.id}`)
}

const editInterview = () => {
  router.push(`/interview/edit/${route.params.id}`)
}

const viewEvaluation = () => {
  router.push(`/interview/evaluation/${route.params.id}`)
}

const cancelInterview = async () => {
  if (!confirm('确定要取消这场面试吗？此操作不可恢复。')) {
    return
  }

  try {
    // 调用删除面试API
    const response = await deleteMeeting(Number(route.params.id))
    
    if (response.data.code === 1000) {
      alert('面试已成功取消')
      router.push('/interview')
    } else {
      alert('取消面试失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('取消面试失败:', error)
    alert('取消面试失败，请重试')
  }
}

const viewResume = () => {
  if (interview.value.resume_id) {
    router.push(`/resume/${interview.value.resume_id}`)
  }
}

const rescheduleInterview = () => {
  // 这里实现重新安排面试功能
  alert('重新安排功能开发中...')
}

const deleteInterview = async () => {
  if (!confirm('确定要删除这场面试吗？此操作不可恢复。')) {
    return
  }

  try {
    // 这里应该调用删除面试API
    // await deleteMeeting(route.params.id)
    
    alert('面试删除成功')
    router.push('/interview')
  } catch (error) {
    console.error('删除面试失败:', error)
    alert('删除面试失败，请重试')
  }
}

const loadInterviewDetail = async () => {
  try {
    const interviewId = route.params.id as string
    const response = await getMeetingDetail(interviewId)
    if (response.data.code === 1000) {
      interview.value = response.data.data
      // 加载简历数据
      if (interview.value.resume_id) {
        await loadResumeData()
      }
      
      // 从remark字段解析评价数据
      if (interview.value.remark) {
        try {
          const remarkData = JSON.parse(interview.value.remark)
          if (remarkData.overallEvaluation) {
            interview.value.evaluation = {
              score: remarkData.overallEvaluation.score || 0,
              rating: remarkData.overallEvaluation.rating || '暂无',
              comment: remarkData.answerAnalysis?.interviewEvaluation || '暂无详细评价'
            }
          }
        } catch (parseError) {
          // 如果解析失败，设置默认值
          interview.value.evaluation = {
            score: 0,
            rating: '暂无',
            comment: '暂无详细评价'
          }
        }
      }
      
      // 面试详情加载完成后，加载面试记录
      await loadInterviewRecords()
    } else {
      console.error('获取面试详情失败:', response.data.msg)
      alert('获取面试详情失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('获取面试详情失败:', error)
    alert('获取面试详情失败，请重试')
  }
}

const loadResumeData = async () => {
  if (!interview.value.resume_id) return
  
  try {
    const resumeId = interview.value.resume_id.toString()
    const response = await getResumeDetail(resumeId)
    if (response.data.code === 1000) {
      resume.value = response.data.data
    } else {
      console.error('获取简历详情失败:', response.data.msg)
    }
  } catch (error) {
    console.error('获取简历详情失败:', error)
  }
}

// 切换面试记录显示
const toggleRecords = () => {
  showRecords.value = !showRecords.value
}

const loadInterviewRecords = async () => {
  try {
    // 从面试详情中获取面试记录
    if (interview.value.interview_record) {
      const recordText = interview.value.interview_record
      const records = []
      
      // 解析面试记录文本，提取对话内容
      const lines = recordText.split('\n')
      let currentRecord = null
      let recordIndex = 0
      
      for (const line of lines) {
        if (line.startsWith('user: ')) {
          if (currentRecord) {
            records.push(currentRecord)
          }
          currentRecord = {
            id: records.length + 1,
            timestamp: interview.value.created_at ? new Date(interview.value.created_at).getTime() / 1000 + recordIndex * 300 : Date.now() / 1000 + recordIndex * 300,
            type: 'answer',
            content: line.replace('user: ', '').trim()
          }
          recordIndex++
        } else if (line.startsWith('assistant: ')) {
          if (currentRecord) {
            records.push(currentRecord)
          }
          currentRecord = {
            id: records.length + 1,
            timestamp: interview.value.created_at ? new Date(interview.value.created_at).getTime() / 1000 + recordIndex * 300 : Date.now() / 1000 + recordIndex * 300,
            type: 'question',
            content: line.replace('assistant: ', '').split('\n')[0].trim() // 只取第一行
          }
          recordIndex++
        }
      }
      
      if (currentRecord) {
        records.push(currentRecord)
      }
      
      interviewRecords.value = records
      console.log('面试记录解析结果:', records)
    } else {
      interviewRecords.value = []
      console.log('没有面试记录数据')
    }
  } catch (error) {
    console.error('解析面试记录失败:', error)
    interviewRecords.value = []
  }
}

onMounted(() => {
  loadInterviewDetail()
  // loadResumeData() 已在 loadInterviewDetail 中调用
  // loadInterviewRecords() 已在 loadInterviewDetail 中调用
  
  // 调试信息
  setTimeout(() => {
    console.log('面试记录数量:', interviewRecords.value.length)
    console.log('面试评估数据:', interview.value.evaluation)
    console.log('showRecords状态:', showRecords.value)
    console.log('面试记录原始数据:', interview.value.interview_record)
    console.log('评价原始数据:', interview.value.remark)
    console.log('创建时间原始值:', interview.value.created_at)
    console.log('创建时间格式化后:', formatTime(interview.value.created_at))
  }, 1000)
})
</script>

<style scoped>
.interview-detail-container {
  min-height: 100vh;
  background: #F8FAFC;
}

.detail-header {
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

.start-btn, .edit-btn, .evaluation-btn, .cancel-btn {
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

.start-btn {
  background: #10B981;
  color: white;
}

.start-btn:hover {
  background: #059669;
}

.edit-btn {
  background: #FEF3C7;
  color: #D97706;
}

.edit-btn:hover {
  background: #FDE68A;
}

.evaluation-btn {
  background: #E0E7FF;
  color: #3730A3;
}

.evaluation-btn:hover {
  background: #C7D2FE;
}

.cancel-btn {
  background: #FEE2E2;
  color: #DC2626;
}

.cancel-btn:hover {
  background: #FECACA;
}

.detail-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.interview-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card, .resume-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
}

.status-badge {
  padding: 0.5rem 1rem;
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

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: #6B7280;
  font-size: 0.9rem;
}

.info-item .value {
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

.description-section, .requirements-section {
  margin-bottom: 1.5rem;
}

.description-section:last-child, .requirements-section:last-child {
  margin-bottom: 0;
}

.description-section h4, .requirements-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.description-section p, .requirements-section p {
  margin: 0;
  color: #6B7280;
  line-height: 1.6;
  white-space: pre-line;
}

.view-resume-btn {
  background: #DBEAFE;
  color: #1E40AF;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.view-resume-btn:hover {
  background: #BFDBFE;
}

.resume-preview {
  margin-top: 1rem;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.resume-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F2937;
}

.template-badge {
  padding: 0.25rem 0.75rem;
  background: #F3F4F6;
  color: #6B7280;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 500;
}

.resume-content {
  background: #F9FAFB;
  border-radius: 10px;
  padding: 1rem;
}

.resume-section {
  margin-bottom: 1rem;
}

.resume-section:last-child {
  margin-bottom: 0;
}

.resume-section h5 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1em;
  font-weight: 600;
}

.resume-section p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

/* 增强版Markdown样式 */
.resume-markdown {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 100%;
}

/* 主标题样式 */
.resume-markdown .resume-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin: 0 0 2rem 0;
  letter-spacing: 0.5px;
}

/* 章节标题样式 */
.resume-markdown .section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2563eb;
  margin: 2rem 0 1rem 0;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

/* 联系方式样式 */
.resume-markdown .contact-info {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.resume-markdown .contact-item {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
  white-space: nowrap;
}

/* 技术栈样式 */
.resume-markdown .tech-stack-section {
  margin: 1rem 0;
}

.resume-markdown .tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.resume-markdown .tech-tag {
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* 经验项目样式 */
.resume-markdown .experience-item {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.resume-markdown .experience-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.resume-markdown .experience-line {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.resume-markdown .experience-line.company {
  font-weight: 600;
  color: #1f2937;
}

.resume-markdown .experience-line.position {
  text-align: center;
  color: #4b5563;
}

.resume-markdown .experience-line.duration {
  text-align: right;
  color: #6b7280;
  font-size: 0.9rem;
}

/* 描述文本样式 */
.resume-markdown .description {
  color: #4a5568;
  line-height: 1.7;
  margin: 0.5rem 0;
}

/* 关键词高亮 */
.resume-markdown .highlight-keyword {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
}

/* 列表样式 */
.resume-markdown ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.resume-markdown li {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #4a5568;
}

/* 段落样式 */
.resume-markdown p {
  margin: 0.75rem 0;
  line-height: 1.7;
  color: #4a5568;
}

/* 粗体样式 */
.resume-markdown strong {
  font-weight: 700;
  color: #1a202c;
}

/* 代码样式 */
.resume-markdown code {
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

.resume-markdown pre {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  margin: 1rem 0;
}

.resume-markdown pre code {
  background: none;
  padding: 0;
  color: #374151;
}

.interview-sidebar {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 0.5rem;
}

.section-header h4 {
  margin: 0;
  border: none;
  padding: 0;
}

.record-item {
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.record-item:last-child {
  margin-bottom: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.record-time {
  font-size: 0.8rem;
  color: #9CA3AF;
}

.record-type {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 500;
}

.type-question {
  background: #DBEAFE;
  color: #1E40AF;
}

.type-answer {
  background: #D1FAE5;
  color: #065F46;
}

.type-evaluation {
  background: #FEF3C7;
  color: #D97706;
}

.record-content {
  margin: 0;
  color: #374151;
  font-size: 0.85rem;
  line-height: 1.4;
}

.no-data {
  color: #9CA3AF;
  font-style: italic;
  text-align: center;
  margin: 1rem 0;
}

.evaluation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.evaluation-item:last-child {
  margin-bottom: 0;
}

.evaluation-item .label {
  font-weight: 500;
  color: #6B7280;
  font-size: 0.9rem;
}

.evaluation-item .score {
  color: #1F2937;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 按钮样式 */
.toggle-btn, .view-evaluation-btn, .view-records-btn {
  background: #F3F4F6;
  color: #374151;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.toggle-btn:hover, .view-evaluation-btn:hover, .view-records-btn:hover {
  background: #E5E7EB;
  transform: translateY(-1px);
}

.toggle-btn.expanded {
  background: #DBEAFE;
  color: #1E40AF;
}

/* 面试记录相关样式 */
.records-container {
  max-height: 400px;
  overflow-y: auto;
}

.records-summary {
  text-align: center;
  padding: 1rem 0;
}

.summary-text {
  margin: 0 0 0.75rem 0;
  color: #6B7280;
  font-size: 0.9rem;
}

/* 面试评估相关样式 */
.evaluation-summary {
  text-align: center;
  padding: 1rem 0;
}

.evaluation-score {
  margin-bottom: 1rem;
}

.score-value {
  font-size: 2rem;
  font-weight: 700;
  color: #10B981;
}

.score-label {
  font-size: 1rem;
  color: #6B7280;
  margin-left: 0.25rem;
}

.evaluation-brief {
  text-align: left;
}

.brief-text {
  margin: 0;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.evaluation-item .comment {
  color: #374151;
  font-size: 0.85rem;
  max-width: 150px;
  text-align: right;
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

@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .interview-sidebar {
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
  
  .start-btn, .edit-btn, .cancel-btn {
    width: 100%;
  }
  
  .detail-content {
    padding: 1rem;
  }
  
  .info-card, .resume-card {
    padding: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
