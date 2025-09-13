<template>
  <div class="canvas-resume-editor">
    <div class="editor-header">
      <div class="header-actions">
        <button class="mode-switch-btn" @click="toggleMode">
          {{ isCanvasMode ? '切换到Markdown编辑' : '切换到Canvas编辑' }}
        </button>
        <button class="save-btn" @click="saveResume" :disabled="saving">
          <span v-if="saving" class="loading-spinner"></span>
          {{ saving ? '保存中...' : '保存简历' }}
        </button>
      </div>
    </div>

    <div class="editor-container">
      <!-- 使用教程 - 只在Canvas模式下显示 -->
      <CanvasEditorTutorial v-if="isCanvasMode" />
      
      <!-- Canvas编辑器区域 -->
      <div v-if="isCanvasMode" class="canvas-editor-area">
        <div class="canvas-toolbar">
          <div class="toolbar-tabs">
            <button 
              class="tab-btn active" 
              @click="activeTab = 'template'"
              :class="{ active: activeTab === 'template' }"
            >
              模板
            </button>
            <button 
              class="tab-btn" 
              @click="activeTab = 'structure'"
              :class="{ active: activeTab === 'structure' }"
            >
              结构
            </button>
          </div>

          <div v-if="activeTab === 'template'" class="toolbar-content">
            <div class="toolbar-section">
              <h4>模板选择</h4>
              <div class="template-grid">
                <div 
                  v-for="template in availableTemplates" 
                  :key="template.id"
                  class="template-item"
                  :class="{ active: selectedTemplate === template.id }"
                  @click="selectTemplate(template.id)"
                >
                  <div class="template-preview">
                    <div class="template-name">{{ template.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'structure'" class="toolbar-content">
            <div class="toolbar-section">
              <h4>页面结构</h4>
              <div class="structure-list">
                <div 
                  v-for="element in elements" 
                  :key="element.id"
                  class="structure-item"
                  :class="{ active: selectedElement?.id === element.id }"
                  @click="selectElement(element)"
                >
                  <span class="element-type">{{ getElementTypeName(element.type) }}</span>
                  <span class="element-content">{{ element.content.substring(0, 20) }}...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="toolbar-section">
            <h4>页面设置</h4>
            <div class="page-settings">
              <label>
                页面大小：
                <select v-model="pageSize">
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </label>
              <label>
                方向：
                <select v-model="pageOrientation">
                  <option value="portrait">纵向</option>
                  <option value="landscape">横向</option>
                </select>
              </label>
            </div>
          </div>

          <div class="toolbar-section">
            <h4>操作</h4>
            <div class="action-buttons">
              <button @click="addTextBlock" class="action-btn">添加文本</button>
              <button @click="addImageBlock" class="action-btn">添加图片</button>
              <button @click="addShapeBlock" class="action-btn">添加形状</button>
            </div>
          </div>

          <!-- 元素编辑区域 -->
          <div v-if="selectedElement" class="toolbar-section">
            <h4>编辑元素</h4>
            <div class="element-editor">
              <div class="form-group">
                <label>内容：</label>
                <textarea 
                  v-model="elementContent" 
                  @input="updateElementContent"
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>字体大小：</label>
                <input 
                  v-model.number="elementStyle.fontSize" 
                  @input="updateElementStyle"
                  type="number" 
                  class="form-input"
                  min="8"
                  max="72"
                />
              </div>
              
              <div class="form-group">
                <label>颜色：</label>
                <input 
                  v-model="elementStyle.color" 
                  @input="updateElementStyle"
                  type="color" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label>对齐：</label>
                <select 
                  v-model="elementStyle.textAlign" 
                  @change="updateElementStyle"
                  class="form-select"
                >
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>字重：</label>
                <select 
                  v-model="elementStyle.fontWeight" 
                  @change="updateElementStyle"
                  class="form-select"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
              
              <button @click="deleteSelectedElement" class="action-btn delete-btn">
                删除元素
              </button>
            </div>
          </div>
        </div>

        <div class="canvas-container">
          <canvas 
            id="canvas-editor"
            ref="canvasRef" 
            :width="canvasWidth" 
            :height="canvasHeight"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @click="handleCanvasClick"
          ></canvas>
        </div>
      </div>

      <!-- Markdown编辑器区域（增强版） -->
      <div v-else class="markdown-editor-area">
        <!-- 顶部工具栏 -->
        <div class="editor-toolbar">
          <div class="toolbar-controls">
            <div class="control-group">
              <label>预览字体大小</label>
              <div class="control-input">
                <input 
                  type="range" 
                  v-model="fontSize" 
                  min="10" 
                  max="24" 
                  step="1"
                  class="slider"
                >
                <span class="control-value">{{ fontSize }}px</span>
              </div>
            </div>
            <div class="control-group">
              <label>预览行间距</label>
              <div class="control-input">
                <input 
                  type="range" 
                  v-model="lineHeight" 
                  min="1.0" 
                  max="3.0" 
                  step="0.1"
                  class="slider"
                >
                <span class="control-value">{{ lineHeight }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 两栏内容区域 -->
        <div class="editor-content">
          <div class="editor-form">
            <div class="form-section">
              <h3>内容（Markdown）</h3>
              <div class="form-group">
              <textarea 
                v-model="resumeData.content"
                placeholder="# 标题、## 分区、- 列表 等支持实时预览

支持 ::: 区块语法：
::: start
**公司名称**
:::
**职位名称**
:::
**工作时间**
::: end
工作描述内容..."
                class="form-textarea"
                rows="20"
              ></textarea>
                <div class="form-help">
                  右侧实时预览，支持 Markdown 粗体、标题、列表等
                  <br>
                  <strong>新增：</strong>支持 ::: 区块语法，用于工作经历和项目经历的格式化显示
                </div>
              </div>
            </div>
          </div>

          <div class="resume-preview">
            <div class="preview-header">
              <h3>实时预览（增强版）</h3>
              <div class="template-badge">
                模板：{{ getTemplateName(resumeData.template_id) }}
              </div>
            </div>
            <div class="preview-content">
              <div 
                id="resume-preview" 
                class="resume-container dynamic-font" 
                :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight }"
                v-html="enhancedMarkdownPreview"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch, computed } from 'vue'
// import ResumeShow from './ResumeShow.vue' // 暂时注释，使用增强的Markdown解析器
import CanvasEditorTutorial from './CanvasEditorTutorial.vue'
import { CanvasEditorService, type CanvasElement } from '@/services/CanvasEditorService'
import { EnhancedMarkdownParser } from '@/utils/MarkdownParser'

// Props
const props = defineProps<{
  resumeData: {
    name: string
    content: string
    template_id: number
    [key: string]: any
  }
}>()

// Emits
const emit = defineEmits<{
  save: [data: any]
}>()

// 编辑器模式
const isCanvasMode = ref(false)
const saving = ref(false)

// 字体调节
const fontSize = ref(14) // 字体大小
const lineHeight = ref(1.6) // 行间距

// Canvas相关
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(800)
const canvasHeight = ref(1000)
const selectedTemplate = ref('classic')
const pageSize = ref('A4')
const pageOrientation = ref('portrait')

// Canvas编辑器服务
let canvasEditor: CanvasEditorService | null = null
const selectedElement = ref<CanvasElement | null>(null)
const elementContent = ref('')
const elementStyle = ref({
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  color: '#000000',
  textAlign: 'left' as 'left' | 'center' | 'right',
  fontWeight: 'normal' as 'normal' | 'bold'
})

// 界面状态
const activeTab = ref<'template' | 'structure'>('template')
const elements = ref<CanvasElement[]>([])
const availableTemplates = ref([
  { id: 'fe_czy', name: 'FE-Czy' },
  { id: 'classic', name: '经典模板' },
  { id: 'modern', name: '现代简约' },
  { id: 'creative', name: '创意设计' },
  { id: 'professional', name: '专业商务' }
])

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

// 切换编辑模式
const toggleMode = () => {
  isCanvasMode.value = !isCanvasMode.value
  if (isCanvasMode.value) {
    nextTick(() => {
      initCanvas()
    })
  }
}

// 初始化Canvas
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 设置画布尺寸
  canvas.width = canvasWidth.value
  canvas.height = canvasHeight.value

  // 创建Canvas编辑器服务
  canvasEditor = new CanvasEditorService(canvas)

  // 应用选中的模板
  canvasEditor.applyTemplate(selectedTemplate.value)

  // 如果有现有内容，可以尝试解析并添加到Canvas
  if (props.resumeData.content) {
    // 这里可以实现Markdown到Canvas元素的转换
    // 暂时保持简单实现
  }

  // 监听选中元素变化
  watch(() => canvasEditor?.getCanvasData().selectedElement, (newElement) => {
    selectedElement.value = newElement || null
    if (newElement) {
      elementContent.value = newElement.content
      elementStyle.value = { ...elementStyle.value, ...newElement.style }
    }
  })

// 监听元素列表变化
watch(() => canvasEditor?.getCanvasData().elements, (newElements) => {
  elements.value = newElements || []
}, { deep: true })
}
// 增强的Markdown预览
const enhancedMarkdownPreview = computed(() => {
  let content = props.resumeData.content || ''
  
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


// 这些函数已经移到CanvasEditorService中，这里保留空实现

// 添加文本块
const addTextBlock = () => {
  if (!canvasEditor) return

  const text = prompt('请输入文本内容：', '新文本')
  if (!text) return

  canvasEditor.addElement('text', text)
}

// 添加图片块
const addImageBlock = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (!canvasEditor) return
      canvasEditor.addElement('image', e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// 添加形状块
const addShapeBlock = () => {
  if (!canvasEditor) return
  canvasEditor.addElement('shape', 'rectangle')
}


// 更新选中元素的内容
const updateElementContent = () => {
  if (!canvasEditor || !selectedElement.value) return
  canvasEditor.updateElement(selectedElement.value.id, { content: elementContent.value })
}

// 更新选中元素的样式
const updateElementStyle = () => {
  if (!canvasEditor || !selectedElement.value) return
  canvasEditor.updateElement(selectedElement.value.id, { style: elementStyle.value })
}

// 删除选中元素
const deleteSelectedElement = () => {
  if (!canvasEditor || !selectedElement.value) return
  canvasEditor.deleteElement(selectedElement.value.id)
  selectedElement.value = null
  elementContent.value = ''
}

// 应用模板
const applyTemplate = () => {
  if (!canvasEditor) return
  canvasEditor.applyTemplate(selectedTemplate.value)
  updateElementsList()
}

// 选择模板
const selectTemplate = (templateId: string) => {
  selectedTemplate.value = templateId
  applyTemplate()
}

// 选择元素
const selectElement = (element: CanvasElement) => {
  selectedElement.value = element
  elementContent.value = element.content
  elementStyle.value = { ...elementStyle.value, ...element.style }
}

// 更新元素列表
const updateElementsList = () => {
  if (!canvasEditor) return
  const data = canvasEditor.getCanvasData()
  elements.value = data.elements
}

// 获取元素类型名称
const getElementTypeName = (type: string) => {
  const typeMap: { [key: string]: string } = {
    'text': '文本',
    'image': '图片',
    'shape': '形状',
    'line': '线条'
  }
  return typeMap[type] || '未知'
}

// 鼠标事件处理（已移到CanvasEditorService中）
const handleMouseDown = (_e: MouseEvent) => {
  // 已移到CanvasEditorService中
}

const handleMouseMove = (_e: MouseEvent) => {
  // 已移到CanvasEditorService中
}

const handleMouseUp = (_e: MouseEvent) => {
  // 已移到CanvasEditorService中
}

const handleCanvasClick = (_e: MouseEvent) => {
  // 已移到CanvasEditorService中
}

// 保存简历
const saveResume = async () => {
  saving.value = true
  
  try {
    // 如果是Canvas模式，需要将Canvas内容转换为数据
    let content = props.resumeData.content
    
    if (isCanvasMode.value) {
      // 这里可以实现Canvas到Markdown的转换
      // 暂时保持原有内容
      content = props.resumeData.content
    }

    const data = {
      ...props.resumeData,
      content,
      template_id: isCanvasMode.value ? getTemplateId(selectedTemplate.value) : props.resumeData.template_id
    }

    emit('save', data)
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}


// 获取模板ID
const getTemplateId = (template: string) => {
  const templateMap: { [key: string]: number } = {
    'classic': 1,
    'modern': 2,
    'creative': 3,
    'professional': 4
  }
  return templateMap[template] || 1
}

// 组件挂载时初始化
onMounted(() => {
  if (isCanvasMode.value) {
    nextTick(() => {
      initCanvas()
    })
  }
})

// 组件销毁时清理资源
onUnmounted(() => {
  if (canvasEditor) {
    canvasEditor.destroy()
  }
})
</script>

<style scoped>
/* 专业简历样式 - 匹配图片效果 */
:deep(.resume-container) {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  background: white;
  max-width: 210mm;
  margin: 0 auto;
  padding: 32pt 28pt;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* 动态字体样式，优先级更高 */
::deep(.resume-container.dynamic-font) {
  font-size: inherit !important;
  line-height: inherit !important;
}

:deep(.resume-container .resume-title) {
  font-size: 18pt;
  font-weight: 700;
  margin: 0 0 16pt 0;
  text-align: center;
  line-height: 1.2;
  color: #1e40af;
}

:deep(.resume-container .section-title) {
  font-size: 14pt;
  font-weight: 600;
  margin: 20pt 0 12pt 0;
  padding-bottom: 4pt;
  border-bottom: 2pt solid #3b82f6;
  color: #1e40af;
}

:deep(.resume-container .contact-info) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 20pt 0;
  padding: 0;
}

:deep(.resume-container .contact-item) {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 9pt;
  color: #374151;
  white-space: nowrap;
  font-weight: 500;
}

:deep(.resume-container .tech-stack-section) {
  margin: 12pt 0;
}

:deep(.resume-container .tech-tags) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8pt;
}

:deep(.resume-container .tech-tag) {
  display: inline-block;
  padding: 3px 8px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 12px;
  font-size: 10pt;
  font-weight: 500;
  border: 1px solid #d1d5db;
}

:deep(.resume-container .experience-item) {
  margin-bottom: 16pt;
  padding: 0;
  background: transparent;
}

:deep(.resume-container .experience-header) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  margin-bottom: 8pt;
  width: 100% !important;
  justify-content: space-between !important;
}

/* 一个元素：左对齐 */
:deep(.resume-container .experience-header.one-item) {
  justify-content: flex-start !important;
}

/* 两个元素：两边对齐 */
:deep(.resume-container .experience-header.two-items) {
  justify-content: space-between !important;
}

:deep(.resume-container .experience-line) {
  display: flex !important;
  align-items: center !important;
  font-size: 11pt;
  line-height: 1.3;
  margin: 0 !important;
}

:deep(.resume-container .experience-line.company) {
  font-size: 12pt;
  font-weight: 600;
  color: #1a1a1a;
  flex: 0 0 auto !important;
  text-align: left !important;
  margin-right: auto !important;
}

:deep(.resume-container .experience-line.position) {
  font-size: 11pt;
  font-weight: 600;
  color: #374151;
  flex: 1 !important;
  text-align: center !important;
  justify-content: center !important;
}

:deep(.resume-container .experience-line.duration) {
  font-size: 10pt;
  color: #6b7280;
  font-weight: 600;
  flex: 0 0 auto !important;
  text-align: right !important;
  margin-left: auto !important;
}

:deep(.resume-container .description) {
  font-size: 11pt;
  color: #000;
  margin: 8pt 0 0 0;
  line-height: 1.5;
  text-align: left;
}

:deep(.resume-container .achievement) {
  font-size: 10pt;
  color: #4b5563;
  margin: 0;
  line-height: 1.4;
  font-style: italic;
  padding-left: 12pt;
  border-left: 2px solid #e5e7eb;
}

:deep(.resume-container .experience-list) {
  margin: 8pt 0 0 0;
  padding-left: 1em;
  list-style: disc;
}

:deep(.resume-container .experience-list li) {
  margin-bottom: 4pt;
  line-height: 1.5;
  color: #2d3748;
  padding: 0;
  position: relative;
  background: transparent;
  border-radius: 0;
  border-left: none;
  transition: none;
  font-size: 11pt;
  list-style-type: disc;
  margin-left: 1em;
}

:deep(.resume-container .experience-list li:hover) {
  background: transparent;
  transform: none;
  box-shadow: none;
}

:deep(.resume-container .experience-list li::before) {
  display: none;
}

:deep(.resume-container .section-content) {
  font-size: 11pt;
  color: #000;
  margin: 0 0 8pt 0;
  line-height: 1.5;
}

:deep(.resume-container .highlight-keyword) {
  background: #f3f4f6;
  color: #1a1a1a;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 0.95em;
  border: 1px solid #d1d5db;
}

:deep(.resume-container strong) {
  font-weight: 700;
  color: #000;
}
.canvas-resume-editor {
  min-height: 100vh;
  background: #F8FAFC;
  padding: 0 20px;
}

.editor-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 1rem 2rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.mode-switch-btn {
  background: #2563EB;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-switch-btn:hover {
  background: #1D4ED8;
}

.save-btn {
  background: #10B981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}



.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.editor-container {
  width: 100%;
  margin: 0;
  padding: 1rem 0;
}

/* Canvas编辑器样式 */
.canvas-editor-area {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.canvas-toolbar {
  background: #F8FAFC;
  padding: 0;
  border-right: 1px solid #E5E7EB;
  overflow-y: auto;
  width: 280px;
}

.toolbar-tabs {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  background: white;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: #F8FAFC;
  color: #374151;
}

.tab-btn.active {
  color: #2563EB;
  border-bottom-color: #2563EB;
  background: #F8FAFC;
}

.toolbar-content {
  padding: 1.5rem;
}

.toolbar-section {
  margin-bottom: 2rem;
}

.toolbar-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.template-item {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.template-item:hover {
  border-color: #D1D5DB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-item.active {
  border-color: #2563EB;
  background: #EBF4FF;
}

.template-preview {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.template-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

.structure-list {
  max-height: 300px;
  overflow-y: auto;
}

.structure-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.structure-item:hover {
  border-color: #D1D5DB;
  background: #F8FAFC;
}

.structure-item.active {
  border-color: #2563EB;
  background: #EBF4FF;
}

.element-type {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.element-content {
  font-size: 0.75rem;
  color: #9CA3AF;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-settings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-settings label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #374151;
}

.page-settings select {
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #E5E7EB;
}

.delete-btn {
  background: #FEE2E2;
  color: #DC2626;
  border-color: #FECACA;
}

.delete-btn:hover {
  background: #FECACA;
}

.element-editor {
  background: #F8FAFC;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.element-editor .form-group {
  margin-bottom: 1rem;
}

.element-editor .form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

.element-editor .form-input,
.element-editor .form-select,
.element-editor .form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 0.8rem;
}

.element-editor .form-textarea {
  resize: vertical;
  min-height: 60px;
}

.canvas-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f5f5f5;
  min-height: 600px;
}

canvas {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  cursor: crosshair;
  transition: all 0.3s ease;
}

canvas:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Markdown编辑器样式（两栏布局） */
.markdown-editor-area {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: calc(100vh - 120px);
}

.editor-toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.toolbar-controls {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
  white-space: nowrap;
}

.control-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slider {
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background: #dee2e6;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.control-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  min-width: 40px;
  text-align: center;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  min-height: 0;
}

.editor-form {
  padding: 2rem;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  background: white;
  transition: all 0.3s ease;
  resize: none;
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-help {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6B7280;
  font-style: italic;
}

.resume-preview {
  background: white;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(100vh - 120px);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
}

.template-badge {
  padding: 0.5rem 1rem;
  background: #DBEAFE;
  color: #1E40AF;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.preview-content {
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .canvas-resume-editor {
    padding: 0 10px;
  }
  
  .canvas-editor-area,
  .markdown-editor-area {
    grid-template-columns: 1fr;
  }
  
  .canvas-toolbar {
    border-right: none;
    border-bottom: 1px solid #E5E7EB;
  }
}

@media (max-width: 768px) {
  .editor-container {
    padding: 1rem;
  }
  
  .canvas-editor-area,
  .markdown-editor-area {
    border-radius: 8px;
  }
  
  .editor-form,
  .resume-preview {
    padding: 1rem;
  }
  
  .editor-content {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  .editor-toolbar {
    padding: 0.75rem 1rem;
  }
  
  .toolbar-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .control-group {
    width: 100%;
  }
  
  .control-input {
    justify-content: space-between;
  }
  
  .slider {
    flex: 1;
    margin-right: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
