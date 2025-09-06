import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 添加调试日志
console.log('🚀 Easy Offer 应用启动中...')
console.log('📍 当前环境:', import.meta.env.MODE)
console.log('🌐 基础路径:', import.meta.env.BASE_URL)
console.log('📦 应用版本:', import.meta.env.VITE_APP_VERSION || 'dev')

// 创建Pinia实例
const pinia = createPinia()

// 创建Vue应用实例
const app = createApp(App)

// 安装插件
app.use(router)
app.use(pinia)

// 挂载应用
console.log('🎯 正在挂载应用到 #app...')
app.mount('#app')
console.log('✅ 应用挂载完成!')