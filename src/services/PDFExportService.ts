import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * PDF导出服务 - 简化版本
 * 专门用于导出简历预览区域
 */
export class PDFExportService {
  /**
   * 等待图片加载完成
   */
  private static async waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // 即使加载失败也继续
          // 设置超时，避免无限等待
          setTimeout(() => resolve(), 3000);
        }
      });
    });
    
    await Promise.all(imagePromises);
  }

  /**
   * 导出简历预览为图片 - 简化版本
   * @param filename 文件名
   * @param format 图片格式 ('png' | 'jpeg')
   */
  static async exportResumePreviewToImage(
    filename: string, 
    format: 'png' | 'jpeg' = 'png'
  ): Promise<void> {
    try {
      // 获取resume-preview元素，这是简历内容区域
      const element = document.getElementById('resume-preview');
      if (!element) {
        throw new Error(`Element with id "resume-preview" not found`);
      }

      console.log('开始导出图片，元素:', element);
      console.log('元素内容长度:', element.innerHTML.length);

      // 等待图片加载
      await this.waitForImages(element);
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 获取元素尺寸
      const rect = element.getBoundingClientRect();
      const scrollWidth = element.scrollWidth;
      const scrollHeight = element.scrollHeight;
      
      console.log('元素尺寸信息:', {
        rect: { width: rect.width, height: rect.height },
        scroll: { width: scrollWidth, height: scrollHeight },
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });

      // 使用html2canvas截图
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: scrollWidth,
        height: scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      console.log('Canvas尺寸:', {
        width: canvas.width,
        height: canvas.height
      });

      // 检查canvas内容
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let contentPixels = 0;
        let totalPixels = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a > 0 && (r !== 255 || g !== 255 || b !== 255)) {
            contentPixels++;
          }
        }
        
        const contentRatio = ((contentPixels / totalPixels) * 100).toFixed(2);
        console.log('Canvas内容检查:', {
          hasContent: contentPixels > 0,
          contentPixels,
          totalPixels,
          contentRatio: contentRatio + '%'
        });
        
        // 检查四个角落是否有内容
        const cornerSize = 50;
        const corners = [
          { x: 0, y: 0, name: '左上角' },
          { x: canvas.width - cornerSize, y: 0, name: '右上角' },
          { x: 0, y: canvas.height - cornerSize, name: '左下角' },
          { x: canvas.width - cornerSize, y: canvas.height - cornerSize, name: '右下角' }
        ];
        
        corners.forEach(corner => {
          const cornerData = ctx.getImageData(corner.x, corner.y, cornerSize, cornerSize);
          const cornerPixels = cornerData.data;
          let cornerContent = 0;
          
          for (let i = 0; i < cornerPixels.length; i += 4) {
            const a = cornerPixels[i + 3];
            if (a > 0) cornerContent++;
          }
          
          console.log(`${corner.name}内容检查:`, {
            hasContent: cornerContent > 0,
            contentPixels: cornerContent
          });
        });
      }

      // 转换为图片并下载
      const imgData = canvas.toDataURL(`image/${format}`, 1.0);
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('图片导出完成');
    } catch (error) {
      console.error('图片导出失败:', error);
      throw error;
    }
  }

  /**
   * 导出简历预览为PDF - 简化版本
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
      // 获取resume-preview元素
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      console.log('开始导出PDF，元素:', element);
      console.log('元素内容长度:', element.innerHTML.length);

      // 等待图片加载
      await this.waitForImages(element);
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 获取元素尺寸
      const rect = element.getBoundingClientRect();
      const scrollWidth = element.scrollWidth;
      const scrollHeight = element.scrollHeight;
      
      console.log('元素尺寸信息:', {
        rect: { width: rect.width, height: rect.height },
        scroll: { width: scrollWidth, height: scrollHeight }
      });

      // 使用html2canvas截图
      const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: options.useCORS !== false,
        allowTaint: options.allowTaint !== false,
        backgroundColor: options.backgroundColor || '#ffffff',
        width: scrollWidth,
        height: scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      console.log('Canvas尺寸:', {
        width: canvas.width,
        height: canvas.height
      });

      // 创建PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 计算PDF页面尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);

      // 计算图片在PDF中的尺寸
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // 如果图片高度超过页面高度，需要分页
      if (imgHeight > contentHeight) {
        const totalPages = Math.ceil(imgHeight / contentHeight);
        console.log(`图片高度超过页面，需要分页: ${totalPages}页`);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          const yOffset = -(page * contentHeight);
          const currentPageHeight = Math.min(contentHeight, imgHeight - (page * contentHeight));
          
          pdf.addImage(
            canvas.toDataURL('image/png', 1.0),
            'PNG',
            margin,
            margin + yOffset,
            imgWidth,
            currentPageHeight
          );
        }
      } else {
        // 单页显示
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight
        );
      }

      // 保存PDF
      pdf.save(`${filename}.pdf`);
      console.log('PDF导出完成');
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw error;
    }
  }
}