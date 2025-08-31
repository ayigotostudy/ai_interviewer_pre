<template>
  <div class="knowledge-navigator">
    <!-- 现代美观的文件管理器视图 -->
    <div class="file-explorer">
      <!-- 工具栏 -->
      <div class="toolbar">
        <button class="tool-btn" @click="goBackToParent" :disabled="navigationStack.length === 0">
          <i class="icon">←</i> 返回上级
        </button>
        <button class="tool-btn" @click="goBackToRoot" :disabled="navigationStack.length === 0">
          <i class="icon">🏠</i> 返回根目录
        </button>
        <div class="path-display">
          <span class="path-label">当前位置：</span>
          <span class="path-text">{{ getCurrentPathText() }}</span>
        </div>
      </div>
      
      <!-- 文件列表 -->
      <div class="file-grid">
        <div 
          v-for="item in treeData" 
          :key="item.ID"
          class="file-item"
          :class="{ 'is-folder': item.type === WikiType.FOLDER, 'is-file': item.type === WikiType.ARTICLE }"
          @click="handleItemClick(item)"
        >
          <div class="file-icon">
            <i class="icon">{{ getFileIcon(item) }}</i>
          </div>
          <div class="file-content">
            <div class="file-name">{{ item.title }}</div>
            <div class="file-info">
              <span v-if="item.type === WikiType.FOLDER" class="folder-count">
                {{ getItemCount(item) }}个项目
              </span>
              <span class="file-date">{{ formatDate(item.UpdatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="treeData.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <p>此文件夹暂无内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  getWikiList,
  getWikiListByParent,
  getFileContent,
  type WikiItem,
  WikiType
} from '@/service/wiki'


// Props
interface Props {
  rootId: number
  currentPath?: WikiItem[]
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: () => []
})

// Emits
const emit = defineEmits<{
  'item-click': [item: WikiItem]
  'folder-toggle': [item: WikiItem, isExpanded: boolean]
  'current-folder-change': [folderId: number]
}>()

// 清理标题中的双引号
const cleanTitle = (title: string) => {
  return title.replace(/^"|"$/g, '')
}

// 响应式数据
const currentItems = ref<WikiItem[]>([])
const currentParentId = ref<number>(0)
const navigationStack = ref<{id: number, title: string}[]>([])

// 计算属性：构建树形数据
const treeData = computed(() => {
  if (!props.rootId || currentItems.value.length === 0) return []
  
  return currentItems.value
    .filter(item => 
      // 只过滤类型，不需要过滤root_id，因为API已经返回了正确的数据
      (item.type === WikiType.FOLDER || item.type === WikiType.ARTICLE)
    )
    .map(item => ({
      ...item,
      title: cleanTitle(item.title),
      children: []
    }))
    .sort((a, b) => {
      if (a.type !== b.type) {
        if (a.type === WikiType.FOLDER) return -1
        if (b.type === WikiType.FOLDER) return 1
      }
      return a.title.localeCompare(b.title)
    })
})

// 加载数据 - 进入知识库时调用
const loadData = async (parentId: number = 0) => {
  try {
    console.log('加载知识库数据，parentId:', parentId)
    // 使用正确的接口：根据parentId获取列表
    const response = await getWikiListByParent(parentId)
    if (response.code === 1000 && response.data) {
      currentItems.value = response.data
      currentParentId.value = parentId
      
      if (parentId === 0) {
        navigationStack.value = []
      }
      
      console.log('加载到的数据:', response.data)
    }
  } catch (error) {
    console.error('加载知识库数据失败:', error)
  }
}

// 进入文件夹 - 点击文件夹时调用
const enterFolder = async (folderId: number, folderTitle: string) => {
  try {
    console.log('进入文件夹:', folderTitle, 'ID:', folderId)
    
    navigationStack.value.push({
      id: folderId,
      title: folderTitle
    })
    
    // 使用正确的接口：根据parentId获取列表
    const response = await getWikiListByParent(folderId)
    if (response.code === 1000 && response.data) {
      currentItems.value = response.data
      currentParentId.value = folderId
      
      // 通知父组件当前文件夹已改变
      emit('current-folder-change', folderId)
      
      console.log('文件夹数据:', response.data)
    }
  } catch (error) {
    console.error('进入文件夹失败:', error)
  }
}

// 返回上级目录
const goBackToParent = async () => {
  if (navigationStack.value.length > 0) {
    navigationStack.value.pop()
    
    if (navigationStack.value.length > 0) {
      const parentFolder = navigationStack.value[navigationStack.value.length - 1]
      await enterFolder(parentFolder.id, parentFolder.title)
    } else {
      await loadData(props.rootId) // 返回知识库根目录
      // 通知父组件当前文件夹已改变为根目录
      emit('current-folder-change', props.rootId)
    }
  }
}

// 返回根目录
const goBackToRoot = () => {
  navigationStack.value = []
  loadData(props.rootId) // 返回知识库根目录
  // 通知父组件当前文件夹已改变为根目录
  emit('current-folder-change', props.rootId)
}

// 跳转到指定文件夹
const goToFolder = async (folderId: number, folderTitle: string) => {
  const folderIndex = navigationStack.value.findIndex(item => item.id === folderId)
  if (folderIndex !== -1) {
    navigationStack.value = navigationStack.value.slice(0, folderIndex + 1)
    await enterFolder(folderId, folderTitle)
  }
}

// 处理项目点击
const handleItemClick = async (item: WikiItem) => {
  if (item.type === WikiType.FOLDER) {
    // 点击文件夹，进入该文件夹
    await enterFolder(item.ID, item.title)
  } else if (item.type === WikiType.ARTICLE) {
    // 点击文件，获取文件内容并触发item-click事件
    try {
      console.log('点击文件，URL路径:', item.url)
      console.log('文件信息:', {
        id: item.ID,
        title: item.title,
        type: item.type,
        url: item.url
      })
      
      const fileContent = await getFileContent(item.url)
      console.log('获取到的文件内容长度:', fileContent?.length || 0)
      
      // 将文件内容添加到item对象中
      const itemWithContent = {
        ...item,
        content: fileContent
      }
      emit('item-click', itemWithContent)
    } catch (error) {
      console.error('获取文件内容失败:', error)
      console.error('文件URL:', item.url)
      // 即使获取失败也触发事件，让父组件处理
      emit('item-click', item)
    }
  }
}

// 获取文件图标
const getFileIcon = (item: any) => {
  if (item.type === WikiType.FOLDER) {
    return '📁'
  } else if (item.type === WikiType.ARTICLE) {
    // 根据wikiType显示不同图标
    switch (item.wiki_type) {
      case 1:
        return '📄' // 文档图标
      case 2:
        return '📝' // Markdown图标
      case 3:
        return '🔗' // 链接图标
      default:
        return '📄' // 默认文档图标
    }
  }
  return '📄'
}

// 获取项目数量
const getItemCount = (item: any) => {
  if (item.type === WikiType.FOLDER) {
    return item.children ? item.children.length : 0
  }
  return 0
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

// 获取当前路径文本
const getCurrentPathText = () => {
  if (navigationStack.value.length === 0) {
    return '知识库根目录'
  }
  return navigationStack.value.map(item => item.title).join(' / ')
}



// 监听rootId变化
watch(() => props.rootId, () => {
  if (props.rootId) {
    loadData(props.rootId) // 使用知识库ID作为parentId
    // 通知父组件当前文件夹已改变为根目录
    emit('current-folder-change', props.rootId)
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (props.rootId) {
    loadData(props.rootId) // 使用知识库ID作为parentId
    // 通知父组件当前文件夹已改变为根目录
    emit('current-folder-change', props.rootId)
  }
})
</script>

<style scoped>
.knowledge-navigator {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.navigator-header {
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

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb-btn {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.breadcrumb-btn:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.breadcrumb-btn:first-child {
  color: #3b82f6;
  font-weight: 500;
}

.separator {
  color: #d1d5db;
  margin: 0 0.25rem;
}

.back-section {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.navigator-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 现代美观的文件管理器样式 */
.file-explorer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tool-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.path-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.path-label {
  color: #64748b;
  font-size: 0.875rem;
}

.path-text {
  color: #334155;
  font-weight: 600;
  font-size: 0.875rem;
}

.file-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  overflow-y: auto;
  background: #fafafa;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 80px;
}

.file-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.file-item.is-folder:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #0ea5e9;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.15);
}

.file-item.is-file:hover {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #22c55e;
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
}

.file-icon {
  font-size: 2.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  flex-shrink: 0;
}

.file-item.is-folder .file-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
}

.file-item.is-file .file-icon {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.file-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
}

.folder-count {
  color: #0ea5e9;
  font-weight: 600;
  background: rgba(14, 165, 233, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
}

.file-date {
  color: #94a3b8;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
