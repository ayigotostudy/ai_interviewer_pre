<template>
  <div class="resume-edit-container">
    <div class="edit-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <span class="icon">←</span>
          返回
        </button>
        <h1>编辑简历</h1>
        <div class="header-actions">
          <button class="save-btn" @click="saveResume" :disabled="saving">
            <span class="icon">{{ saving ? '⏳' : '💾' }}</span>
            {{ saving ? '保存中...' : '保存简历' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 使用新的Canvas编辑器组件 -->
    <CanvasResumeEditor 
      :resume-data="resumeData" 
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createResume, updateResume, getResumeDetail } from '@/service/resume'
import CanvasResumeEditor from '@/components/CanvasResumeEditor.vue'

const router = useRouter()
const route = useRoute()

// 简历数据
const resumeData = ref({
  name: '',
  basic_info: '',
  work_exp: '',
  project_exp: '',
  self_eval: '',
  skills: '',
  target_job: '',
  awards: '',
  content: '',
  template_id: 1,
  status: 'draft'
})

const saving = ref(false)

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

const workExperience = computed(() => {
  if (!resumeData.value.work_exp) return []
  return resumeData.value.work_exp.split('\n').filter(line => line.trim()).map((exp: string) => {
    const parts = exp.split('-')
    return {
      title: parts[0] || '',
      description: parts.slice(1).join('-') || ''
    }
  })
})

const projectExperience = computed(() => {
  if (!resumeData.value.project_exp) return []
  return resumeData.value.project_exp.split('\n').filter(line => line.trim()).map((project: string) => {
    const parts = project.split('-')
    return {
      title: parts[0] || '',
      description: parts.slice(1).join('-') || ''
    }
  })
})

const goBack = () => {
  if (confirm('确定要离开吗？未保存的更改将丢失。')) {
    router.go(-1)
  }
}

// 处理Canvas编辑器的保存事件
const handleSave = async (data: any) => {
  if (!data.name.trim()) {
    alert('请输入简历名称')
    return
  }

  saving.value = true
  try {
    // 从token中获取用户ID
    const token = localStorage.getItem('token')
    let userId = 1 // 默认值
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.ID || 1
      } catch (e) {
        console.warn('无法解析token中的用户ID，使用默认值:', e)
      }
    }

    const apiData = {
      user_id: userId,
      name: data.name,
      basic_info: data.basic_info || '',
      work_exp: data.work_exp || '',
      project_exp: data.project_exp || '',
      self_eval: data.self_eval || '',
      skills: data.skills || '',
      target_job: data.target_job || '',
      awards: data.awards || '',
      template_id: data.template_id,
      status: data.status || 'draft',
      content: data.content
    }
    
    console.log('保存简历数据:', apiData)
    console.log('content字段内容:', data.content)

    const id = route.params.id as string | undefined
    if (id) {
      // 编辑模式：调用更新接口
      await updateResume(Number(id), apiData)
      alert('简历更新成功！')
    } else {
      // 新建模式：调用创建接口
      await createResume(apiData)
      alert('简历创建成功！')
    }
    
    router.push('/resume')
  } catch (error) {
    console.error('保存简历失败:', error)
    alert('保存简历失败，请重试')
  } finally {
    saving.value = false
  }
}

const saveResume = async () => {
  // 这个方法现在由Canvas编辑器组件内部处理
  // 保留这个方法以保持向后兼容
}

const loadResumeData = async () => {
  try {
    const id = route.params.id as string | undefined
    if (!id) {
      return
    }
    const response = await getResumeDetail(id)
    // 期望后端返回格式：{ code, data }
    const data = response?.data?.data || response?.data
    if (data) {
      console.log('从API获取的简历数据:', data)
      resumeData.value = {
        name: data.name || '',
        basic_info: data.basic_info || '',
        work_exp: data.work_exp || '',
        project_exp: data.project_exp || '',
        self_eval: data.self_eval || '',
        skills: data.skills || '',
        target_job: data.target_job || '',
        awards: data.awards || '',
        content: data.content || '',
        template_id: data.template_id || 1,
        status: data.status || 'draft'
      }
      console.log('设置后的resumeData:', resumeData.value)
    }
  } catch (error) {
    console.error('获取简历详情失败:', error)
  }
}

onMounted(() => {
  loadResumeData()
})

// —— 将左侧表单与右侧 Markdown 内容联动 ——
// 只显示并编辑接口返回的 content，不再自动拼接覆盖
</script>

<style scoped>
.resume-edit-container {
  min-height: 100vh;
  background: #F8FAFC;
}

.edit-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 1rem 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
}

.save-btn {
  background: #2563EB;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background: #1D4ED8;
}

.save-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
