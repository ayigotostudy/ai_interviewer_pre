import { CanvasTemplate } from './CanvasEditorService'

export const canvasTemplates: CanvasTemplate[] = [
  {
    id: 'classic',
    name: '经典模板',
    page: {
      width: 595,
      height: 842,
      backgroundColor: '#ffffff',
      margin: { top: 40, right: 40, bottom: 40, left: 40 }
    },
    elements: [
      {
        id: 'name',
        type: 'text',
        x: 40,
        y: 40,
        width: 515,
        height: 50,
        content: '张三',
        style: {
          fontSize: 32,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'center',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'basic_info',
        type: 'text',
        x: 40,
        y: 100,
        width: 515,
        height: 25,
        content: '软件工程师 | 5年经验 | 北京',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#7f8c8d',
          textAlign: 'center'
        },
        zIndex: 1
      },
      {
        id: 'contact',
        type: 'text',
        x: 40,
        y: 130,
        width: 515,
        height: 25,
        content: '13800138000 | zhangsan@example.com | 北京市朝阳区',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#7f8c8d',
          textAlign: 'center'
        },
        zIndex: 1
      },
      {
        id: 'divider1',
        type: 'shape',
        x: 40,
        y: 170,
        width: 515,
        height: 2,
        content: 'rectangle',
        style: {
          backgroundColor: '#e0e0e0'
        },
        zIndex: 1
      },
      {
        id: 'summary_title',
        type: 'text',
        x: 40,
        y: 190,
        width: 100,
        height: 30,
        content: '个人简介',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'summary_content',
        type: 'text',
        x: 40,
        y: 230,
        width: 515,
        height: 60,
        content: '5年Java开发经验，熟悉微服务架构，具备丰富的系统设计和开发经验。\n擅长Spring Boot、MySQL、Redis等技术栈，有良好的团队协作能力。',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'experience_title',
        type: 'text',
        x: 40,
        y: 310,
        width: 100,
        height: 30,
        content: '工作经历',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'experience_content',
        type: 'text',
        x: 40,
        y: 350,
        width: 515,
        height: 80,
        content: '腾讯科技 - 高级软件工程师 (2020.03-2023.12)\n负责微信支付系统的开发和维护，参与核心业务模块设计\n\n阿里巴巴 - 软件工程师 (2018.06-2020.02)\n负责电商平台后端服务开发，优化系统性能',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'skills_title',
        type: 'text',
        x: 40,
        y: 450,
        width: 100,
        height: 30,
        content: '专业技能',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'skills_content',
        type: 'text',
        x: 40,
        y: 490,
        width: 515,
        height: 60,
        content: 'Java, Spring Boot, Spring Cloud, MySQL, Redis, Docker\nVue.js, React, JavaScript, HTML5, CSS3',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'education_title',
        type: 'text',
        x: 40,
        y: 570,
        width: 100,
        height: 30,
        content: '教育背景',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'education_content',
        type: 'text',
        x: 40,
        y: 610,
        width: 515,
        height: 40,
        content: '北京大学 - 计算机科学与技术 - 本科 (2014-2018)',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      }
    ]
  },
  {
    id: 'modern',
    name: '现代简约',
    page: {
      width: 595,
      height: 842,
      backgroundColor: '#ffffff',
      margin: { top: 30, right: 30, bottom: 30, left: 30 }
    },
    elements: [
      {
        id: 'name',
        type: 'text',
        x: 30,
        y: 30,
        width: 200,
        height: 50,
        content: '李四',
        style: {
          fontSize: 28,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'title',
        type: 'text',
        x: 30,
        y: 80,
        width: 200,
        height: 30,
        content: '前端开发工程师',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#3498db',
          textAlign: 'left'
        },
        zIndex: 1
      },
      {
        id: 'contact',
        type: 'text',
        x: 30,
        y: 120,
        width: 200,
        height: 60,
        content: '📱 13800138000\n📧 lisi@example.com\n📍 上海市浦东新区',
        style: {
          fontSize: 12,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#7f8c8d',
          lineHeight: 1.5
        },
        zIndex: 1
      },
      {
        id: 'avatar',
        type: 'shape',
        x: 400,
        y: 30,
        width: 80,
        height: 80,
        content: 'circle',
        style: {
          backgroundColor: '#f8f9fa',
          borderColor: '#3498db',
          borderWidth: 3
        },
        zIndex: 1
      },
      {
        id: 'divider1',
        type: 'shape',
        x: 30,
        y: 200,
        width: 535,
        height: 1,
        content: 'rectangle',
        style: {
          backgroundColor: '#3498db'
        },
        zIndex: 1
      },
      {
        id: 'summary_title',
        type: 'text',
        x: 30,
        y: 220,
        width: 100,
        height: 30,
        content: '关于我',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'summary_content',
        type: 'text',
        x: 30,
        y: 250,
        width: 535,
        height: 50,
        content: '3年前端开发经验，专注于React和Vue.js技术栈。\n热爱新技术，具备良好的代码规范和团队协作能力。',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'experience_title',
        type: 'text',
        x: 30,
        y: 320,
        width: 100,
        height: 30,
        content: '工作经历',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'experience_content',
        type: 'text',
        x: 30,
        y: 350,
        width: 535,
        height: 80,
        content: '字节跳动 - 前端工程师 (2021.06-至今)\n负责抖音前端项目开发，使用React + TypeScript\n\n美团 - 前端开发 (2019.07-2021.05)\n负责外卖平台前端开发，使用Vue.js + Element UI',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'skills_title',
        type: 'text',
        x: 30,
        y: 450,
        width: 100,
        height: 30,
        content: '技能专长',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'skills_content',
        type: 'text',
        x: 30,
        y: 480,
        width: 535,
        height: 60,
        content: 'JavaScript, TypeScript, React, Vue.js, Node.js\nWebpack, Vite, Git, Docker, AWS',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'education_title',
        type: 'text',
        x: 30,
        y: 560,
        width: 100,
        height: 30,
        content: '教育背景',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'education_content',
        type: 'text',
        x: 30,
        y: 590,
        width: 535,
        height: 40,
        content: '上海交通大学 - 软件工程 - 本科 (2015-2019)',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      }
    ]
  },
  {
    id: 'creative',
    name: '创意设计',
    page: {
      width: 595,
      height: 842,
      backgroundColor: '#ffffff',
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    },
    elements: [
      {
        id: 'header_bg',
        type: 'shape',
        x: 20,
        y: 20,
        width: 555,
        height: 120,
        content: 'rectangle',
        style: {
          backgroundColor: '#667eea',
          borderRadius: 10
        },
        zIndex: 1
      },
      {
        id: 'name',
        type: 'text',
        x: 40,
        y: 40,
        width: 200,
        height: 40,
        content: '王五',
        style: {
          fontSize: 28,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#ffffff',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 2
      },
      {
        id: 'title',
        type: 'text',
        x: 40,
        y: 80,
        width: 200,
        height: 30,
        content: 'UI/UX 设计师',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#ffffff',
          textAlign: 'left'
        },
        zIndex: 2
      },
      {
        id: 'contact',
        type: 'text',
        x: 40,
        y: 110,
        width: 200,
        height: 20,
        content: '📱 13800138000 | 📧 wangwu@example.com',
        style: {
          fontSize: 12,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#ffffff',
          textAlign: 'left'
        },
        zIndex: 2
      },
      {
        id: 'avatar',
        type: 'shape',
        x: 400,
        y: 40,
        width: 80,
        height: 80,
        content: 'circle',
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#667eea',
          borderWidth: 4
        },
        zIndex: 2
      },
      {
        id: 'summary_title',
        type: 'text',
        x: 20,
        y: 160,
        width: 100,
        height: 30,
        content: '个人简介',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'summary_content',
        type: 'text',
        x: 20,
        y: 190,
        width: 555,
        height: 60,
        content: '4年UI/UX设计经验，专注于移动端和Web端产品设计。\n具备完整的设计思维和用户体验优化能力，熟悉设计工具和前端技术。',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'experience_title',
        type: 'text',
        x: 20,
        y: 270,
        width: 100,
        height: 30,
        content: '工作经历',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'experience_content',
        type: 'text',
        x: 20,
        y: 300,
        width: 555,
        height: 100,
        content: '腾讯 - 高级UI设计师 (2020.03-至今)\n负责微信小程序和H5页面设计，参与产品原型设计\n\n网易 - UI设计师 (2018.06-2020.02)\n负责网易云音乐移动端界面设计，提升用户体验',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'skills_title',
        type: 'text',
        x: 20,
        y: 420,
        width: 100,
        height: 30,
        content: '设计技能',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'skills_content',
        type: 'text',
        x: 20,
        y: 450,
        width: 555,
        height: 80,
        content: 'Figma, Sketch, Adobe XD, Photoshop, Illustrator\nHTML5, CSS3, JavaScript, React, Vue.js\n用户研究, 交互设计, 视觉设计, 原型设计',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      },
      {
        id: 'education_title',
        type: 'text',
        x: 20,
        y: 550,
        width: 100,
        height: 30,
        content: '教育背景',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'education_content',
        type: 'text',
        x: 20,
        y: 580,
        width: 555,
        height: 40,
        content: '中国美术学院 - 视觉传达设计 - 本科 (2014-2018)',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          lineHeight: 1.6
        },
        zIndex: 1
      }
    ]
  },
  {
    id: 'professional',
    name: '专业商务',
    page: {
      width: 595,
      height: 842,
      backgroundColor: '#ffffff',
      margin: { top: 30, right: 30, bottom: 30, left: 30 }
    },
    elements: [
      {
        id: 'name',
        type: 'text',
        x: 30,
        y: 30,
        width: 300,
        height: 40,
        content: '赵六',
        style: {
          fontSize: 24,
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'title',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 25,
        content: '产品经理',
        style: {
          fontSize: 16,
          fontFamily: 'Times New Roman, serif',
          color: '#333333',
          textAlign: 'left'
        },
        zIndex: 1
      },
      {
        id: 'contact',
        type: 'text',
        x: 30,
        y: 100,
        width: 300,
        height: 60,
        content: '电话：13800138000\n邮箱：zhaoliu@example.com\n地址：深圳市南山区',
        style: {
          fontSize: 12,
          fontFamily: 'Times New Roman, serif',
          color: '#333333',
          lineHeight: 1.4
        },
        zIndex: 1
      },
      {
        id: 'divider1',
        type: 'shape',
        x: 30,
        y: 180,
        width: 535,
        height: 1,
        content: 'rectangle',
        style: {
          backgroundColor: '#000000'
        },
        zIndex: 1
      },
      {
        id: 'summary_title',
        type: 'text',
        x: 30,
        y: 200,
        width: 100,
        height: 25,
        content: 'SUMMARY',
        style: {
          fontSize: 14,
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'summary_content',
        type: 'text',
        x: 30,
        y: 230,
        width: 535,
        height: 50,
        content: '5年产品管理经验，专注于B2B SaaS产品设计和运营。\n具备完整的产品生命周期管理能力和数据分析能力。',
        style: {
          fontSize: 12,
          fontFamily: 'Times New Roman, serif',
          color: '#333333',
          lineHeight: 1.4
        },
        zIndex: 1
      },
      {
        id: 'experience_title',
        type: 'text',
        x: 30,
        y: 300,
        width: 100,
        height: 25,
        content: 'EXPERIENCE',
        style: {
          fontSize: 14,
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'experience_content',
        type: 'text',
        x: 30,
        y: 330,
        width: 535,
        height: 80,
        content: '腾讯 - 高级产品经理 (2019.03-至今)\n负责企业微信产品规划，用户增长和商业化\n\n阿里巴巴 - 产品经理 (2017.06-2019.02)\n负责钉钉产品功能设计和用户体验优化',
        style: {
          fontSize: 12,
          fontFamily: 'Times New Roman, serif',
          color: '#333333',
          lineHeight: 1.4
        },
        zIndex: 1
      },
      {
        id: 'skills_title',
        type: 'text',
        x: 30,
        y: 430,
        width: 100,
        height: 25,
        content: 'SKILLS',
        style: {
          fontSize: 14,
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'skills_content',
        type: 'text',
        x: 30,
        y: 460,
        width: 535,
        height: 60,
        content: '产品规划, 需求分析, 原型设计, 数据分析\nAxure, Figma, SQL, Python, Tableau',
        style: {
          fontSize: 12,
          fontFamily: 'Times New Roman, serif',
          color: '#333333',
          lineHeight: 1.4
        },
        zIndex: 1
      },
      {
        id: 'education_title',
        type: 'text',
        x: 30,
        y: 540,
        width: 100,
        height: 25,
        content: 'EDUCATION',
        style: {
          fontSize: 14,
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'education_content',
        type: 'text',
        x: 30,
        y: 570,
        width: 535,
        height: 40,
        content: '清华大学 - 工商管理 - 硕士 (2015-2017)\n北京大学 - 计算机科学与技术 - 本科 (2011-2015)',
        style: {
          fontSize: 12,
          fontFamily: 'Times New Roman, serif',
          color: '#333333',
          lineHeight: 1.4
        },
        zIndex: 1
      }
    ]
  },
  {
    id: 'fe_czy',
    name: 'FE-Czy',
    page: {
      width: 595,
      height: 842,
      backgroundColor: '#ffffff',
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    },
    elements: [
      {
        id: 'name',
        type: 'text',
        x: 20,
        y: 20,
        width: 300,
        height: 40,
        content: '蔡朝阳',
        style: {
          fontSize: 32,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'basic_info',
        type: 'text',
        x: 20,
        y: 70,
        width: 400,
        height: 20,
        content: '24岁 | 硕士 | 山东青岛',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#7f8c8d',
          textAlign: 'left'
        },
        zIndex: 1
      },
      {
        id: 'contact',
        type: 'text',
        x: 20,
        y: 100,
        width: 400,
        height: 20,
        content: '13187654321 | touchczy@outlook.com',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#7f8c8d',
          textAlign: 'left'
        },
        zIndex: 1
      },
      {
        id: 'links',
        type: 'text',
        x: 20,
        y: 130,
        width: 400,
        height: 20,
        content: '博客：https://blog.touchczy.top/ (440篇博客) | GitHub：https://github.com/WindrunnerMax/ (1.8k star)',
        style: {
          fontSize: 12,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#7f8c8d',
          textAlign: 'left'
        },
        zIndex: 1
      },
      {
        id: 'avatar',
        type: 'shape',
        x: 450,
        y: 20,
        width: 80,
        height: 80,
        content: 'circle',
        style: {
          backgroundColor: '#e8f4fd',
          borderColor: '#3498db',
          borderWidth: 2
        },
        zIndex: 1
      },
      {
        id: 'education_title',
        type: 'text',
        x: 20,
        y: 180,
        width: 100,
        height: 30,
        content: '教育经历',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'education_content',
        type: 'text',
        x: 20,
        y: 220,
        width: 500,
        height: 60,
        content: '山东科技大学\n2016.09-2020.07 本科 计算机科学与技术\n2020.09-2023.07 硕士 计算机技术',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          textAlign: 'left',
          lineHeight: 1.5
        },
        zIndex: 1
      },
      {
        id: 'skills_title',
        type: 'text',
        x: 20,
        y: 300,
        width: 100,
        height: 30,
        content: '技能清单',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'skills_content',
        type: 'text',
        x: 20,
        y: 340,
        width: 500,
        height: 60,
        content: '掌握：HTML, CSS, JavaScript, PHP\n熟悉：Vue, React, uniapp, ThinkPHP\n了解：小程序, Python, Java, Weex',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          textAlign: 'left',
          lineHeight: 1.5
        },
        zIndex: 1
      },
      {
        id: 'internship_title',
        type: 'text',
        x: 20,
        y: 420,
        width: 100,
        height: 30,
        content: '实习经历',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'internship_content',
        type: 'text',
        x: 20,
        y: 460,
        width: 500,
        height: 80,
        content: '腾讯 IEG-PC游戏平台部\n2021.07-2021.09\n负责直播功能开发与上线，组件封装，单元测试(覆盖率99.7%)，学习性能优化、开发流程、CI/CD流水线、云规划等',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          textAlign: 'left',
          lineHeight: 1.5
        },
        zIndex: 1
      },
      {
        id: 'projects_title',
        type: 'text',
        x: 20,
        y: 560,
        width: 100,
        height: 30,
        content: '项目经历',
        style: {
          fontSize: 18,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'project1',
        type: 'text',
        x: 20,
        y: 600,
        width: 500,
        height: 40,
        content: '书小二小程序 (2020-12 至今)',
        style: {
          fontSize: 16,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#2c3e50',
          textAlign: 'left',
          fontWeight: 'bold'
        },
        zIndex: 1
      },
      {
        id: 'project1_desc',
        type: 'text',
        x: 20,
        y: 640,
        width: 500,
        height: 40,
        content: '前端uniapp，后端ThinkPHP API，管理后台Vue，PHP持久内存Swoole，微信支付',
        style: {
          fontSize: 14,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          color: '#34495e',
          textAlign: 'left',
          lineHeight: 1.5
        },
        zIndex: 1
      }
    ]
  }
]
