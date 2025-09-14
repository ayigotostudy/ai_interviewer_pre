<template>
  <div class="monaco-editor-container">
    <div ref="editorContainer" class="monaco-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

interface Props {
  modelValue: string
  language?: string
  theme?: string
  readOnly?: boolean
  height?: string
  options?: any
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown',
  theme: 'vs-dark',
  readOnly: false,
  height: '500px',
  options: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'ready': [editor: monaco.editor.IStandaloneCodeEditor]
}>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 默认编辑器配置
const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  value: props.modelValue,
  language: props.language,
  theme: props.theme,
  readOnly: props.readOnly,
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  renderLineHighlight: 'line',
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: false,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8
  },
  fontSize: 14,
  fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, monospace',
  lineHeight: 1.6,
  padding: { top: 16, bottom: 16 },
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  trimAutoWhitespace: true,
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true
  },
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: true,
  smoothScrolling: true,
  mouseWheelZoom: true,
  contextmenu: true,
  selectOnLineNumbers: true,
  roundedSelection: false,
  occurrencesHighlight: 'singleFile',
  selectionHighlight: true,
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: 'never',
    seedSearchStringFromSelection: 'selection'
  },
  ...props.options
}

// 初始化编辑器
const initEditor = async () => {
  if (!editorContainer.value) return

  try {
    editor = monaco.editor.create(editorContainer.value, defaultOptions)

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || ''
      emit('update:modelValue', value)
      emit('change', value)
    })

    // 监听编辑器准备就绪
    emit('ready', editor)

    // 设置键盘快捷键
    setupKeyboardShortcuts()

  } catch (error) {
    console.error('Monaco Editor initialization failed:', error)
  }
}

// 设置键盘快捷键
const setupKeyboardShortcuts = () => {
  if (!editor) return

  // 添加自定义快捷键
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    // Ctrl/Cmd + S 保存
    const value = editor?.getValue() || ''
    emit('change', value)
  })

  // 添加Markdown常用快捷键
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
    // Ctrl/Cmd + B 加粗
    insertMarkdownFormat('**', '**')
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
    // Ctrl/Cmd + I 斜体
    insertMarkdownFormat('*', '*')
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    // Ctrl/Cmd + K 链接
    insertMarkdownFormat('[', '](url)')
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
    // Ctrl/Cmd + H 标题
    insertMarkdownFormat('# ', '')
  })
}

// 插入Markdown格式
const insertMarkdownFormat = (prefix: string, suffix: string) => {
  if (!editor) return

  const selection = editor.getSelection()
  if (!selection) return

  const selectedText = editor.getModel()?.getValueInRange(selection) || ''
  const newText = `${prefix}${selectedText}${suffix}`
  
  editor.executeEdits('markdown-format', [{
    range: selection,
    text: newText,
    forceMoveMarkers: true
  }])

  // 调整光标位置
  const newSelection = {
    startLineNumber: selection.startLineNumber,
    startColumn: selection.startColumn + prefix.length,
    endLineNumber: selection.endLineNumber,
    endColumn: selection.endColumn + prefix.length
  }
  editor.setSelection(newSelection)
  editor.focus()
}

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
})

watch(() => props.readOnly, (newReadOnly) => {
  if (editor) {
    editor.updateOptions({ readOnly: newReadOnly })
  }
})

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()
  initEditor()
})

// 组件卸载时清理
onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})

// 暴露编辑器实例
defineExpose({
  editor: () => editor,
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
  getSelection: () => editor?.getSelection(),
  setSelection: (selection: any) => editor?.setSelection(selection)
})
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  background: white;
  transition: all 0.3s ease;
}

.monaco-editor-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.monaco-editor {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* 自定义Monaco Editor主题 */
:global(.monaco-editor .margin) {
  background-color: #f8fafc !important;
}

:global(.monaco-editor .monaco-editor-background) {
  background-color: #ffffff !important;
}

:global(.monaco-editor .view-lines) {
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', monospace !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .monaco-editor {
    min-height: 300px;
  }
}
</style>
