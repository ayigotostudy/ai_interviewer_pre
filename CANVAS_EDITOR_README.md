# Canvas简历编辑器集成说明

## 概述

本项目已成功集成了基于Canvas的简历编辑器，参考了开源项目 [CanvasEditor](https://github.com/WindrunnerMax/CanvasEditor) 的设计理念和功能特性。

## 主要特性

### 1. 双模式编辑
- **Canvas模式**：基于Canvas的图形化编辑，支持拖拽、缩放、样式调整
- **Markdown模式**：传统的文本编辑模式，支持实时预览

### 2. Canvas编辑器功能
- ✅ 模板选择（经典、现代、创意、专业）
- ✅ 文本元素添加和编辑
- ✅ 图片元素添加
- ✅ 形状元素添加
- ✅ 元素样式调整（字体、颜色、对齐等）
- ✅ 元素拖拽移动
- ✅ 元素删除
- ✅ 导出为图片

### 3. 数据安全
- 纯前端实现，数据存储在本地
- 支持Canvas内容与Markdown内容互转
- 保持与现有API的兼容性

## 文件结构

```
src/
├── components/
│   └── CanvasResumeEditor.vue    # 主要的Canvas编辑器组件
├── services/
│   └── CanvasEditorService.ts    # Canvas编辑器核心服务
├── views/
│   └── resume/
│       ├── Edit.vue              # 更新后的编辑页面
│       └── CanvasTest.vue        # Canvas编辑器测试页面
```

## 使用方法

### 1. 访问Canvas编辑器

在简历列表页面点击"测试Canvas编辑器"按钮，或直接访问：
```
/resume/canvas-test
```

### 2. 编辑简历

1. **切换模式**：点击"切换到Canvas编辑"按钮
2. **选择模板**：从下拉菜单选择简历模板
3. **添加元素**：
   - 点击"添加文本"添加文本块
   - 点击"添加图片"上传图片
   - 点击"添加形状"添加几何形状
4. **编辑元素**：
   - 点击选中元素
   - 在右侧面板调整样式和内容
   - 拖拽移动元素位置
5. **保存**：点击"保存简历"按钮

### 3. 导出功能

- **导出图片**：点击"导出图片"按钮下载PNG格式
- **保存数据**：Canvas内容会自动转换为Markdown格式保存

## 技术实现

### CanvasEditorService 核心功能

```typescript
// 创建编辑器实例
const canvasEditor = new CanvasEditorService(canvasElement)

// 应用模板
canvasEditor.applyTemplate('classic')

// 添加元素
canvasEditor.addTextElement(x, y, '文本内容')
canvasEditor.addImageElement(x, y, imageUrl)
canvasEditor.addShapeElement(x, y, 'rectangle')

// 更新元素
canvasEditor.updateElementContent('新内容')
canvasEditor.updateElementStyle({ fontSize: 18, color: '#000' })

// 导出
const imageData = canvasEditor.exportToImage('png')
```

### 元素类型

```typescript
interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'line'
  x: number
  y: number
  width: number
  height: number
  content: string
  style: {
    fontSize?: number
    fontFamily?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: 'normal' | 'bold'
  }
  rotation?: number
  zIndex: number
}
```

## 模板系统

### 预定义模板

1. **经典模板** (`classic`)
   - A4尺寸 (595x842)
   - 居中标题
   - 传统布局

2. **现代简约** (`modern`)
   - A4尺寸 (595x842)
   - 左对齐标题
   - 简洁设计

### 自定义模板

可以通过修改 `CanvasEditorService.ts` 中的 `templates` 数组来添加新模板：

```typescript
const templates: CanvasTemplate[] = [
  {
    id: 'custom',
    name: '自定义模板',
    page: {
      width: 595,
      height: 842,
      backgroundColor: '#ffffff',
      margin: { top: 40, right: 40, bottom: 40, left: 40 }
    },
    elements: [
      // 定义模板元素
    ]
  }
]
```

## 与现有系统集成

### 1. 数据兼容性

Canvas编辑器与现有的Markdown系统完全兼容：
- Canvas内容可以导出为Markdown格式
- 现有的Markdown内容可以导入到Canvas编辑器
- 保存的数据格式与现有API完全一致

### 2. 渐进式迁移

- 保留原有的Markdown编辑功能
- 用户可以选择使用Canvas编辑或Markdown编辑
- 支持两种模式之间的无缝切换

## 未来扩展

### 计划功能

1. **PDF导出**：集成jsPDF库实现真正的PDF导出
2. **更多元素类型**：线条、表格、图表等
3. **图层管理**：支持多图层编辑
4. **撤销/重做**：操作历史管理
5. **快捷键支持**：键盘快捷键操作
6. **模板市场**：在线模板下载和分享

### 技术优化

1. **性能优化**：大量元素时的渲染优化
2. **内存管理**：Canvas资源清理和回收
3. **响应式设计**：移动端适配
4. **无障碍支持**：键盘导航和屏幕阅读器支持

## 故障排除

### 常见问题

1. **Canvas不显示**：检查浏览器是否支持Canvas API
2. **元素无法选中**：确保点击在元素区域内
3. **样式不生效**：检查元素是否被正确选中
4. **导出失败**：检查浏览器是否支持toDataURL方法

### 调试模式

在浏览器控制台中可以使用以下命令进行调试：

```javascript
// 获取Canvas编辑器实例
const editor = window.canvasEditor

// 查看当前元素
console.log(editor.getCanvasData())

// 导出当前画布
const data = editor.exportToImage('png')
```

## 贡献指南

如需扩展Canvas编辑器功能，请遵循以下原则：

1. **保持向后兼容**：确保新功能不影响现有功能
2. **遵循现有架构**：使用CanvasEditorService进行核心功能扩展
3. **添加类型定义**：为新的元素类型和功能添加TypeScript类型
4. **编写测试**：为新功能添加相应的测试用例
5. **更新文档**：及时更新相关文档和注释

## 参考资源

- [CanvasEditor 原项目](https://github.com/WindrunnerMax/CanvasEditor)
- [Canvas API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Vue 3 组合式API](https://vuejs.org/guide/composition-api/)
- [TypeScript 类型系统](https://www.typescriptlang.org/docs/)
