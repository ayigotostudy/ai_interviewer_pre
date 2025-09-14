<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <div class="logo">
          <img src="/offer.png" alt="Easy Offer" />
        </div>
        <h1>Easy Offer</h1>
        <p>智能简历创建 · 面试管理助手</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="请输入您的邮箱"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input-group">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="togglePassword"
              :disabled="loading"
            >
              <span class="password-icon">{{ showPassword ? '👁️' : '🙈' }}</span>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="form-footer">
        <p>还没有账号？</p>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/service/user'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = ref({
  email: '',
  password: ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = '请填写完整的登录信息'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await login({
      email: form.value.email,
      password: form.value.password
    })

    console.log('登录响应:', response)
    
    // API返回格式：{ code: 1000, msg: "success", data: { token: "..." } }
    if (response.data.code === 1000 || response.data.code === '1000') {
      // 保存token和用户名
      const token = response.data.data.token
      console.log('response.data:', response.data)
      console.log('保存的token:', token)
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', form.value.email.split('@')[0] || '用户')
      
      console.log('登录成功，准备跳转到dashboard')
      // 跳转到仪表盘
      router.push('/dashboard')
    } else {
      error.value = response.data.msg || '登录失败，请检查邮箱和密码'
      console.log('登录失败，错误码:', response.data.code, '错误信息:', response.data.msg)
    }
  } catch (err: any) {
    console.error('登录失败:', err)
    error.value = err.response?.data?.msg || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563EB 0%, #1E40AF 50%, #1E3A8A 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  margin-bottom: 1rem;
}

.logo img {
  width: 80px;
  height: 80px;
  border-radius: 20px;
}

.logo-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1F2937;
}

.logo-section p {
  margin: 0;
  color: #6B7280;
  font-size: 0.9rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input:disabled {
  background-color: #F9FAFB;
  cursor: not-allowed;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  padding-right: 3rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle-btn:hover {
  background-color: #F3F4F6;
}

.password-toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.password-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.error-message {
  background: #FEF2F2;
  color: #DC2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #FECACA;
}

.login-btn {
  width: 100%;
  padding: 0.875rem 1rem;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background: #1D4ED8;
  transform: translateY(-1px);
}

.login-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  transform: none;
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

.form-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.form-footer p {
  margin: 0 0 0.5rem 0;
  color: #6B7280;
  font-size: 0.9rem;
}

.register-link {
  color: #2563EB;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #1D4ED8;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem 1.5rem;
  }
}
</style>
