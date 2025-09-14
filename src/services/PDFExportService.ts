import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export class PDFExportService {
  /**
   * 导出实时预览为PDF (使用html2canvas + jsPDF)
   * @param elementId 要导出的HTML元素ID
   * @param filename 文件名（不包含.pdf扩展名）
   * @param options 导出选项
   */
  static async exportPreviewToPDF(
    elementId: string, 
    filename: string = 'resume',
    options: {
      scale?: number;
      useCORS?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string;
    } = {}
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      console.log('开始导出PDF，元素:', element);
      console.log('元素内容长度:', element.innerHTML.length);

      // 1. 保存原始滚动位置
      const originalScrollPosition = {
        top: document.documentElement.scrollTop || document.body.scrollTop,
        left: document.documentElement.scrollLeft || document.body.scrollLeft
      };

      // 2. 将滚动条重置到顶部
      window.scrollTo(0, 0);

      // 3. 等待所有图片和资源加载完成
      await this.waitForImages(element);
      
      // 4. 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5. 获取元素的完整尺寸
      const scrollWidth = element.scrollWidth;
      const scrollHeight = element.scrollHeight;
      
      console.log('元素尺寸信息:', {
        scroll: { width: scrollWidth, height: scrollHeight },
        windowScroll: { x: window.scrollX, y: window.scrollY }
      });

      // 6. 临时移除所有影响截图的样式
      const originalStyles = {
        element: {
          overflow: element.style.overflow,
          maxHeight: element.style.maxHeight,
          maxWidth: element.style.maxWidth,
          height: element.style.height,
          width: element.style.width,
          transform: element.style.transform
        },
        scaledContent: null as any,
        previewContent: null as any,
        resumePreview: null as any
      };

      // 移除元素本身的限制
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      element.style.maxWidth = 'none';
      element.style.height = 'auto';
      element.style.width = 'auto';
      element.style.transform = 'none';

      // 移除所有父容器的限制
      const scaledContent = element.closest('.scaled-content') as HTMLElement;
      const previewContent = element.closest('.preview-content') as HTMLElement;
      const resumePreview = element.closest('.resume-preview') as HTMLElement;

      if (scaledContent) {
        originalStyles.scaledContent = {
          transform: scaledContent.style.transform,
          overflow: scaledContent.style.overflow,
          maxHeight: scaledContent.style.maxHeight,
          maxWidth: scaledContent.style.maxWidth,
          height: scaledContent.style.height,
          width: scaledContent.style.width
        };
        scaledContent.style.transform = 'none';
        scaledContent.style.overflow = 'visible';
        scaledContent.style.maxHeight = 'none';
        scaledContent.style.maxWidth = 'none';
        scaledContent.style.height = 'auto';
        scaledContent.style.width = 'auto';
      }

      if (previewContent) {
        originalStyles.previewContent = {
          overflow: previewContent.style.overflow,
          maxHeight: previewContent.style.maxHeight,
          maxWidth: previewContent.style.maxWidth,
          height: previewContent.style.height,
          width: previewContent.style.width
        };
        previewContent.style.overflow = 'visible';
        previewContent.style.maxHeight = 'none';
        previewContent.style.maxWidth = 'none';
        previewContent.style.height = 'auto';
        previewContent.style.width = 'auto';
      }

      if (resumePreview) {
        originalStyles.resumePreview = {
          overflow: resumePreview.style.overflow,
          maxHeight: resumePreview.style.maxHeight,
          maxWidth: resumePreview.style.maxWidth,
          height: resumePreview.style.height,
          width: resumePreview.style.width
        };
        resumePreview.style.overflow = 'visible';
        resumePreview.style.maxHeight = 'none';
        resumePreview.style.maxWidth = 'none';
        resumePreview.style.height = 'auto';
        resumePreview.style.width = 'auto';
      }

      // 等待样式更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用html2canvas捕获完整内容
      const canvas = await html2canvas(element, {
        scale: 2, // 使用固定2倍缩放
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: scrollWidth,
        height: scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: true,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 30000,
        onclone: (clonedDoc) => {
          // 确保克隆的元素也完全可见
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.visibility = 'visible';
            clonedElement.style.display = 'block';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.maxWidth = 'none';
            clonedElement.style.width = 'auto';
            clonedElement.style.height = 'auto';
            clonedElement.style.transform = 'none';
            
            // 也处理所有父容器
            const clonedScaledContent = clonedElement.closest('.scaled-content');
            if (clonedScaledContent) {
              clonedScaledContent.style.transform = 'none';
              clonedScaledContent.style.overflow = 'visible';
              clonedScaledContent.style.maxHeight = 'none';
              clonedScaledContent.style.maxWidth = 'none';
              clonedScaledContent.style.height = 'auto';
              clonedScaledContent.style.width = 'auto';
            }
            
            const clonedPreviewContent = clonedElement.closest('.preview-content');
            if (clonedPreviewContent) {
              clonedPreviewContent.style.overflow = 'visible';
              clonedPreviewContent.style.maxHeight = 'none';
              clonedPreviewContent.style.maxWidth = 'none';
              clonedPreviewContent.style.height = 'auto';
              clonedPreviewContent.style.width = 'auto';
            }
            
            const clonedResumePreview = clonedElement.closest('.resume-preview');
            if (clonedResumePreview) {
              clonedResumePreview.style.overflow = 'visible';
              clonedResumePreview.style.maxHeight = 'none';
              clonedResumePreview.style.maxWidth = 'none';
              clonedResumePreview.style.height = 'auto';
              clonedResumePreview.style.width = 'auto';
            }
            
            // 确保克隆文档的滚动位置也是0
            clonedDoc.documentElement.scrollTop = 0;
            clonedDoc.documentElement.scrollLeft = 0;
            clonedDoc.body.scrollTop = 0;
            clonedDoc.body.scrollLeft = 0;
          }
        }
      });

      // 恢复原始样式
      element.style.overflow = originalStyles.element.overflow;
      element.style.maxHeight = originalStyles.element.maxHeight;
      element.style.maxWidth = originalStyles.element.maxWidth;
      element.style.height = originalStyles.element.height;
      element.style.width = originalStyles.element.width;
      element.style.transform = originalStyles.element.transform;

      if (scaledContent && originalStyles.scaledContent) {
        scaledContent.style.transform = originalStyles.scaledContent.transform;
        scaledContent.style.overflow = originalStyles.scaledContent.overflow;
        scaledContent.style.maxHeight = originalStyles.scaledContent.maxHeight;
        scaledContent.style.maxWidth = originalStyles.scaledContent.maxWidth;
        scaledContent.style.height = originalStyles.scaledContent.height;
        scaledContent.style.width = originalStyles.scaledContent.width;
      }

      if (previewContent && originalStyles.previewContent) {
        previewContent.style.overflow = originalStyles.previewContent.overflow;
        previewContent.style.maxHeight = originalStyles.previewContent.maxHeight;
        previewContent.style.maxWidth = originalStyles.previewContent.maxWidth;
        previewContent.style.height = originalStyles.previewContent.height;
        previewContent.style.width = originalStyles.previewContent.width;
      }

      if (resumePreview && originalStyles.resumePreview) {
        resumePreview.style.overflow = originalStyles.resumePreview.overflow;
        resumePreview.style.maxHeight = originalStyles.resumePreview.maxHeight;
        resumePreview.style.maxWidth = originalStyles.resumePreview.maxWidth;
        resumePreview.style.height = originalStyles.resumePreview.height;
        resumePreview.style.width = originalStyles.resumePreview.width;
      }

      console.log('Canvas生成完成，尺寸:', {
        width: canvas.width,
        height: canvas.height,
        devicePixelRatio: window.devicePixelRatio
      });

      // 7. 检查canvas是否有内容
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let hasContent = false;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            hasContent = true;
            break;
          }
        }
        console.log('Canvas是否有内容:', hasContent);
        if (!hasContent) {
          throw new Error('Canvas内容为空，无法导出');
        }
      }

      // 8. 创建PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 获取PDF页面尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 计算图片在PDF中的尺寸
      const imgAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let imgWidth, imgHeight, x, y;
      
      // 计算缩放比例 - 确保内容完全显示在A4页面内
      const margin = 5; // 减少边距
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      // 计算缩放比例，确保内容完全显示
      const scaleX = maxWidth / canvas.width;
      const scaleY = maxHeight / canvas.height;
      const scale = Math.min(scaleX, scaleY); // 使用较小的缩放比例确保完全显示
      
      imgWidth = canvas.width * scale;
      imgHeight = canvas.height * scale;
      
      // 居中显示
      x = (pdfWidth - imgWidth) / 2;
      y = (pdfHeight - imgHeight) / 2;

      console.log('PDF布局计算:', {
        pdfWidth,
        pdfHeight,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        imgAspectRatio,
        pdfAspectRatio,
        imgWidth,
        imgHeight,
        x,
        y,
        margin,
        scale
      });

      // 检查是否需要分页
      if (imgHeight > maxHeight) {
        console.log('内容过高，需要分页处理');
        
        // 计算每页可以显示的内容高度
        const contentPerPage = maxHeight;
        const totalPages = Math.ceil(imgHeight / contentPerPage);
        
        // 清空当前页面
        pdf.deletePage(1);
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          // 计算当前页的裁剪区域
          const sourceY = (canvas.height / totalPages) * i;
          const sourceHeight = canvas.height / totalPages;
          
          // 创建临时canvas来裁剪图片
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          if (tempCtx) {
            // 填充白色背景
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // 绘制裁剪的内容
            tempCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
          }
          
          // 计算当前页的尺寸
          const pageImgWidth = canvas.width * scale;
          const pageImgHeight = sourceHeight * scale;
          const pageX = (pdfWidth - pageImgWidth) / 2;
          const pageY = (pdfHeight - pageImgHeight) / 2;
          
          // 添加裁剪后的图片到当前页
          const pageImgData = tempCanvas.toDataURL('image/png', 0.9);
          pdf.addImage(pageImgData, 'PNG', pageX, pageY, pageImgWidth, pageImgHeight);
        }
      } else {
        // 单页内容，直接添加
        const imgData = canvas.toDataURL('image/png', 0.9);
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }

      // 10. 保存PDF
      pdf.save(`${filename}.pdf`);
      console.log('PDF保存完成');

    } catch (error) {
      console.error('PDF导出失败:', error);
      throw error;
    } finally {
      // 11. 恢复原始滚动位置（可选）
      // window.scrollTo(originalScrollPosition.left, originalScrollPosition.top);
    }
  }

  /**
   * 导出HTML元素为PDF (使用html2pdf.js)
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
      throw error;
    }
  }

  /**
   * 使用Puppeteer导出PDF (服务器端)
   * @param elementId 要导出的HTML元素ID
   * @param filename 文件名
   */
  static async exportResumePreviewWithPuppeteer(filename: string): Promise<void> {
    try {
      // 这里可以调用后端API使用Puppeteer导出
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('PDF导出失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Puppeteer PDF导出失败:', error);
      throw error;
    }
  }

  /**
   * 导出简历预览为图片 - 完整修复版本
   * @param filename 文件名
   * @param format 图片格式 ('png' | 'jpeg')
   */
  static async exportResumePreviewToImage(
    filename: string, 
    format: 'png' | 'jpeg' = 'png'
  ): Promise<void> {
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        throw new Error(`Element with id "resume-preview" not found`);
      }

      console.log('开始导出图片，元素:', element);
      console.log('元素内容长度:', element.innerHTML.length);

      // 1. 保存原始滚动位置
      const originalScrollPosition = {
        top: document.documentElement.scrollTop || document.body.scrollTop,
        left: document.documentElement.scrollLeft || document.body.scrollLeft
      };

      // 2. 将滚动条重置到顶部
      window.scrollTo(0, 0);

      // 3. 等待所有图片和资源加载完成
      await this.waitForImages(element);
      
      // 4. 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5. 获取元素的完整尺寸
      const rect = element.getBoundingClientRect();
      const scrollWidth = element.scrollWidth;
      const scrollHeight = element.scrollHeight;
      
      console.log('元素尺寸信息:', {
        rect: { width: rect.width, height: rect.height },
        scroll: { width: scrollWidth, height: scrollHeight },
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        windowScroll: { x: window.scrollX, y: window.scrollY }
      });

      // 6. 临时移除所有影响截图的样式
      const originalStyles = {
        element: {
          overflow: element.style.overflow,
          maxHeight: element.style.maxHeight,
          maxWidth: element.style.maxWidth,
          height: element.style.height,
          width: element.style.width,
          transform: element.style.transform
        },
        scaledContent: null as any,
        previewContent: null as any,
        resumePreview: null as any
      };

      // 移除元素本身的限制
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      element.style.maxWidth = 'none';
      element.style.height = 'auto';
      element.style.width = 'auto';
      element.style.transform = 'none';

      // 移除所有父容器的限制
      const scaledContent = element.closest('.scaled-content') as HTMLElement;
      const previewContent = element.closest('.preview-content') as HTMLElement;
      const resumePreview = element.closest('.resume-preview') as HTMLElement;

      if (scaledContent) {
        originalStyles.scaledContent = {
          transform: scaledContent.style.transform,
          overflow: scaledContent.style.overflow,
          maxHeight: scaledContent.style.maxHeight,
          maxWidth: scaledContent.style.maxWidth,
          height: scaledContent.style.height,
          width: scaledContent.style.width
        };
        scaledContent.style.transform = 'none';
        scaledContent.style.overflow = 'visible';
        scaledContent.style.maxHeight = 'none';
        scaledContent.style.maxWidth = 'none';
        scaledContent.style.height = 'auto';
        scaledContent.style.width = 'auto';
      }

      if (previewContent) {
        originalStyles.previewContent = {
          overflow: previewContent.style.overflow,
          maxHeight: previewContent.style.maxHeight,
          maxWidth: previewContent.style.maxWidth,
          height: previewContent.style.height,
          width: previewContent.style.width
        };
        previewContent.style.overflow = 'visible';
        previewContent.style.maxHeight = 'none';
        previewContent.style.maxWidth = 'none';
        previewContent.style.height = 'auto';
        previewContent.style.width = 'auto';
      }

      if (resumePreview) {
        originalStyles.resumePreview = {
          overflow: resumePreview.style.overflow,
          maxHeight: resumePreview.style.maxHeight,
          maxWidth: resumePreview.style.maxWidth,
          height: resumePreview.style.height,
          width: resumePreview.style.width
        };
        resumePreview.style.overflow = 'visible';
        resumePreview.style.maxHeight = 'none';
        resumePreview.style.maxWidth = 'none';
        resumePreview.style.height = 'auto';
        resumePreview.style.width = 'auto';
      }

      // 等待样式更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用html2canvas捕获完整内容
      const canvas = await html2canvas(element, {
        scale: 2, // 使用固定2倍缩放
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: scrollWidth,
        height: scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: true,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 30000,
        onclone: (clonedDoc) => {
          // 确保克隆的元素也完全可见
          const clonedElement = clonedDoc.getElementById('resume-preview');
          if (clonedElement) {
            clonedElement.style.visibility = 'visible';
            clonedElement.style.display = 'block';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.maxWidth = 'none';
            clonedElement.style.width = 'auto';
            clonedElement.style.height = 'auto';
            clonedElement.style.transform = 'none';
            
            // 也处理所有父容器
            const clonedScaledContent = clonedElement.closest('.scaled-content');
            if (clonedScaledContent) {
              clonedScaledContent.style.transform = 'none';
              clonedScaledContent.style.overflow = 'visible';
              clonedScaledContent.style.maxHeight = 'none';
              clonedScaledContent.style.maxWidth = 'none';
              clonedScaledContent.style.height = 'auto';
              clonedScaledContent.style.width = 'auto';
            }
            
            const clonedPreviewContent = clonedElement.closest('.preview-content');
            if (clonedPreviewContent) {
              clonedPreviewContent.style.overflow = 'visible';
              clonedPreviewContent.style.maxHeight = 'none';
              clonedPreviewContent.style.maxWidth = 'none';
              clonedPreviewContent.style.height = 'auto';
              clonedPreviewContent.style.width = 'auto';
            }
            
            const clonedResumePreview = clonedElement.closest('.resume-preview');
            if (clonedResumePreview) {
              clonedResumePreview.style.overflow = 'visible';
              clonedResumePreview.style.maxHeight = 'none';
              clonedResumePreview.style.maxWidth = 'none';
              clonedResumePreview.style.height = 'auto';
              clonedResumePreview.style.width = 'auto';
            }
            
            // 确保克隆文档的滚动位置也是0
            clonedDoc.documentElement.scrollTop = 0;
            clonedDoc.documentElement.scrollLeft = 0;
            clonedDoc.body.scrollTop = 0;
            clonedDoc.body.scrollLeft = 0;
          }
        }
      });

      // 恢复原始样式
      element.style.overflow = originalStyles.element.overflow;
      element.style.maxHeight = originalStyles.element.maxHeight;
      element.style.maxWidth = originalStyles.element.maxWidth;
      element.style.height = originalStyles.element.height;
      element.style.width = originalStyles.element.width;
      element.style.transform = originalStyles.element.transform;

      if (scaledContent && originalStyles.scaledContent) {
        scaledContent.style.transform = originalStyles.scaledContent.transform;
        scaledContent.style.overflow = originalStyles.scaledContent.overflow;
        scaledContent.style.maxHeight = originalStyles.scaledContent.maxHeight;
        scaledContent.style.maxWidth = originalStyles.scaledContent.maxWidth;
        scaledContent.style.height = originalStyles.scaledContent.height;
        scaledContent.style.width = originalStyles.scaledContent.width;
      }

      if (previewContent && originalStyles.previewContent) {
        previewContent.style.overflow = originalStyles.previewContent.overflow;
        previewContent.style.maxHeight = originalStyles.previewContent.maxHeight;
        previewContent.style.maxWidth = originalStyles.previewContent.maxWidth;
        previewContent.style.height = originalStyles.previewContent.height;
        previewContent.style.width = originalStyles.previewContent.width;
      }

      if (resumePreview && originalStyles.resumePreview) {
        resumePreview.style.overflow = originalStyles.resumePreview.overflow;
        resumePreview.style.maxHeight = originalStyles.resumePreview.maxHeight;
        resumePreview.style.maxWidth = originalStyles.resumePreview.maxWidth;
        resumePreview.style.height = originalStyles.resumePreview.height;
        resumePreview.style.width = originalStyles.resumePreview.width;
      }

      console.log('Canvas生成完成，尺寸:', {
        width: canvas.width,
        height: canvas.height,
        devicePixelRatio: window.devicePixelRatio
      });

      // 7. 检查canvas是否有内容
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let hasContent = false;
        let contentPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            hasContent = true;
            contentPixels++;
          }
        }
        console.log('Canvas内容检查:', {
          hasContent,
          contentPixels,
          totalPixels: data.length / 4,
          contentRatio: (contentPixels / (data.length / 4) * 100).toFixed(2) + '%'
        });
        
        // 检查Canvas的四个角落是否有内容
        const cornerSize = 100;
        const corners = [
          { name: '左上角', x: 0, y: 0 },
          { name: '右上角', x: canvas.width - cornerSize, y: 0 },
          { name: '左下角', x: 0, y: canvas.height - cornerSize },
          { name: '右下角', x: canvas.width - cornerSize, y: canvas.height - cornerSize }
        ];
        
        corners.forEach(corner => {
          const cornerData = ctx.getImageData(corner.x, corner.y, cornerSize, cornerSize);
          const cornerPixels = cornerData.data;
          let cornerHasContent = false;
          for (let i = 0; i < cornerPixels.length; i += 4) {
            if (cornerPixels[i] !== 255 || cornerPixels[i + 1] !== 255 || cornerPixels[i + 2] !== 255) {
              cornerHasContent = true;
              break;
            }
          }
          console.log(`${corner.name}是否有内容:`, cornerHasContent);
        });
        
        if (!hasContent) {
          throw new Error('Canvas内容为空，无法导出');
        }
      }

      // 8. 将canvas转换为图片并下载
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpeg' ? 0.9 : undefined;
      const dataURL = canvas.toDataURL(mimeType, quality);
      
      console.log('图片数据长度:', dataURL.length);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = dataURL;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('图片导出完成');

    } catch (error) {
      console.error('图片导出失败:', error);
      throw error;
    } finally {
      // 9. 恢复原始滚动位置（可选）
      // window.scrollTo(originalScrollPosition.left, originalScrollPosition.top);
    }
  }

  /**
   * 等待元素内的所有图片加载完成
   * @param parentElement 父元素
   */
  private static async waitForImages(parentElement: HTMLElement): Promise<void> {
    const images = parentElement.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      } else {
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // 即使图片加载失败也继续
          // 设置超时，避免无限等待
          setTimeout(() => resolve(), 5000);
        });
      }
    });
    
    await Promise.all(promises);
    console.log('所有图片加载完成');
  }
}