# 知识库模块

## 功能概述

知识库模块是一个完整的个人知识管理系统，允许用户上传、组织和管理各种类型的文档，并支持基于知识库内容的智能问答。

## 主要功能

### 1. 知识库管理
- **创建知识库**：用户可以创建多个知识库来组织不同类型的知识
- **知识库列表**：查看和管理所有知识库
- **知识库编辑**：修改知识库名称和基本信息

### 2. 文件管理
- **文件上传**：支持上传 PDF、Markdown、Word、TXT 格式文件
- **URL导入**：支持通过URL导入网页内容
- **文件夹创建**：在知识库内创建文件夹来组织文件
- **文件树结构**：直观的树形结构显示文件组织

### 3. 内容查看
- **文件预览**：支持Markdown内容的实时预览
- **源码查看**：查看原始文件内容
- **文件编辑**：编辑文件内容（待实现）

### 4. 智能问答
- **知识库问答**：基于知识库内容进行智能问答
- **多知识库支持**：可以选择不同的知识库进行问答
- **聊天界面**：类似QQ的聊天界面，支持对话历史
- **快捷问题**：提供常用问题的快捷入口

## 技术架构

### 前端技术栈
- **Vue 3**：使用 Composition API
- **TypeScript**：类型安全
- **Vue Router**：路由管理
- **Axios**：HTTP请求

### 组件结构
```
src/
├── service/
│   └── wiki.ts          # 知识库API服务
├── components/
│   └── WikiNav.vue      # 知识库导航组件
└── views/wiki/
    ├── Index.vue        # 知识库列表页
    ├── Detail.vue       # 知识库详情页
    └── Query.vue        # 知识库问答页
```

### API接口
- `POST /wiki` - 创建Wiki项目
- `GET /wiki` - 获取Wiki详情
- `GET /wiki/list` - 获取Wiki列表
- `POST /wiki/query` - 知识库问答
- `DELETE /wiki` - 删除Wiki项目
- `PUT /wiki` - 更新Wiki项目

## 数据结构

### Wiki类型枚举
```typescript
enum WikiType {
  KNOWLEDGE_BASE = 0, // 知识库（根节点）
  FOLDER = 1,         // 文件夹
  ARTICLE = 2         // 文章
}
```

### Wiki项目接口
```typescript
interface WikiItem {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: null | string
  title: string
  url: string
  type: WikiType
  parent_id: number
  wiki_type: number
  user_id: number
  root_id: number
}
```

## 使用流程

### 1. 创建知识库
1. 在Dashboard点击"知识库"卡片
2. 点击"新建知识库"按钮
3. 输入知识库名称和描述
4. 点击"创建"完成

### 2. 上传文件
1. 进入知识库详情页
2. 点击"上传文件"按钮
3. 选择文件或输入URL
4. 输入文件标题
5. 点击"上传"完成

### 3. 创建文件夹
1. 在知识库详情页点击"新建文件夹"
2. 输入文件夹名称
3. 点击"创建"完成

### 4. 知识库问答
1. 点击"知识库问答"导航
2. 选择要查询的知识库
3. 输入问题或选择快捷问题
4. 查看AI回答

## 特色功能

### 1. 智能文件组织
- 支持树形结构组织文件
- 直观的文件类型图标
- 拖拽排序（待实现）

### 2. 实时预览
- Markdown内容实时渲染
- 支持预览和源码切换
- 语法高亮显示

### 3. 智能问答
- 基于知识库内容的精准回答
- 支持自然语言提问
- 聊天式交互体验

### 4. 响应式设计
- 适配桌面和移动设备
- 流畅的动画效果
- 现代化的UI设计

## 未来规划

### 短期目标
- [ ] 文件拖拽上传
- [ ] 文件内容编辑功能
- [ ] 文件搜索功能
- [ ] 文件版本管理

### 中期目标
- [ ] 知识库分享功能
- [ ] 协作编辑功能
- [ ] 知识图谱可视化
- [ ] 多语言支持

### 长期目标
- [ ] AI内容摘要
- [ ] 智能标签推荐
- [ ] 知识关联分析
- [ ] 移动端APP

## 注意事项

1. **文件大小限制**：建议单个文件不超过10MB
2. **支持格式**：PDF、Markdown、Word、TXT、网页URL
3. **存储空间**：注意知识库的存储空间使用
4. **数据备份**：定期备份重要的知识库内容

## 开发说明

### 环境要求
- Node.js >= 16
- Vue 3
- TypeScript

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 代码规范
- 使用TypeScript进行类型检查
- 遵循Vue 3 Composition API规范
- 使用ESLint进行代码质量检查
- 组件命名使用PascalCase
- 文件命名使用kebab-case
