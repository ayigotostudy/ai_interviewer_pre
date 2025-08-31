# KnowledgeNavigator 组件使用说明

## 功能概述

`KnowledgeNavigator.vue` 是一个专门为知识库设计的Windows风格文件管理器组件，支持按层级获取数据、文件夹导航、文件预览等功能。

## 组件特性

### 1. 层级展示
- 进入知识库时，通过知识库ID获取第一层数据（文件夹和文件）
- 点击文件夹时，发送文件夹ID到后端获取下一层级数据
- 支持逐层深入，每次点击文件夹都获取该层级的子数据
- 维护导航栈，支持快速返回上级或根目录

### 2. Windows风格界面
- 网格布局显示文件和文件夹
- 工具栏包含返回上级、返回根目录按钮
- 路径显示当前所在位置
- 悬停效果和视觉反馈

### 3. 图标与样式
- **type=0（知识库）**：📚 类似 FolderOpened 的图标
- **type=1（文件夹）**：📁 Folder 图标
- **type=2（文章）**：根据 `wikiType` 显示不同图标
  - `wikiType=1`（文档）：📄 Document 图标
  - `wikiType=2`（md文字）：📝 Notebook 图标
  - `wikiType=3`（文章链接）：🔗 Link 图标

### 4. 信息展示
每个列表项显示：
- 图标 + 标题 (title)
- 文件夹右侧显示子项数量（例如 "18个项目"）
- 最后更新日期（MM/DD 格式）

### 5. 交互功能
- 点击文件夹进入该文件夹，显示其内容
- 点击文件自动获取文件内容，然后触发 `@item-click` 事件
- 支持面包屑导航，快速跳转到任意层级
- 支持返回上级和返回根目录功能

### 6. 文件内容获取
- 点击文件时自动调用 `GET /wiki/file?path={文件路径}` 接口
- 获取文件内容后，将内容添加到文件对象中
- 即使获取失败也会触发事件，让父组件处理错误情况

## 使用方法

### 基本用法

```vue
<template>
  <KnowledgeNavigator 
    :root-id="currentWikiId"
    :current-path="currentPath"
    @item-click="handleItemClick"
    @folder-toggle="handleFolderToggle"
  />
</template>

<script setup>
import KnowledgeNavigator from '@/components/KnowledgeNavigator.vue'

const currentWikiId = ref(1)
const currentPath = ref([])

const handleItemClick = (item) => {
  console.log('点击了文件:', item)
  // 处理文件点击，显示文件详情
}

const handleFolderToggle = (item, isExpanded) => {
  console.log('文件夹展开/收起:', item.title, isExpanded)
  // 处理文件夹展开/收起
}
</script>
```

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `rootId` | `number` | - | 当前知识库的ID（必需） |
| `currentPath` | `WikiItem[]` | `[]` | 当前路径，用于面包屑导航 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `item-click` | `item: WikiItem` | 点击文件时触发 |
| `folder-toggle` | `item: WikiItem, isExpanded: boolean` | 文件夹展开/收起时触发 |

## 数据结构

组件期望的数据结构：

```typescript
interface WikiItem {
  ID: number
  title: string
  type: WikiType // 0: 知识库, 1: 文件夹, 2: 文章
  wiki_type: number // 1: 文档, 2: md文字, 3: 文章链接
  parent_id: number
  root_id: number
  CreatedAt: string
  UpdatedAt: string
  // ... 其他字段
}
```

## 样式定制

组件使用 scoped 样式，主要样式类：

- `.knowledge-navigator` - 主容器
- `.navigator-header` - 头部区域
- `.navigator-content` - 内容区域
- `.tree-container` - 树形容器
- `.tree-item` - 树形项目

## 注意事项

1. 确保传入的 `rootId` 是有效的知识库ID
2. 组件会自动调用 `getWikiList()` API 获取数据
3. 文件夹展开状态默认是收起的
4. 组件会自动清理标题中的双引号
5. 支持空状态显示

## 依赖

- Vue 3 Composition API
- TypeScript
- `@/service/wiki` 中的 API 接口
- `TreeNode.vue` 子组件
