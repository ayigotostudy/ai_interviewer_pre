<template>
  <div class="tree-node" :class="{ 'is-folder': isFolder, 'is-expanded': node.isExpanded }">
    <div 
      class="node-content"
      :class="{ 'is-folder': isFolder, 'is-file': isFile }"
      @click="handleClick"
    >
      <!-- 展开/收起图标 -->
      <div v-if="isFolder" class="expand-icon" @click.stop="toggleExpand">
        <i class="icon">{{ node.isExpanded ? '▼' : '▶' }}</i>
      </div>
      <div v-else-if="node.hasChildren" class="expand-icon">
        <i class="icon">▶</i>
      </div>
      <div v-else class="expand-placeholder"></div>
      
      <!-- 节点图标 -->
      <div class="node-icon">
        <i class="icon">{{ getNodeIcon() }}</i>
      </div>
      
      <!-- 节点信息 -->
      <div class="node-info">
        <div class="node-title">{{ node.title }}</div>
        <div class="node-meta">
          <span v-if="isFolder" class="item-count">{{ getItemCount() }}个项目</span>
          <span class="update-date">{{ formatDate(node.UpdatedAt) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="isFolder && node.isExpanded" class="children-container">
      <div 
        v-for="child in node.children" 
        :key="child.ID"
        class="child-node"
      >
        <TreeNode 
          :node="child" 
          :current-path="[...currentPath, node]"
          @item-click="$emit('item-click', $event)"
          @folder-toggle="$emit('folder-toggle', $event, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type WikiItem, WikiType } from '@/service/wiki'

// Props
interface Props {
  node: any
  currentPath: WikiItem[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'item-click': [item: WikiItem]
  'folder-toggle': [item: WikiItem, isExpanded: boolean]
}>()

// 计算属性
const isFolder = computed(() => 
  props.node.type === WikiType.KNOWLEDGE_BASE || props.node.type === WikiType.FOLDER
)

const isFile = computed(() => props.node.type === WikiType.ARTICLE)

// 获取节点图标
const getNodeIcon = () => {
  const { type, wiki_type } = props.node
  
  switch (type) {
    case WikiType.KNOWLEDGE_BASE:
      return '📚' // 知识库图标
    case WikiType.FOLDER:
      return '📁' // 文件夹图标
    case WikiType.ARTICLE:
      // 根据wikiType显示不同图标
      switch (wiki_type) {
        case 1:
          return '📄' // 文档图标
        case 2:
          return '📝' // Markdown图标
        case 3:
          return '🔗' // 链接图标
        default:
          return '📄' // 默认文档图标
      }
    default:
      return '📄'
  }
}

// 获取项目数量
const getItemCount = () => {
  if (!isFolder.value) return 0
  return props.node.children ? props.node.children.length : 0
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

// 处理点击
const handleClick = () => {
  if (isFile.value) {
    // 点击文件，触发item-click事件
    emit('item-click', props.node)
  } else if (isFolder.value) {
    // 点击文件夹，触发folder-toggle事件
    const newExpandedState = !props.node.isExpanded
    emit('folder-toggle', props.node, newExpandedState)
  }
}

// 切换展开状态
const toggleExpand = () => {
  if (isFolder.value || props.node.hasChildren) {
    const newExpandedState = !props.node.isExpanded
    emit('folder-toggle', props.node, newExpandedState)
  }
}
</script>

<style scoped>
.tree-node {
  display: flex;
  flex-direction: column;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-height: 2.5rem;
}

.node-content:hover {
  background: #f3f4f6;
}

.node-content.is-folder {
  font-weight: 500;
}

.node-content.is-file {
  cursor: pointer;
}

.node-content.is-file:hover {
  background: #eff6ff;
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.75rem;
  transition: color 0.2s ease;
}

.expand-icon:hover {
  color: #3b82f6;
}

.expand-placeholder {
  width: 16px;
}

.node-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.node-title {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.item-count {
  color: #3b82f6;
  font-weight: 500;
}

.update-date {
  color: #9ca3af;
}

.children-container {
  margin-left: 1.5rem;
  border-left: 1px solid #e5e7eb;
  padding-left: 0.75rem;
}

.child-node {
  margin-bottom: 0.125rem;
}

/* 展开/收起动画 */
.children-container {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 知识库特殊样式 */
.node-content.is-folder .node-title {
  color: #1f2937;
  font-weight: 600;
}

.node-content.is-folder .node-icon {
  color: #3b82f6;
}

/* 文件夹样式 */
.node-content:not(.is-file) .node-icon {
  color: #f59e0b;
}

/* 文件样式 */
.node-content.is-file .node-icon {
  color: #10b981;
}
</style>
