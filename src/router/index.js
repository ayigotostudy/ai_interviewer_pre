import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/resume',
    name: 'ResumeIndex',
    component: () => import('../views/resume/Index.vue')
  },
  {
    path: '/resume/create',
    name: 'ResumeCreate',
    component: () => import('../views/resume/Create.vue')
  },
  {
    path: '/resume/:id',
    name: 'ResumeDetail',
    component: () => import('../views/resume/Detail.vue')
  },
  {
    path: '/resume/edit/:id',
    name: 'ResumeEdit',
    component: () => import('../views/resume/Edit.vue')
  },
  {
    path: '/resume/tool',
    name: 'ResumeTool',
    component: () => import('../views/resume/Tool.vue')
  },
  {
    path: '/resume/canvas-test',
    name: 'ResumeCanvasTest',
    component: () => import('../views/resume/CanvasTest.vue')
  },
  {
    path: '/resume/detail-test',
    name: 'ResumeDetailTest',
    component: () => import('../views/resume/DetailTest.vue')
  },
  {
    path: '/interview',
    name: 'InterviewIndex',
    component: () => import('../views/interview/Index.vue')
  },
  {
    path: '/interview/:id',
    name: 'InterviewDetail',
    component: () => import('../views/interview/Detail.vue')
  },
  {
    path: '/interview/room/:id',
    name: 'InterviewRoom',
    component: () => import('../views/interview/Room.vue')
  },
  {
    path: '/interview/edit/:id',
    name: 'InterviewEdit',
    component: () => import('../views/interview/Edit.vue')
  },
  {
    path: '/interview/evaluation/:id',
    name: 'InterviewEvaluation',
    component: () => import('../views/interview/Evaluation.vue')
  },
  // 知识库模块路由
  {
    path: '/wiki',
    name: 'WikiIndex',
    component: () => import('../views/wiki/Index.vue')
  },
  {
    path: '/wiki/:id',
    name: 'WikiDetail',
    component: () => import('../views/wiki/Detail.vue')
  },
  {
    path: '/wiki/query',
    name: 'WikiQuery',
    component: () => import('../views/wiki/Query.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// 添加路由调试日志
router.beforeEach((to, from, next) => {
  console.log('🛣️ 路由跳转:', { from: from.path, to: to.path, fullPath: to.fullPath })
  next()
})

router.afterEach((to, from) => {
  console.log('✅ 路由跳转完成:', { to: to.path, from: from.path })
})

console.log('🚀 路由配置完成, 基础路径:', process.env.NODE_ENV === 'production' ? '/dist/' : '/')

export default router
