/**
 * Canvas编辑器服务
 * 基于CanvasEditor开源项目的核心功能实现
 */

import { canvasTemplates } from './CanvasTemplates'

export interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'line'
  x: number
  y: number
  width: number
  height: number
  content: string
  style: {
    fontSize?: number
    fontFamily?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: 'normal' | 'bold'
    lineHeight?: number
    borderRadius?: number
  }
  rotation?: number
  zIndex: number
}

export interface CanvasTemplate {
  id: string
  name: string
  page: {
    width: number
    height: number
    backgroundColor: string
    margin: { top: number; right: number; bottom: number; left: number }
  }
  elements: CanvasElement[]
}

export class CanvasEditorService {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null = null
  private elements: CanvasElement[] = []
  private selectedElement: CanvasElement | null = null
  private isDragging = false
  private dragOffsetX = 0
  private dragOffsetY = 0
  private currentElementId = 0

  // 预定义模板
  private templates: CanvasTemplate[] = canvasTemplates

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.setupCanvas()
    this.setupEventListeners()
  }

  private setupCanvas() {
    if (!this.ctx || !this.canvas) return

    // 设置Canvas尺寸
    this.canvas.width = 595 // A4 width
    this.canvas.height = 842 // A4 height

    // 设置高DPI支持
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'

    this.render()
  }

  private setupEventListeners() {
    if (!this.canvas) return

    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this))
  }

  private handleMouseDown(e: MouseEvent) {
    if (!this.ctx) return

    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 检查是否点击了元素
    const clickedElement = this.getElementAt(x, y)
    if (clickedElement) {
      this.selectedElement = clickedElement
      this.isDragging = true
      this.dragOffsetX = x - clickedElement.x
      this.dragOffsetY = y - clickedElement.y
    } else {
      this.selectedElement = null
    }

    this.render()
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.ctx || !this.isDragging || !this.selectedElement) return

    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 更新元素位置
    this.selectedElement.x = x - this.dragOffsetX
    this.selectedElement.y = y - this.dragOffsetY

    this.render()
  }

  private handleMouseUp(_e: MouseEvent) {
    this.isDragging = false
  }

  private handleCanvasClick(_e: MouseEvent) {
    // 处理画布点击事件
  }

  private getElementAt(x: number, y: number): CanvasElement | null {
    // 从最上层开始检查
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i]
      if (x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height) {
        return element
      }
    }
    return null
  }

  // 添加元素
  addElement(type: 'text' | 'image' | 'shape' | 'line', content: string = '') {
    const element: CanvasElement = {
      id: `element_${++this.currentElementId}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 30 : 100,
      content,
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        textAlign: 'left',
        fontWeight: 'normal'
      },
      zIndex: this.elements.length + 1
    }

    this.elements.push(element)
    this.selectedElement = element
    this.render()
    return element
  }

  // 删除元素
  deleteElement(elementId: string) {
    this.elements = this.elements.filter(el => el.id !== elementId)
    if (this.selectedElement?.id === elementId) {
      this.selectedElement = null
    }
    this.render()
  }

  // 更新元素
  updateElement(elementId: string, updates: Partial<CanvasElement>) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      Object.assign(element, updates)
      this.render()
    }
  }

  // 选择元素
  selectElement(elementId: string) {
    this.selectedElement = this.elements.find(el => el.id === elementId) || null
    this.render()
  }

  // 应用模板
  applyTemplate(templateId: string) {
    const template = this.templates.find(t => t.id === templateId)
    if (template) {
      this.elements = template.elements.map(el => ({ ...el }))
      this.selectedElement = null
      this.render()
    }
  }

  // 获取模板列表
  getTemplates() {
    return this.templates
  }

  // 获取Canvas数据
  getCanvasData() {
    return {
      elements: this.elements,
      selectedElement: this.selectedElement
    }
  }

  // 渲染Canvas
  render() {
    if (!this.ctx || !this.canvas) return

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制背景
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制页面边框
    this.drawPageBorder()

    // 绘制网格
    this.drawGrid()

    // 按zIndex排序并绘制元素
    const sortedElements = [...this.elements].sort((a, b) => a.zIndex - b.zIndex)
    for (const element of sortedElements) {
      this.drawElement(element)
    }

    // 绘制选中元素的边框
    if (this.selectedElement) {
      this.drawSelectionBorder(this.selectedElement)
    }
  }

  private drawPageBorder() {
    if (!this.ctx || !this.canvas) return

    // 绘制阴影
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(4, 4, this.canvas.width, this.canvas.height)

    // 绘制页面边框
    this.ctx.strokeStyle = '#e0e0e0'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawGrid() {
    if (!this.ctx || !this.canvas) return

    this.ctx.strokeStyle = '#f8f8f8'
    this.ctx.lineWidth = 0.5

    // 绘制垂直线
    for (let x = 0; x <= this.canvas.width; x += 20) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()
    }

    // 绘制水平线
    for (let y = 0; y <= this.canvas.height; y += 20) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }
  }

  private drawElement(element: CanvasElement) {
    if (!this.ctx) return

    this.ctx.save()
    this.ctx.translate(element.x, element.y)

    if (element.rotation) {
      this.ctx.rotate((element.rotation * Math.PI) / 180)
    }

    switch (element.type) {
      case 'text':
        this.drawTextElement(element)
        break
      case 'image':
        this.drawImageElement(element)
        break
      case 'shape':
        this.drawShapeElement(element)
        break
      case 'line':
        this.drawLineElement(element)
        break
    }

    this.ctx.restore()
  }

  private drawTextElement(element: CanvasElement) {
    if (!this.ctx) return

    const { style, content, width } = element

    // 设置文本样式
    this.ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`
    this.ctx.fillStyle = style.color || '#000000'
    this.ctx.textAlign = (style.textAlign as CanvasTextAlign) || 'left'
    this.ctx.textBaseline = 'top'

    // 绘制文本
    const lines = content.split('\n')
    const lineHeight = (style.fontSize || 16) * 1.2
    let y = 0

    for (const line of lines) {
      // 处理长文本自动换行
      const words = line.split(' ')
      let currentLine = ''
      let lineY = y
      
      for (const word of words) {
        const testLine = currentLine + word + ' '
        const metrics = this.ctx.measureText(testLine)
        
        if (metrics.width > width && currentLine !== '') {
          this.ctx.fillText(currentLine, 0, lineY)
          lineY += lineHeight
          currentLine = word + ' '
        } else {
          currentLine = testLine
        }
      }
      
      if (currentLine) {
        this.ctx.fillText(currentLine, 0, lineY)
        lineY += lineHeight
      }
      
      y = lineY
    }
  }

  private drawImageElement(element: CanvasElement) {
    if (!this.ctx) return

    const img = new Image()
    img.onload = () => {
      this.ctx?.drawImage(img, 0, 0, element.width, element.height)
    }
    img.src = element.content
  }

  private drawShapeElement(element: CanvasElement) {
    if (!this.ctx) return

    const { style, content, width, height } = element

    // 设置形状样式
    if (style.backgroundColor) {
      this.ctx.fillStyle = style.backgroundColor
    }
    if (style.borderColor) {
      this.ctx.strokeStyle = style.borderColor
    }
    if (style.borderWidth) {
      this.ctx.lineWidth = style.borderWidth
    }

    // 绘制形状
    if (content === 'rectangle') {
      if (style.borderRadius) {
        this.drawRoundedRect(0, 0, width, height, style.borderRadius)
      } else {
        this.ctx.fillRect(0, 0, width, height)
        this.ctx.strokeRect(0, 0, width, height)
      }
    } else if (content === 'circle') {
      this.ctx.beginPath()
      this.ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.stroke()
    }
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()
  }

  private drawLineElement(element: CanvasElement) {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(element.width, element.height)
    this.ctx.stroke()
  }

  private drawSelectionBorder(element: CanvasElement) {
    if (!this.ctx) return

    // 绘制虚线边框
    this.ctx.strokeStyle = '#007bff'
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([5, 5])
    this.ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4)
    this.ctx.setLineDash([])

    // 绘制控制点
    const controlSize = 6
    const points = [
      { x: element.x - 2, y: element.y - 2 }, // 左上
      { x: element.x + element.width / 2, y: element.y - 2 }, // 上中
      { x: element.x + element.width + 2, y: element.y - 2 }, // 右上
      { x: element.x + element.width + 2, y: element.y + element.height / 2 }, // 右中
      { x: element.x + element.width + 2, y: element.y + element.height + 2 }, // 右下
      { x: element.x + element.width / 2, y: element.y + element.height + 2 }, // 下中
      { x: element.x - 2, y: element.y + element.height + 2 }, // 左下
      { x: element.x - 2, y: element.y + element.height / 2 } // 左中
    ]

    this.ctx.fillStyle = '#007bff'
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1

    for (const point of points) {
      this.ctx.fillRect(point.x - controlSize / 2, point.y - controlSize / 2, controlSize, controlSize)
      this.ctx.strokeRect(point.x - controlSize / 2, point.y - controlSize / 2, controlSize, controlSize)
    }
  }

  // 销毁服务
  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this))
      this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this))
      this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this))
      this.canvas.removeEventListener('click', this.handleCanvasClick.bind(this))
    }
  }
}