<template>
  <div class="wiki-query-container">
    <WikiNav />
    
    <!-- 顶部导航栏 -->
    <div class="room-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <span class="icon">←</span>
          返回
        </button>
        <div class="query-title">
          <h1>知识库问答</h1>
          <span class="subtitle">智能对话，知识探索</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="wiki-selector">
          <label>选择知识库：</label>
          <select v-model="selectedWikiId" @change="onWikiChange" class="wiki-select">
            <option value="">请选择知识库</option>
            <option 
              v-for="wiki in filteredKnowledgeBases" 
              :key="wiki.ID" 
              :value="wiki.ID"
            >
              {{ wiki.title }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="room-content">
      <!-- 主对话区域 -->
      <div class="main-interview-area">
        <!-- 聊天区域 -->
        <div class="chat-container">
          <div class="chat-header">
            <h3>知识库对话</h3>
            <div class="chat-actions">
              <button class="action-btn" @click="clearChat" v-if="chatHistory.length > 0" :disabled="isLoading">
                <span class="icon">🗑️</span>
                清空对话
              </button>
            </div>
          </div>
          
          <div class="messages-container" ref="chatContainer">
            <div class="messages">
              <div 
                v-for="(message, index) in chatHistory" 
                :key="index"
                class="message"
                :class="message.role"
              >
                <div class="message-avatar">
                  <span class="avatar-icon">{{ message.role === 'ai' ? '🤖' : '👤' }}</span>
                </div>
                <div class="message-content">
                  <div class="message-text" v-html="renderMessage(message.content)"></div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
              
              <!-- 加载状态 -->
              <div v-if="isLoading" class="message ai">
                <div class="message-avatar">
                  <span class="avatar-icon">🤖</span>
                </div>
                <div class="message-content">
                  <div class="message-text">
                    <div class="thinking-container">
                      <div class="thinking-text">AI正在思考中</div>
                      <div class="thinking-dots">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="input-container">
            <div class="input-wrapper">
              <textarea 
                v-model="userInput"
                placeholder="请输入您的问题..." 
                :disabled="!selectedWikiId || isLoading"
                class="message-input"
              ></textarea>
              <div class="input-actions">
                <button 
                  @click="sendMessage"
                  :disabled="!userInput.trim() || !selectedWikiId || isLoading"
                  class="send-btn"
                >
                  <span class="icon">📤</span>
                  {{ isLoading ? '发送中...' : '发送' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 可伸缩的知识库侧边栏 -->
        <div class="resume-sidebar" :class="{ 'collapsed': isInfoCollapsed }">
          <div class="sidebar-header">
            <h3>知识库信息</h3>
            <button @click="toggleInfoPanel" class="toggle-btn" :title="isInfoCollapsed ? '展开信息' : '收起信息'">
              <span class="icon">{{ isInfoCollapsed ? '▶' : '◀' }}</span>
            </button>
          </div>

          <div class="sidebar-content" v-show="!isInfoCollapsed">
            <div v-if="selectedWiki" class="wiki-info">
              <div class="info-section">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">知识库名称</span>
                    <span class="value">{{ selectedWiki.title }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">创建时间</span>
                    <span class="value">{{ formatDate(selectedWiki.CreatedAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">文件数量</span>
                    <span class="value">{{ getFileCount() }} 个文件</span>
                  </div>
                </div>
              </div>
              
              <!-- 快捷问题 -->
              <div class="quick-questions">
                <h4>快捷问题</h4>
                <div class="question-list">
                  <button 
                    v-for="question in quickQuestions" 
                    :key="question"
                    class="question-btn"
                    @click="askQuickQuestion(question)"
                    :disabled="isLoading"
                  >
                    {{ question }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="no-wiki">
              <div class="empty-icon">📚</div>
              <p>请选择一个知识库开始对话</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getWikiList, 
  queryWiki,
  type WikiItem,
  WikiType,
  type WikiQueryParams
} from '@/service/wiki'
import WikiNav from '@/components/WikiNav.vue'

const router = useRouter()

// 响应式数据
const knowledgeBases = ref<WikiItem[]>([])
const selectedWikiId = ref<number | ''>('')
const selectedWiki = ref<WikiItem | null>(null)
const userInput = ref('')
const chatHistory = ref<Array<{
  role: 'user' | 'ai'
  content: string
  time: string
}>>([])
const isLoading = ref(false)
const chatContainer = ref<HTMLElement>()
const isInfoCollapsed = ref(false)

// 快捷问题
const quickQuestions = [
  '这个知识库包含哪些内容？',
  '请总结一下主要知识点',
  '有哪些重要的文档？',
  '如何更好地使用这个知识库？'
]

// 计算属性 - 只显示知识库（type=0，parent_id=0）
const filteredKnowledgeBases = computed(() => {
  return knowledgeBases.value.filter(wiki => 
    wiki.type === WikiType.KNOWLEDGE_BASE && wiki.parent_id === 0
  ).map(wiki => ({
    ...wiki,
    title: cleanTitle(wiki.title)
  }))
})

// 清理title中的双引号
const cleanTitle = (title: string) => {
  return title.replace(/^"|"$/g, '')
}

// 方法
const loadKnowledgeBases = async () => {
  try {
    console.log('开始加载知识库列表...')
    const response = await getWikiList()
    console.log('知识库列表API响应:', response)
    
    if (response.code === 1000 && response.data) {
      knowledgeBases.value = response.data
      console.log('知识库列表加载成功:', knowledgeBases.value)
    } else {
      console.error('API返回错误:', response.msg)
      // 加载测试数据
      loadMockKnowledgeBases()
    }
  } catch (error) {
    console.error('加载知识库列表失败:', error)
    // 网络错误时加载测试数据
    loadMockKnowledgeBases()
  }
}

// 加载测试知识库数据
const loadMockKnowledgeBases = () => {
  console.log('加载测试知识库数据...')
  knowledgeBases.value = [
    {
      ID: 1,
      CreatedAt: '2024-01-15T10:00:00Z',
      UpdatedAt: '2024-01-15T10:00:00Z',
      DeletedAt: null,
      title: '技术文档库',
      url: '',
      type: WikiType.KNOWLEDGE_BASE,
      parent_id: 0,
      wiki_type: 0,
      user_id: 1,
      root_id: 0
    },
    {
      ID: 2,
      CreatedAt: '2024-01-16T14:30:00Z',
      UpdatedAt: '2024-01-16T14:30:00Z',
      DeletedAt: null,
      title: '学习笔记',
      url: '',
      type: WikiType.KNOWLEDGE_BASE,
      parent_id: 0,
      wiki_type: 0,
      user_id: 1,
      root_id: 0
    }
  ]
  console.log('测试知识库数据加载完成:', knowledgeBases.value)
}

const onWikiChange = () => {
  if (selectedWikiId.value) {
    selectedWiki.value = knowledgeBases.value.find(wiki => wiki.ID === selectedWikiId.value) || null
    // 清空聊天历史
    chatHistory.value = []
  } else {
    selectedWiki.value = null
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || !selectedWikiId.value || isLoading.value) return
  
  const userMessage = userInput.value.trim()
  const currentTime = new Date().toLocaleTimeString('zh-CN')
  
  // 添加用户消息
  chatHistory.value.push({
    role: 'user',
    content: userMessage,
    time: currentTime
  })
  
  userInput.value = ''
  isLoading.value = true
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  try {
    const params: WikiQueryParams = {
      query: userMessage,
      root_id: selectedWikiId.value as number
    }
    
    const response = await queryWiki(params)
    console.log('知识库查询响应:', response)
    
    if (response.code === 1000 && response.data) {
      // 添加AI回复
      chatHistory.value.push({
        role: 'ai',
        content: response.data,
        time: new Date().toLocaleTimeString('zh-CN')
      })
    } else {
      // 添加错误消息
      chatHistory.value.push({
        role: 'ai',
        content: `抱歉，我无法回答这个问题。${response.msg || '请检查知识库内容或重新提问。'}`,
        time: new Date().toLocaleTimeString('zh-CN')
      })
    }
  } catch (error) {
    console.error('查询失败:', error)
    chatHistory.value.push({
      role: 'ai',
      content: '抱歉，查询过程中出现错误，请稍后重试。',
      time: new Date().toLocaleTimeString('zh-CN')
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const askQuickQuestion = (question: string) => {
  userInput.value = question
  sendMessage()
}

const clearChat = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    chatHistory.value = []
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const renderMessage = (content: string) => {
  // 简单的 Markdown 渲染
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getFileCount = () => {
  if (!selectedWiki.value) return 0
  // 这里可以根据实际需求计算文件数量
  return knowledgeBases.value.filter(item => item.root_id === selectedWiki.value?.ID).length
}

const goBack = () => {
  router.push('/wiki')
}

const toggleInfoPanel = () => {
  isInfoCollapsed.value = !isInfoCollapsed.value
}

// 监听聊天历史变化，自动滚动
watch(chatHistory, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  loadKnowledgeBases()
})
</script>

<style scoped>
.wiki-query-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 顶部导航栏 */
.room-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.query-title h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  display: block;
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
  margin-top: 0.25rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.wiki-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wiki-selector label {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 600;
}

.wiki-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: white;
  min-width: 220px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.wiki-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 主内容区域 */
.room-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 聊天容器 */
.chat-container {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 0;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border-radius: 20px 20px 0 0;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.chat-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 消息容器 */
.messages-container {
  flex: 1 1 0;
  padding: 2rem;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 1rem;
}

.message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.message-content {
  flex: 1;
  max-width: 75%;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  background: white;
  padding: 1.2rem 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  line-height: 1.6;
  color: #2d3748;
  font-size: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.message.user .message-text {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}

.message.ai .message-text {
  background: white;
  border: 1px solid #e2e8f0;
}

.message-time {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: center;
}

.message.user .message-time {
  text-align: center;
}

/* 思考状态 */
.thinking-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.thinking-text {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.thinking-dots {
  display: flex;
  gap: 0.5rem;
}

.thinking-dots .dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: thinking 1.4s infinite ease-in-out;
}

.thinking-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 输入容器 */
.input-container {
  padding: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  border-radius: 0 0 20px 20px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-input {
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  background: #f8fafc;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 主面试区域 */
.main-interview-area {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 可伸缩的知识库侧边栏 */
.resume-sidebar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  width: 320px;
}

.resume-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.sidebar-content {
  padding: 1.5rem;
  flex: 1;
}

.wiki-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item .label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
  line-height: 1.5;
}

/* 快捷问题 */
.quick-questions {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.quick-questions h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-questions h4::before {
  content: '💡';
  font-size: 1rem;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.question-btn {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.question-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  border-color: transparent;
}

.question-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-wiki {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.no-wiki p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.icon {
  font-style: normal;
}
</style>
