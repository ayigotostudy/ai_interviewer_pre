<template>
  <div class="test-container">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面，说明路由工作正常</p>
    
    <div class="test-buttons">
      <button @click="toggleMode" class="test-btn">
        {{ isEditing ? '切换到预览模式' : '切换到编辑模式' }}
      </button>
    </div>
    
    <div v-if="isEditing" class="editor-test">
      <h2>编辑模式</h2>
      <textarea v-model="content" placeholder="输入一些内容..."></textarea>
      <div class="preview-test">
        <h3>预览：</h3>
        <div v-html="parsedContent"></div>
      </div>
    </div>
    
    <div v-else class="preview-test">
      <h2>预览模式</h2>
      <div v-html="parsedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EnhancedMarkdownParser } from '@/utils/MarkdownParser'

const isEditing = ref(false)
const content = ref(`# 测试标题
这是一个测试内容

## 测试分区
- 列表项1
- 列表项2

**粗体文字**`)

const parsedContent = computed(() => {
  return EnhancedMarkdownParser.parse(content.value)
})

const toggleMode = () => {
  isEditing.value = !isEditing.value
}
</script>

<style scoped>
.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-buttons {
  margin: 20px 0;
}

.test-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.test-btn:hover {
  background: #0056b3;
}

.editor-test {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.editor-test textarea {
  width: 100%;
  height: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: monospace;
}

.preview-test {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  background: #f9f9f9;
}

.preview-test h3 {
  margin-top: 0;
  color: #333;
}
</style>
