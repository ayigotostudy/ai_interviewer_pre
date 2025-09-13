<template>
  <div class="canvas-test-container">
    <div class="test-header">
      <h1>Canvas编辑器测试</h1>
      <button @click="goBack" class="back-btn">返回</button>
    </div>
    
    <div class="test-content">
      <CanvasResumeEditor 
        :resume-data="testResumeData" 
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CanvasResumeEditor from '@/components/CanvasResumeEditor.vue'

const router = useRouter()

const testResumeData = ref({
  name: 'FE-Czy 模板演示',
  content: `# 蔡朝阳
24岁 | 硕士 | 山东青岛 | 13187654321 | touchczy@outlook.com

## 教育经历
山东科技大学
2016.09-2020.07 本科 计算机科学与技术
2020.09-2023.07 硕士 计算机技术

## 技能清单
掌握：HTML, CSS, JavaScript, PHP
熟悉：Vue, React, uniapp, ThinkPHP
了解：小程序, Python, Java, Weex

## 实习经历
腾讯 IEG-PC游戏平台部
2021.07-2021.09
负责直播功能开发与上线，组件封装，单元测试(覆盖率99.7%)，学习性能优化、开发流程、CI/CD流水线、云规划等

## 项目经历
**书小二小程序** (2020-12 至今)
前端uniapp，后端ThinkPHP API，管理后台Vue，PHP持久内存Swoole，微信支付

**文本复制脚本** (2020-06 至今)
个人Greasemonkey脚本，ts+rollup构建，130万安装量，470 GitHub star，专注绕过网站复制限制，包括CSS、事件、Canvas等实现

**山科小站小程序** (2019-03 至今)
校园小程序，4.4万用户，日活峰值1.7万，uniapp-cli框架，支持微信、QQ、Android跨平台编译，模块化组件化开发，表单验证，异步请求处理`,
  template_id: 1
})

const goBack = () => {
  router.go(-1)
}

const handleSave = (data: any) => {
  console.log('保存数据:', data)
  alert('测试保存成功！')
}
</script>

<style scoped>
.canvas-test-container {
  min-height: 100vh;
  background: #F8FAFC;
}

.test-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
}

.back-btn {
  background: #F3F4F6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #E5E7EB;
}

.test-content {
  padding: 0;
}
</style>
