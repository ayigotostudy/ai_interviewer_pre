const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(express.json());
app.use(express.static('dist')); // 服务静态文件

// PDF生成API
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { htmlContent, filename = 'resume' } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML内容不能为空' });
    }

    // 启动Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // 设置页面内容
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // 设置视口大小
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2
    });

    // 等待字体加载
    await page.evaluateHandle('document.fonts.ready');

    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });

    await browser.close();

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // 发送PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF生成失败:', error);
    res.status(500).json({ 
      error: 'PDF生成失败', 
      message: error.message 
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PDF生成服务运行在端口 ${PORT}`);
});

module.exports = app;
