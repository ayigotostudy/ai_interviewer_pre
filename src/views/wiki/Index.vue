<template>
  <div class="wiki-container">
    <WikiNav />
    <!-- 头部工具栏 -->
    <div class="wiki-header">
      <div class="header-left">
        <h1 class="page-title">个人知识库</h1>
        <p class="page-subtitle">构建你的专属知识体系</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="icon">📚</i>
          新建知识库
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索知识库内容..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <i class="icon">🔍</i>
        </button>
      </div>
    </div>

    <!-- 知识库列表 -->
    <div class="wiki-list" v-if="!isSearching">
      <div class="list-header">
        <h2>我的知识库</h2>
        <span class="count">{{ knowledgeBases.length }} 个知识库</span>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载知识库...</p>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="knowledgeBases.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>暂无知识库</h3>
        <p>点击上方"新建知识库"按钮开始创建您的第一个知识库</p>
      </div>
      
      <!-- 知识库网格 -->
      <div v-else class="wiki-grid">
        <div 
          v-for="wiki in knowledgeBases" 
          :key="wiki.ID"
          class="wiki-card"
          @click="openWiki(wiki)"
        >
          <div class="card-header">
            <div class="card-icon">📚</div>
            <div class="card-actions">
              <button class="action-btn" @click.stop="showEditModalHandler(wiki)">
                <i class="icon">✏️</i>
              </button>
              <button class="action-btn" @click.stop="deleteWiki(wiki.ID)">
                <i class="icon">🗑️</i>
              </button>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ wiki.title }}</h3>
            <p class="card-meta">
              创建于 {{ formatDate(wiki.CreatedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="isSearching">
      <div class="results-header">
        <h2>搜索结果</h2>
        <button class="btn btn-secondary" @click="clearSearch">
          返回知识库列表
        </button>
      </div>
      
      <div class="results-list">
        <div 
          v-for="result in searchResults" 
          :key="result.ID"
          class="result-item"
          @click="openWiki(result)"
        >
          <div class="result-icon">📄</div>
          <div class="result-content">
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-path">{{ getWikiPath(result) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建知识库模态框 -->
    <div class="modal-overlay" v-if="showCreateModal" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新建知识库</h3>
          <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>知识库名称</label>
            <input 
              v-model="newWiki.title" 
              type="text" 
              placeholder="请输入知识库名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="newWiki.description" 
              placeholder="请输入知识库描述"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">取消</button>
          <button class="btn btn-primary" @click="createKnowledgeBase" :disabled="!newWiki.title">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑知识库模态框 -->
    <div class="modal-overlay" v-if="showEditModal" @click="showEditModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>编辑知识库</h3>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>知识库名称</label>
            <input 
              v-model="editingWiki!.title" 
              type="text" 
              placeholder="请输入知识库名称"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="updateKnowledgeBase" :disabled="!editingWiki!.title">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getWikiList, 
  createWiki, 
  updateWiki, 
  deleteWiki as deleteWikiService, 
  queryWiki,
  type WikiItem,
  WikiType,
  type CreateWikiParams
} from '@/service/wiki'
import WikiNav from '@/components/WikiNav.vue'

const router = useRouter()

// 响应式数据
const wikiList = ref<WikiItem[]>([])
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<WikiItem[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingWiki = ref<WikiItem | null>(null)
const isLoading = ref(false)

// 新建知识库表单
const newWiki = ref({
  title: '',
  description: ''
})

// 计算属性 - 只显示知识库（type=0，parent_id=0）
const knowledgeBases = computed(() => {
  return wikiList.value.filter(wiki => 
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
const loadWikiList = async () => {
  isLoading.value = true
  try {
    console.log('开始加载知识库列表...')
    const response = await getWikiList()
    console.log('API响应:', response)
    
    // API成功响应code为1000
    if (response.code === 1000 && response.data) {
      wikiList.value = response.data
      console.log('知识库列表加载成功:', wikiList.value)
    } else {
      console.error('API返回错误:', response.msg)
      // 如果API失败，加载一些测试数据
      loadMockData()
    }
  } catch (error) {
    console.error('加载知识库列表失败:', error)
    // 网络错误时加载测试数据
    loadMockData()
  } finally {
    isLoading.value = false
  }
}

// 加载测试数据
const loadMockData = () => {
  console.log('加载测试数据...')
  wikiList.value = [
    // 知识库（type=0, parent_id=0）
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
    },
    {
      ID: 3,
      CreatedAt: '2024-01-17T09:15:00Z',
      UpdatedAt: '2024-01-17T09:15:00Z',
      DeletedAt: null,
      title: '项目资料',
      url: '',
      type: WikiType.KNOWLEDGE_BASE,
      parent_id: 0,
      wiki_type: 0,
      user_id: 1,
      root_id: 0
    },
    // 文件夹（type=1）
    {
      ID: 101,
      CreatedAt: '2024-01-15T11:00:00Z',
      UpdatedAt: '2024-01-15T11:00:00Z',
      DeletedAt: null,
      title: '技术文档',
      url: '',
      type: WikiType.FOLDER,
      parent_id: 1,
      wiki_type: 0,
      user_id: 1,
      root_id: 1
    },
    // 文章（type=2）
    {
      ID: 201,
      CreatedAt: '2024-01-15T12:00:00Z',
      UpdatedAt: '2024-01-15T12:00:00Z',
      DeletedAt: null,
      title: 'API文档.md',
      url: '',
      type: WikiType.ARTICLE,
      parent_id: 101,
      wiki_type: 0,
      user_id: 1,
      root_id: 1
    }
  ]
  console.log('测试数据加载完成:', wikiList.value)
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  try {
    // 这里需要根据实际API调整搜索逻辑
    // 暂时使用简单的标题搜索
    searchResults.value = wikiList.value.filter(wiki => 
      wiki.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  searchResults.value = []
}

const openWiki = (wiki: WikiItem) => {
  router.push(`/wiki/${wiki.ID}`)
}

const createKnowledgeBase = async () => {
  try {
    const params: CreateWikiParams = {
      title: newWiki.value.title,
      parent_id: 0, // 知识库没有父节点
      wiki_type: 0,
      root_id: 0, // 知识库的root_id为0
      url: '',
      type: '0' // type=0表示知识库
    }
    
    console.log('创建知识库参数:', params)
    const response = await createWiki(params)
    console.log('创建知识库响应:', response)
    
    if (response.code === 1000) {
      showCreateModal.value = false
      newWiki.value = { title: '', description: '' }
      await loadWikiList()
    } else {
      console.error('创建知识库失败:', response.msg)
    }
  } catch (error) {
    console.error('创建知识库失败:', error)
  }
}

const showEditModalHandler = (wiki: WikiItem) => {
  editingWiki.value = { ...wiki }
  showEditModal.value = true
}

const updateKnowledgeBase = async () => {
  if (!editingWiki.value) return
  
  try {
    const response = await updateWiki(editingWiki.value)
    if (response.code === 0) {
      showEditModal.value = false
      editingWiki.value = null
      await loadWikiList()
    }
  } catch (error) {
    console.error('更新知识库失败:', error)
  }
}

const deleteWiki = async (id: number) => {
  if (!confirm('确定要删除这个知识库吗？')) return
  
  try {
    const response = await deleteWikiService(id)
    if (response.code === 0) {
      await loadWikiList()
    }
  } catch (error) {
    console.error('删除知识库失败:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getWikiPath = (wiki: WikiItem) => {
  // 这里可以根据parent_id构建路径
  return '知识库'
}

// 生命周期
onMounted(() => {
  loadWikiList()
})
</script>

<style scoped>
.wiki-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.wiki-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 5px 0 0 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #4096ff;
  color: white;
}

.btn-primary:hover {
  background: #2582e7;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.search-section {
  margin-bottom: 30px;
}

.search-box {
  display: flex;
  max-width: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-box:focus-within {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 16px;
}

.search-btn {
  padding: 12px 16px;
  background: #4096ff;
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #2582e7;
}

.wiki-list {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  margin: 0;
  color: #1d2129;
  font-weight: 600;
}

.count {
  color: #6b7280;
  font-size: 14px;
}

.wiki-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.wiki-card {
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.wiki-card:hover {
  border-color: #4096ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-icon {
  font-size: 24px;
}

.card-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.wiki-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.card-meta {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.search-results {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h2 {
  margin: 0;
  color: #1f2937;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.result-icon {
  font-size: 20px;
}

.result-content {
  flex: 1;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.result-path {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.icon {
  font-style: normal;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #4096ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}
</style>
