<template>
  <div class="tutorial-container">
    <div class="tutorial-header">
      <h2>🎨 Canvas简历编辑器使用教程</h2>
      <button @click="toggleTutorial" class="close-btn">
        <span>{{ isExpanded ? '收起' : '展开' }}</span>
        <span class="icon">{{ isExpanded ? '▲' : '▼' }}</span>
      </button>
    </div>

    <div v-if="isExpanded" class="tutorial-content">
      <div class="tutorial-section">
        <h3>📋 快速开始</h3>
        <div class="step-list">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>选择模板</strong>
              <p>在左侧"模板"标签页中选择一个简历模板，点击即可应用</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>编辑内容</strong>
              <p>点击Canvas上的文本元素进行编辑，或使用工具栏添加新元素</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>调整样式</strong>
              <p>选中元素后，在右侧面板调整字体、颜色、对齐等样式</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <strong>保存导出</strong>
              <p>点击"保存简历"保存到系统，或"导出图片"下载PNG文件</p>
            </div>
          </div>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>🛠️ 详细操作指南</h3>
        
        <div class="guide-item">
          <h4>📝 添加文本</h4>
          <div class="guide-content">
            <p>1. 点击工具栏中的"添加文本"按钮</p>
            <p>2. 在弹出框中输入文本内容</p>
            <p>3. 文本将出现在Canvas中央，可拖拽移动位置</p>
          </div>
        </div>

        <div class="guide-item">
          <h4>🖼️ 添加图片</h4>
          <div class="guide-content">
            <p>1. 点击工具栏中的"添加图片"按钮</p>
            <p>2. 选择本地图片文件上传</p>
            <p>3. 图片将自动调整大小并添加到Canvas</p>
          </div>
        </div>

        <div class="guide-item">
          <h4>🔷 添加形状</h4>
          <div class="guide-content">
            <p>1. 点击工具栏中的"添加形状"按钮</p>
            <p>2. 系统会自动添加一个矩形形状</p>
            <p>3. 可用于装饰或分隔内容区域</p>
          </div>
        </div>

        <div class="guide-item">
          <h4>✏️ 编辑元素</h4>
          <div class="guide-content">
            <p>1. 点击Canvas上的任意元素进行选中</p>
            <p>2. 选中的元素会显示蓝色边框和控制点</p>
            <p>3. 在右侧面板中修改内容和样式</p>
            <p>4. 拖拽元素可改变位置</p>
          </div>
        </div>

        <div class="guide-item">
          <h4>🎨 样式调整</h4>
          <div class="guide-content">
            <p><strong>字体大小：</strong>调整文字大小（8-72px）</p>
            <p><strong>颜色：</strong>点击颜色选择器修改文字颜色</p>
            <p><strong>对齐方式：</strong>选择左对齐、居中或右对齐</p>
            <p><strong>字重：</strong>选择正常或粗体</p>
          </div>
        </div>

        <div class="guide-item">
          <h4>📋 页面结构</h4>
          <div class="guide-content">
            <p>1. 切换到"结构"标签页查看所有元素</p>
            <p>2. 点击结构列表中的元素可快速选中</p>
            <p>3. 方便管理复杂的简历布局</p>
          </div>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>💡 使用技巧</h3>
        <div class="tips-list">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span>使用网格线辅助对齐，让简历更整齐</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🎯</span>
            <span>先选择模板再编辑，可以节省大量时间</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📐</span>
            <span>保持元素间距一致，提升视觉效果</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🎨</span>
            <span>使用统一的颜色和字体，保持风格一致</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📱</span>
            <span>定期保存，避免意外丢失编辑内容</span>
          </div>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>❓ 常见问题</h3>
        <div class="faq-list">
          <div class="faq-item">
            <h4>Q: 如何删除元素？</h4>
            <p>A: 选中元素后，在右侧面板点击"删除元素"按钮，或按Delete键</p>
          </div>
          <div class="faq-item">
            <h4>Q: 可以撤销操作吗？</h4>
            <p>A: 目前版本暂不支持撤销功能，建议定期保存</p>
          </div>
          <div class="faq-item">
            <h4>Q: 如何调整元素大小？</h4>
            <p>A: 选中元素后，拖拽边框上的控制点可以调整大小</p>
          </div>
          <div class="faq-item">
            <h4>Q: 支持哪些图片格式？</h4>
            <p>A: 支持JPG、PNG、GIF等常见图片格式</p>
          </div>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>🚀 高级功能</h3>
        <div class="advanced-features">
          <div class="feature-item">
            <h4>模板系统</h4>
            <p>提供多种专业模板，包括技术、商务、创意等风格</p>
          </div>
          <div class="feature-item">
            <h4>实时预览</h4>
            <p>所有修改都会实时显示在Canvas上，所见即所得</p>
          </div>
          <div class="feature-item">
            <h4>导出功能</h4>
            <p>支持导出为PNG图片，方便分享和打印</p>
          </div>
          <div class="feature-item">
            <h4>响应式设计</h4>
            <p>适配不同屏幕尺寸，移动端也能正常使用</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isExpanded = ref(false)

const toggleTutorial = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.tutorial-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.tutorial-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tutorial-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tutorial-content {
  padding: 2rem;
}

.tutorial-section {
  margin-bottom: 2rem;
}

.tutorial-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  background: #3B82F6;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  color: #1F2937;
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.step-content p {
  margin: 0;
  color: #6B7280;
  font-size: 0.9rem;
  line-height: 1.5;
}

.guide-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #F8FAFC;
  border-radius: 8px;
  border-left: 4px solid #3B82F6;
}

.guide-item h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.guide-content p {
  margin: 0.5rem 0;
  color: #4B5563;
  font-size: 0.9rem;
  line-height: 1.5;
}

.tips-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #F0F9FF;
  border-radius: 8px;
  border: 1px solid #E0F2FE;
}

.tip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.tip-item span:last-child {
  color: #1E40AF;
  font-size: 0.9rem;
  font-weight: 500;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  padding: 1rem;
  background: #FEF3C7;
  border-radius: 8px;
  border-left: 4px solid #F59E0B;
}

.faq-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #92400E;
}

.faq-item p {
  margin: 0;
  color: #92400E;
  font-size: 0.9rem;
  line-height: 1.5;
}

.advanced-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.feature-item {
  padding: 1rem;
  background: #ECFDF5;
  border-radius: 8px;
  border: 1px solid #D1FAE5;
}

.feature-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #065F46;
}

.feature-item p {
  margin: 0;
  color: #047857;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tutorial-content {
    padding: 1rem;
  }
  
  .step-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tips-list {
    grid-template-columns: 1fr;
  }
  
  .advanced-features {
    grid-template-columns: 1fr;
  }
}
</style>
