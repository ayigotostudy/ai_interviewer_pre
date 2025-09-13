import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export class PDFExportService {
  /**
   * 导出HTML元素为PDF
   * @param elementId 要导出的HTML元素ID
   * @param filename 文件名（不包含.pdf扩展名）
   * @param options 导出选项
   */
  static async exportToPDF(
    elementId: string, 
    filename: string = 'resume',
    options: {
      scale?: number;
      useCORS?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string;
      width?: number;
      height?: number;
      fullPage?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // 等待样式加载完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 确保元素可见
      element.style.visibility = 'visible';
      element.style.display = 'block';

      // 存储原始样式
      let originalMaxWidth = '';
      let originalMargin = '';
      let originalPadding = '';

      // 如果需要全页面导出，暂时修改样式
      if (options.fullPage) {
        // 获取计算后的样式
        const computedStyle = window.getComputedStyle(element);
        originalMaxWidth = computedStyle.maxWidth;
        originalMargin = computedStyle.margin;
        originalPadding = computedStyle.padding;

        // 直接设置内联样式
        element.style.setProperty('max-width', 'none', 'important');
        element.style.setProperty('margin', '0', 'important');
        element.style.setProperty('padding', '32pt 28pt', 'important');
        element.style.setProperty('width', '100%', 'important');
      }

      // 设置默认选项
      const defaultOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth || element.offsetWidth,
        height: element.scrollHeight || element.offsetHeight,
        logging: true, // 开启日志调试
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 30000,
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.visibility = 'visible';
            clonedElement.style.display = 'block';
          }
        },
        ...options
      };

      // 使用html2canvas将HTML转换为canvas
      const canvas = await html2canvas(element, defaultOptions);
      
      // 恢复原始样式
      if (options.fullPage) {
        element.style.removeProperty('max-width');
        element.style.removeProperty('margin');
        element.style.removeProperty('padding');
        element.style.removeProperty('width');
      }
      
      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 计算PDF页面尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 直接占满A4纸，不考虑宽高比
      const x = 0;
      const y = 0;

      // 添加图片到PDF - 直接贴合A4纸比例
      pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
      
      // 下载PDF
      pdf.save(`${filename}.pdf`);
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 使用Puppeteer服务端生成PDF（推荐方法）
   * @param filename 文件名
   */
  static async exportResumePreviewWithPuppeteer(filename: string = 'resume'): Promise<void> {
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        throw new Error('未找到简历预览元素');
      }

      console.log('开始使用Puppeteer生成PDF...');

      // 获取完整的HTML内容，包括样式
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>简历预览</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .resume-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            h1 {
              color: #1e40af;
              font-size: 28px;
              margin-bottom: 20px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 10px;
            }
            h2 {
              color: #1e40af;
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 15px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 5px;
            }
            .contact-info {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              margin-bottom: 20px;
            }
            .contact-item {
              font-size: 14px;
              color: #6b7280;
            }
            .experience-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .company {
              font-weight: bold;
              font-size: 16px;
              color: #000;
            }
            .position {
              font-weight: bold;
              font-size: 14px;
              color: #374151;
              text-align: center;
            }
            .duration {
              font-weight: bold;
              font-size: 12px;
              color: #6b7280;
            }
            .tech-stack-section {
              margin: 15px 0;
            }
            .tech-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .tech-tag {
              background-color: #f3f4f6;
              color: #374151;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
            }
            ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            li {
              margin: 5px 0;
            }
            strong {
              font-weight: bold;
            }
            .description {
              margin-top: 10px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      // 调用Puppeteer服务
      const response = await fetch('http://localhost:3001/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          filename
        })
      });

      if (!response.ok) {
        throw new Error(`PDF生成失败: ${response.statusText}`);
      }

      // 下载PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('Puppeteer PDF生成完成');
      
    } catch (error) {
      console.error('Puppeteer PDF生成失败:', error);
      // 如果Puppeteer服务不可用，回退到html2pdf
      console.log('回退到html2pdf方法...');
      await this.exportResumePreview(filename);
    }
  }

  /**
   * 导出简历预览为PDF（html2pdf方法）
   * @param filename 文件名
   */
  static async exportResumePreview(filename: string = 'resume'): Promise<void> {
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        throw new Error('未找到简历预览元素');
      }

      console.log('开始导出简历预览为PDF（使用html2pdf.js）...');

      // 配置html2pdf选项 - 优化版本
      const opt = {
        margin: [10, 10, 10, 10], // 设置边距
        filename: `${filename}.pdf`,
        image: { 
          type: 'png', // 使用PNG获得更好的质量
          quality: 1.0 // 最高质量
        },
        html2canvas: { 
          scale: 3, // 提高缩放比例获得更清晰的图像
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: element.offsetWidth,
          height: element.offsetHeight,
          scrollX: 0,
          scrollY: 0,
          // 优化中文渲染
          foreignObjectRendering: true,
          removeContainer: true,
          imageTimeout: 30000,
          // 确保字体正确渲染
          onclone: (clonedDoc: Document) => {
            // 确保克隆的文档中字体正确加载
            const clonedElement = clonedDoc.getElementById('resume-preview');
            if (clonedElement) {
              clonedElement.style.fontFamily = 'Arial, "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.display = 'block';
              // 确保所有样式正确应用
              clonedElement.style.webkitFontSmoothing = 'antialiased';
              clonedElement.style.mozOsxFontSmoothing = 'grayscale';
            }
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: false, // 不压缩以保持质量
          precision: 2 // 提高精度
        }
      };

      // 使用html2pdf导出
      await html2pdf().set(opt).from(element).save();
      
      console.log('PDF导出完成（使用html2pdf.js）');
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出Canvas内容为PDF
   * @param canvasId Canvas元素ID
   * @param filename 文件名
   */
  static async exportCanvasToPDF(
    canvasId: string, 
    filename: string = 'canvas-resume'
  ): Promise<void> {
    try {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error(`Canvas with id "${canvasId}" not found`);
      }

      // 创建PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 获取canvas数据
      const imgData = canvas.toDataURL('image/png');
      
      // 计算PDF页面尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 直接占满A4纸，不考虑宽高比
      const x = 0;
      const y = 0;

      // 添加图片到PDF - 直接贴合A4纸比例
      pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
      
      // 下载PDF
      pdf.save(`${filename}.pdf`);
      
    } catch (error) {
      console.error('Canvas PDF导出失败:', error);
      throw new Error(`Canvas PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出简历预览为Word文档
   * @param filename 文件名
   */
  static async exportResumePreviewToWord(filename: string = 'resume'): Promise<void> {
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        throw new Error('未找到简历预览元素');
      }

      console.log('开始导出简历预览为Word文档...');

      // 解析HTML内容并转换为Word文档
      const paragraphs = this.parseHtmlToWordParagraphs(element);

      // 创建Word文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      // 生成Word文档
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      // 下载文件
      saveAs(blob, `${filename}.docx`);
      
      console.log('Word文档导出完成');
      
    } catch (error) {
      console.error('Word导出失败:', error);
      throw new Error(`Word导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析HTML元素为Word段落
   * @param element HTML元素
   */
  private static parseHtmlToWordParagraphs(element: HTMLElement): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    const parseElement = (el: Element): void => {
      const tagName = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || '';
      
      if (!text) return;

      switch (tagName) {
        case 'h1':
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: text,
              bold: true,
              size: 32,
              color: '1e40af'
            })],
            heading: HeadingLevel.TITLE,
            spacing: { after: 400 }
          }));
          break;
          
        case 'h2':
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: text,
              bold: true,
              size: 24,
              color: '1e40af'
            })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 }
          }));
          break;
          
        case 'strong':
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: text,
              bold: true,
              size: 20
            })],
            spacing: { after: 200 }
          }));
          break;
          
        case 'p':
          if (text.length > 0) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: text,
                size: 20
              })],
              spacing: { after: 200 }
            }));
          }
          break;
          
        case 'ul':
          const listItems = el.querySelectorAll('li');
          listItems.forEach(item => {
            const itemText = item.textContent?.trim() || '';
            if (itemText) {
              paragraphs.push(new Paragraph({
                children: [new TextRun({
                  text: '• ' + itemText,
                  size: 20
                })],
                spacing: { after: 100 }
              }));
            }
          });
          break;
          
        case 'div':
          if (el.classList.contains('contact-item')) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: text,
                size: 18,
                color: '6b7280'
              })],
              spacing: { after: 100 }
            }));
          } else if (el.classList.contains('experience-header')) {
            // 工作经历标题行
            const company = el.querySelector('.company')?.textContent?.trim() || '';
            const position = el.querySelector('.position')?.textContent?.trim() || '';
            const duration = el.querySelector('.duration')?.textContent?.trim() || '';
            
            const children = [];
            if (company) {
              children.push(new TextRun({
                text: company,
                bold: true,
                size: 22
              }));
            }
            if (position) {
              children.push(new TextRun({
                text: ' - ' + position,
                bold: true,
                size: 20,
                color: '374151'
              }));
            }
            if (duration) {
              children.push(new TextRun({
                text: ' (' + duration + ')',
                bold: true,
                size: 18,
                color: '6b7280'
              }));
            }
            
            paragraphs.push(new Paragraph({
              children: children,
              spacing: { after: 200 }
            }));
          } else if (el.classList.contains('tech-tag')) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: text,
                size: 18,
                color: '374151'
              })],
              spacing: { after: 100 }
            }));
          } else if (el.classList.contains('description')) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: text,
                size: 20
              })],
              spacing: { after: 200 }
            }));
          }
          break;
      }
    };

    // 遍历所有子元素
    const children = Array.from(element.children);
    children.forEach(child => {
      parseElement(child);
    });

    return paragraphs;
  }

}
