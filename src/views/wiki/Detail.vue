<template>
  <div class="wiki-detail-container">
    <WikiNav :currentWiki="currentWiki" />
    <!-- 头部导航 -->
    <div class="wiki-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <i class="icon">←</i>
          返回
        </button>
        <div class="wiki-info">
          <h1 class="wiki-title">
            <i class="icon">📚</i>
            {{ currentWiki?.title || '知识库' }}
          </h1>
          <div class="wiki-meta">
            <span class="wiki-id">ID: {{ currentWiki?.ID || 'N/A' }}</span>
            <span class="wiki-date">创建时间: {{ formatWikiDate(currentWiki?.CreatedAt) }}</span>
            <span class="wiki-update">更新时间: {{ formatWikiDate(currentWiki?.UpdatedAt) }}</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="openCreateFileModal">
          <i class="icon">📝</i>
          创建Wiki
        </button>
        <button class="btn btn-secondary" @click="openCreateFolderModal">
          <i class="icon">📂</i>
          新建文件夹
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="wiki-content">
      <!-- 左侧文件列表 -->
      <div class="file-list-panel">
        <div class="panel-header">
          <h3>文件列表</h3>
          <button class="refresh-btn" @click="loadWikiStructure">
            <i class="icon">🔄</i>
          </button>
        </div>
        <div class="list-container">
          <!-- 知识库标题 -->
          <div class="list-header">
            <i class="icon">📚</i>
            <span>{{ currentWiki?.title || '知识库' }}</span>
          </div>
          
          <!-- 知识库导航器 -->
          <div class="navigator-container">
            <div class="navigator-header">
              <h3>知识库导航</h3>
              <button 
                v-if="currentPath.length > 0" 
                class="back-to-root-btn"
                @click="goBackToRoot"
              >
                <i class="icon">🏠</i> 返回根目录
              </button>
            </div>
            <KnowledgeNavigator 
              :root-id="currentWiki?.ID || 0"
              :current-path="currentPath"
              @item-click="handleNavigatorItemClick"
              @folder-toggle="handleNavigatorFolderToggle"
              @current-folder-change="handleCurrentFolderChange"
            />
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-panel">
        <div v-if="selectedNode" class="content-header">
          <h2>{{ selectedNode.title }}</h2>
          <div class="content-actions">
            <button class="action-btn" @click="editNode(selectedNode)">
              <i class="icon">✏️</i>
            </button>
            <button class="action-btn" @click="deleteNode(selectedNode.ID)">
              <i class="icon">🗑️</i>
            </button>
          </div>
        </div>

        <!-- 文件内容显示 -->
        <div class="content-body" v-if="selectedNode && selectedNode.type === 2">
          <div class="content-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >
              预览
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'source' }"
              @click="activeTab = 'source'"
            >
              源码
            </button>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'preview'" class="preview-content">
              <div v-if="selectedNode?.content" v-html="renderContent(selectedNode.content, getFileType(selectedNode.url))"></div>
              <div v-else class="no-content">
                <p>暂无预览内容</p>
                <p class="file-path">文件路径: {{ selectedNode?.url || '未知' }}</p>
              </div>
            </div>
            <div v-else-if="activeTab === 'source'" class="source-content">
              <pre v-if="selectedNode?.content"><code>{{ selectedNode.content }}</code></pre>
              <div v-else class="no-content">
                <p>暂无源码内容</p>
                <p class="file-path">文件路径: {{ selectedNode?.url || '未知' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>选择文件查看内容</h3>
          <p>从左侧文件树中选择一个文件来查看其内容</p>
        </div>
      </div>
    </div>

    <!-- 上传文件模态框 -->
    <div class="modal-overlay" v-if="showUploadModal" @click="showUploadModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>创建Wiki</h3>
          <button class="close-btn" @click="showUploadModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Wiki标题</label>
            <input 
              v-model="uploadForm.title" 
              type="text" 
              placeholder="请输入Wiki标题"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>选择文件 <span class="required">*</span></label>
            <input 
              type="file" 
              @change="handleFileSelect"
              accept=".pdf,.md,.markdown,.doc,.docx,.txt,text/markdown,application/markdown,text/plain,application/octet-stream"
              class="file-input"
              :class="{ 'error': !uploadForm.file && !uploadForm.url }"
            />
            <p class="file-hint">支持 PDF、Markdown、Word、TXT 格式</p>
            <p v-if="!uploadForm.file && !uploadForm.url" class="error-hint">请选择文件或输入网址（必须选择其中一种）</p>
          </div>
          <div class="form-group">
            <label>或输入网址</label>
            <input 
              v-model="uploadForm.url" 
              type="url" 
              placeholder="https://example.com (可选)"
              class="form-input"
            />
            <p class="url-hint">如果不选择文件，请输入有效的网址（与文件上传二选一）</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showUploadModal = false" :disabled="creatingWiki">取消</button>
          <button class="btn btn-primary" @click="createWikiItem" :disabled="!canUpload || creatingWiki">
            {{ creatingWiki ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建文件夹模态框 -->
    <div class="modal-overlay" v-if="showCreateFolderModal" @click="showCreateFolderModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新建文件夹</h3>
          <button class="close-btn" @click="showCreateFolderModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>文件夹名称</label>
            <input 
              v-model="folderForm.title" 
              type="text" 
              placeholder="请输入文件夹名称"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateFolderModal = false" :disabled="creatingFolder">取消</button>
          <button class="btn btn-primary" @click="createFolder" :disabled="!folderForm.title || creatingFolder">
            {{ creatingFolder ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  getWikiDetail, 
  getWikiList, 
  createWiki, 
  updateWiki, 
  deleteWiki,
  type WikiItem,
  WikiType,
  type CreateWikiParams
} from '@/service/wiki'
import WikiNav from '@/components/WikiNav.vue'
import KnowledgeNavigator from '@/components/KnowledgeNavigator.vue'

const route = useRoute()
const router = useRouter()

// 通用取值：兼容返回是普通值或带 .value 的响应式对象
const getVal = (v: any) => (v && typeof v === 'object' && 'value' in v) ? v.value : v

// 响应式数据
const currentWiki = ref<WikiItem | null>(null)
const wikiStructure = ref<any[]>([])
const selectedNode = ref<WikiItem | null>(null)
const activeTab = ref<'preview' | 'source'>('preview')
const showUploadModal = ref(false)
const showCreateFolderModal = ref(false)
const creatingWiki = ref(false)
const creatingFolder = ref(false)
const openCreateFileModal = () => {
  creatingWiki.value = false
  showUploadModal.value = true
}

const openCreateFolderModal = () => {
  creatingFolder.value = false
  showCreateFolderModal.value = true
}
const currentPath = ref<WikiItem[]>([]) // 当前路径，用于面包屑导航
const currentFolderId = ref<number>(0) // 当前文件夹ID，0表示根目录

// 上传表单
const uploadForm = ref({
  title: '',
  file: null as File | null,
  url: ''
})

// 文件夹表单
const folderForm = ref({
  title: ''
})

// 计算属性：可以上传的条件
const canUpload = computed(() => {
  // 必须有标题，且必须有文件或URL（二选一）
  const hasTitle = uploadForm.value.title.trim()
  const hasFile = !!uploadForm.value.file
  const hasUrl = !!uploadForm.value.url.trim()
  
  return hasTitle && (hasFile || hasUrl)
})

// 获取当前选中的文件夹ID作为parentId
const getCurrentParentId = computed(() => {
  // 如果选中了节点且是文件夹，使用该节点ID
  if (selectedNode.value && selectedNode.value.type === WikiType.FOLDER) {
    return selectedNode.value.ID
  }
  // 否则使用当前知识库ID
  return currentWiki.value?.ID || 0
})

// 当前选中的文件夹ID（用于创建文件时的parentId）
const currentSelectedFolderId = ref<number>(0)

// 方法
const loadWikiDetail = async () => {
  const wikiId = Number(route.params.id)
  if (!wikiId) return
  
  try {
    creatingWiki.value = true
    console.log('开始加载知识库详情，ID:', wikiId)
    const response = await getWikiDetail(wikiId)
    console.log('知识库详情API响应:', response)
    
    if (response.code === 1000 && response.data) {
      currentWiki.value = response.data
      console.log('知识库详情加载成功:', currentWiki.value)
      await loadWikiStructure()
    } else {
      console.error('API返回错误:', response.msg)
      // 加载测试数据
      loadMockWikiDetail(wikiId)
    }
  } catch (error) {
    console.error('加载知识库详情失败:', error)
    // 网络错误时加载测试数据
    loadMockWikiDetail(wikiId)
  }
}

// 清理title中的双引号
const cleanTitle = (title: string) => {
  return title.replace(/^"|"$/g, '')
}

// 加载测试知识库详情
const loadMockWikiDetail = (wikiId: number) => {
  console.log('加载测试知识库详情...')
  currentWiki.value = {
    ID: wikiId,
    CreatedAt: '2024-01-15T10:00:00Z',
    UpdatedAt: '2024-01-15T10:00:00Z',
    DeletedAt: null,
    title: `测试知识库 ${wikiId}`,
    url: '',
    type: WikiType.KNOWLEDGE_BASE,
    parent_id: 0,
    wiki_type: 0,
    user_id: 1,
    root_id: 0
  }
}

const loadWikiStructure = async () => {
  if (!currentWiki.value) return
  
  try {
    console.log('开始加载知识库文件列表...')
    const response = await getWikiList()
    console.log('知识库文件列表API响应:', response)
    
    if (response.code === 1000 && response.data) {
      const allItems = response.data
      const rootId = currentWiki.value.ID
      
      // 简化过滤逻辑：找到所有相关的文件和文件夹
      const wikiItems = allItems.filter(item => {
        // 只过滤文件和文件夹类型
        if (item.type !== WikiType.FOLDER && item.type !== WikiType.ARTICLE) {
          return false
        }
        
        // 如果root_id指向当前知识库，直接包含
        if (item.root_id === rootId) {
          return true
        }
        
        // 如果parent_id指向当前知识库，直接包含
        if (item.parent_id === rootId) {
          return true
        }
        
        // 递归查找：检查是否通过父级关系属于当前知识库
        let currentParentId = item.parent_id
        while (currentParentId && currentParentId !== 0) {
          const parent = allItems.find(p => p.ID === currentParentId)
          if (!parent) break
          
          // 如果父级指向当前知识库，则包含
          if (parent.root_id === rootId || parent.parent_id === rootId) {
            return true
          }
          
          currentParentId = parent.parent_id
        }
        
        return false
      })
      
      console.log('过滤后的知识库文件:', wikiItems)
      console.log('当前知识库ID:', rootId)
      
      // 构建层级结构
      const buildHierarchy = (items: WikiItem[], parentId: number = 0): any[] => {
        const children = items
          .filter(item => item.parent_id === parentId)
          .map(item => ({
            ...item,
            title: cleanTitle(item.title),
            children: buildHierarchy(items, item.ID)
          }))
        
        console.log(`构建层级结构 parentId=${parentId}:`, children)
        return children
      }
      
      // 清理title中的双引号并构建层级结构
      // 注意：这里应该从parent_id=0开始构建，但知识库下的直接项目可能parent_id=知识库ID
      let rootItems = buildHierarchy(wikiItems, 0)
      
      // 如果没有找到root_id=0的项目，尝试从知识库ID开始构建
      if (rootItems.length === 0) {
        console.log('从parent_id=0没有找到项目，尝试从知识库ID开始构建...')
        rootItems = buildHierarchy(wikiItems, rootId)
      }
      
      wikiStructure.value = rootItems
      
      // 为所有文件夹添加展开状态
      const addExpandedState = (items: any[]) => {
        items.forEach(item => {
          if (item.type === WikiType.FOLDER) {
            item.isExpanded = true // 默认展开
          }
          if (item.children && item.children.length > 0) {
            addExpandedState(item.children)
          }
        })
      }
      addExpandedState(wikiStructure.value)
      
      console.log('知识库文件层级结构加载完成:', wikiStructure.value)
      console.log('wikiStructure长度:', wikiStructure.value.length)
      
      // 调试：显示所有找到的项目
      console.log('所有项目详情:')
      wikiItems.forEach(item => {
        console.log(`ID: ${item.ID}, title: ${item.title}, type: ${item.type}, parent_id: ${item.parent_id}, root_id: ${item.root_id}`)
      })
      
      // 调试：显示层级结构
      console.log('层级结构详情:')
      const logHierarchy = (items: any[], level: number = 0) => {
        items.forEach(item => {
          const indent = '  '.repeat(level)
          console.log(`${indent}${item.title} (ID: ${item.ID}, type: ${item.type}, children: ${item.children?.length || 0})`)
          if (item.children && item.children.length > 0) {
            logHierarchy(item.children, level + 1)
          }
        })
      }
      logHierarchy(wikiStructure.value)
    } else {
      console.error('API返回错误:', response.msg)
      // 加载测试数据
      loadMockStructure()
    }
  } catch (error) {
    console.error('加载知识库文件列表失败:', error)
    // 网络错误时加载测试数据
    loadMockStructure()
  }
}

// 加载测试文件数据
const loadMockStructure = () => {
  console.log('不再加载示例文件数据...')
  // 不再加载示例数据，保持空数组
  wikiStructure.value = []
  console.log('知识库文件结构已清空')
}

const selectNode = (node: WikiItem) => {
  selectedNode.value = node
  activeTab.value = 'preview'
}

const handleItemClick = (item: any) => {
  if (item.type === WikiType.FOLDER) {
    // 点击文件夹：进入文件夹
    enterFolder(item)
  } else if (item.type === WikiType.ARTICLE) {
    // 点击文件：显示文件详情
    selectNode(item)
  }
}

const enterFolder = (folder: any) => {
  // 更新当前路径
  currentPath.value.push(folder)
  currentFolderId.value = folder.ID
  
  // 重新加载当前文件夹的内容
  loadCurrentFolderContent()
}

const goBackToParent = () => {
  if (currentPath.value.length > 0) {
    currentPath.value.pop()
    currentFolderId.value = currentPath.value.length > 0 
      ? currentPath.value[currentPath.value.length - 1].ID 
      : 0
    
    // 重新加载内容
    loadCurrentFolderContent()
  }
}

const loadCurrentFolderContent = () => {
  if (!currentWiki.value) return
  
  // 根据当前文件夹ID过滤显示内容
  const allItems = wikiStructure.value
  const currentItems = allItems.filter(item => 
    item.parent_id === currentFolderId.value
  )
  
  // 更新显示的内容
  wikiStructure.value = currentItems
}

// 处理导航器项目点击
const handleNavigatorItemClick = (item: WikiItem) => {
  if (item.type === WikiType.ARTICLE) {
    // 点击文件，显示文件详情
    selectNode(item)
  }
}

// 处理导航器文件夹展开/收起
const handleNavigatorFolderToggle = (item: WikiItem, isExpanded: boolean) => {
  console.log('文件夹展开/收起:', item.title, isExpanded)
  // 这里可以添加额外的逻辑，比如保存展开状态到本地存储
}

// 处理当前文件夹变化
const handleCurrentFolderChange = (folderId: number) => {
  console.log('当前文件夹已改变:', folderId)
  currentSelectedFolderId.value = folderId
}

// 返回根目录
const goBackToRoot = () => {
  currentPath.value = []
  currentFolderId.value = 0
  // 重新加载根目录数据
  loadWikiStructure()
}

const toggleFolder = (folder: any) => {
  folder.isExpanded = !folder.isExpanded
  console.log('切换文件夹展开状态:', folder.title, folder.isExpanded)
}

const getNodeIcon = (type: WikiType) => {
  switch (type) {
    case WikiType.KNOWLEDGE_BASE:
      return '📚'
    case WikiType.FOLDER:
      return '📂'
    case WikiType.ARTICLE:
      return '📄'
    default:
      return '📄'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

const formatWikiDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getItemCount = (item: any) => {
  if (item.type === WikiType.FOLDER) {
    return item.children ? item.children.length : 0
  }
  return 1
}

// 获取文件类型
const getFileType = (url: string): string => {
  if (!url) return ''
  const extension = url.split('.').pop()?.toLowerCase()
  return extension || ''
}

const renderContent = (content: string, fileType?: string) => {
  if (!content) return ''
  
  // 处理可能的编码问题
  let processedContent = content
  
  // 如果是PDF内容，可能需要特殊处理
  if (fileType === 'pdf') {
    // 检查是否有乱码字符
    if (content.includes('') || content.includes('\\u')) {
      console.warn('检测到可能的编码问题，尝试修复...')
      // 尝试修复常见的编码问题
      try {
        // 如果是JSON字符串，尝试解析
        if (content.trim().startsWith('"') && content.trim().endsWith('"')) {
          processedContent = JSON.parse(content)
        }
      } catch (e) {
        console.warn('无法修复编码问题:', e)
      }
    }
    
    // PDF内容通常是文本，按行处理
    return processedContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('<br>')
  } else if (fileType === 'md' || fileType === 'markdown') {
    // Markdown 渲染
    return processedContent
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\n/g, '<br>')
  } else if (fileType === 'txt') {
    // 纯文本渲染
    return processedContent.replace(/\n/g, '<br>')
  } else {
    // 默认渲染
    return processedContent.replace(/\n/g, '<br>')
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // 检查文件类型
    const allowedTypes = [
      'application/pdf',
      // 常见 Markdown MIME 类型
      'text/markdown',
      'application/markdown',
      'text/x-markdown',
      // 某些环境下 .md 可能被识别为纯文本或通用流
      'text/plain',
      'application/octet-stream',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    // 兼容按扩展名识别 .md/.markdown
    const name = (file.name || '').toLowerCase()
    const ext = name.split('.').pop() || ''
    const extAllowed = ['md', 'markdown', 'pdf', 'doc', 'docx', 'txt']

    if (!allowedTypes.includes(file.type) && !extAllowed.includes(ext)) {
      alert('不支持的文件类型，请选择 PDF、Markdown、Word 或 TXT 文件')
      target.value = ''
      return
    }
    
    // 检查文件大小（限制为50MB）
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert('文件大小不能超过50MB')
      target.value = ''
      return
    }
    
    console.log('选择的文件:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified)
    })
    
    uploadForm.value.file = file
  }
}

const createWikiItem = async () => {
  if (!currentWiki.value) return
  
  try {
    // 确定是文件上传还是URL输入
    const isFileUpload = !!uploadForm.value.file
    const isUrlInput = !!uploadForm.value.url.trim()
    
    if (!isFileUpload && !isUrlInput) {
      alert('请选择文件或输入网址')
      return
    }
    
    const parentId = currentSelectedFolderId.value && currentSelectedFolderId.value > 0
      ? currentSelectedFolderId.value
      : currentWiki.value.ID

    const params: CreateWikiParams = {
      title: uploadForm.value.title.trim(),
      parent_id: parentId, // 根目录时用知识库ID
      wiki_type: 0,
      root_id: currentWiki.value.ID, // 文件的root_id始终指向知识库ID
      url: isUrlInput ? uploadForm.value.url.trim() : '', // 文件上传时传空字符串，后端会返回文件路径
      file: isFileUpload ? uploadForm.value.file! : undefined, // 如果是文件上传，传文件；否则不传
      type: '2' // type=2表示文章
    }
    
    console.log('创建Wiki参数:', params)
    console.log('当前知识库ID:', currentWiki.value.ID)
    console.log('当前parentId:', currentSelectedFolderId.value)
    console.log('上传类型:', isFileUpload ? '文件上传' : 'URL输入')
    console.log('文件信息:', isFileUpload ? {
      name: uploadForm.value.file!.name,
      type: uploadForm.value.file!.type,
      size: uploadForm.value.file!.size
    } : '无文件')
    
    const response = await createWiki(params)
    console.log('创建Wiki响应:', response)
    const code = getVal((response as any)?.code ?? (response as any)?.data?.code)
    const msg  = getVal((response as any)?.msg  ?? (response as any)?.data?.msg)
    console.log('响应数据详情:', { code, msg })
    
  
      alert('创建成功')
      showUploadModal.value = false
      uploadForm.value = { title: '', file: null, url: '' }
      await loadWikiStructure()
   
  } catch (error) {
    console.error('创建Wiki失败:', error)
    alert('创建失败，请检查网络或稍后再试')
  } finally {
    creatingWiki.value = false
  }
}

const createFolder = async () => {
  if (!currentWiki.value) return
  
  try {
    creatingFolder.value = true
    const parentId2 = currentSelectedFolderId.value && currentSelectedFolderId.value > 0
      ? currentSelectedFolderId.value
      : currentWiki.value.ID

    const params: CreateWikiParams = {
      title: folderForm.value.title.trim(),
      parent_id: parentId2, // 根目录时用知识库ID
      wiki_type: 0,
      root_id: currentWiki.value.ID, // 文件夹的root_id始终指向知识库ID
      url: '',
      type: '1' // type=1表示文件夹
    }
    
    console.log('创建文件夹参数:', params)
    console.log('当前知识库ID:', currentWiki.value.ID)
    console.log('当前parentId:', currentSelectedFolderId.value)
    
    const response = await createWiki(params)
    console.log('创建文件夹响应:', response)
    const code = getVal((response as any)?.code ?? (response as any)?.data?.code)
    const msg  = getVal((response as any)?.msg  ?? (response as any)?.data?.msg)
    console.log('响应数据详情:', { code, msg })
 
    alert('创建成功')
    showCreateFolderModal.value = false
    folderForm.value.title = ''
    await loadWikiStructure()
    
  } catch (error) {
    console.error('创建文件夹失败:', error)
    alert('创建失败，请检查网络或稍后再试')
  } finally {
    creatingFolder.value = false
  }
}

const editNode = (node: WikiItem) => {
  // 实现编辑功能
  console.log('编辑节点:', node)
}

const deleteNode = async (id: number) => {
  if (!confirm('确定要删除这个项目吗？')) return
  
  try {
    const response = await deleteWiki(id)
    if (response.code === 1000) {
      if (selectedNode.value?.ID === id) {
        selectedNode.value = null
      }
      await loadWikiStructure()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const goBack = () => {
  router.push('/wiki')
}

// 生命周期
onMounted(() => {
  loadWikiDetail()
})
</script>

<style scoped>
.wiki-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.wiki-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
}

.wiki-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wiki-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wiki-title .icon {
  font-size: 28px;
  color: #4096ff;
}

.wiki-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.wiki-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wiki-id {
  color: #4096ff;
  font-weight: 500;
}

.wiki-date, .wiki-update {
  color: #9ca3af;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
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

.wiki-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.file-list-panel {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #f3f4f6;
}

.list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #1d2129;
}

.file-list {
  flex: 1;
  overflow-y: auto;
}

/* 浅色主题文件列表 */
.file-list {
  flex: 1;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.list-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: #3b82f6;
}

.breadcrumb-item:first-child {
  color: #3b82f6;
  font-weight: 500;
}

.separator {
  color: #d1d5db;
  margin: 0 0.25rem;
}

.folder-name {
  color: #374151;
  font-weight: 500;
}

.list-items {
  flex: 1;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.list-item:hover {
  background: #f8fafc;
}

.list-item.selected {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.list-item.child-item {
  margin-left: 2rem;
  border-left: 2px solid #3b82f6;
  padding-left: 1rem;
}

.item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.85rem;
}

.item-count {
  color: #4b5563;
  font-weight: 500;
}

.item-date {
  color: #9ca3af;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.list-item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
}

.empty-list .empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-list p {
  margin: 4px 0;
  font-size: 14px;
}

.empty-list .empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.content-header h2 {
  margin: 0;
  color: #1d2129;
  font-size: 20px;
  font-weight: 600;
}

.content-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
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

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #4096ff;
  border-bottom-color: #4096ff;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.preview-content {
  line-height: 1.6;
  color: #374151;
}

.preview-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem 0;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.preview-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem 0;
  color: #1f2937;
}

.preview-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #374151;
}

.preview-content strong {
  font-weight: 600;
  color: #1f2937;
}

.preview-content em {
  font-style: italic;
  color: #6b7280;
}

.preview-content code {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

.preview-content pre {
  background: #1f2937;
  color: #f9fafb;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.preview-content pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.no-content {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-content p {
  margin: 0.5rem 0;
}

.file-path {
  font-family: 'Monaco', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
}

.preview-content :deep(strong) {
  font-weight: 600;
}

.preview-content :deep(em) {
  font-style: italic;
}

.preview-content :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.source-content pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
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
  overflow: hidden; /* 改为hidden，让内容区域自己处理滚动 */
  display: flex;
  flex-direction: column;
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
  flex: 1;
  overflow-y: auto; /* 内容区域可以滚动 */
  min-height: 0; /* 确保flex布局正常工作 */
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

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.file-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.file-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.url-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.required {
  color: #ef4444;
  font-weight: 600;
}

.error-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #ef4444;
}

.file-input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
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

/* 导航器容器样式 */
.navigator-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.navigator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.navigator-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.back-to-root-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.back-to-root-btn:hover {
  background: #2563eb;
}

.back-to-root-btn .icon {
  font-size: 1rem;
}
</style>
