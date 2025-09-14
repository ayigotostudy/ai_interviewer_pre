export class EnhancedMarkdownParser {
  static parse(content: string): string {
    if (!content) return '';

    let processedContent = content;

    // 1. 标题处理
    processedContent = processedContent.replace(/^# (.*$)/gm, '<h1 class="resume-title">$1</h1>');
    processedContent = processedContent.replace(/^## (.*$)/gm, '<h2 class="section-title">$1</h2>');

    // 2. 联系信息：支持半角|与全角｜，渲染为水平分布
    processedContent = processedContent.replace(/^([^#\n]*[\|｜][^#\n]*)$/gm, (match) => {
      if (match.includes('|') || match.includes('｜')) {
        const contacts = match.split(/[\|｜]/).map(c => c.trim()).filter(Boolean);
        return `<div class="contact-info">${contacts.map(c => `<span class="contact-item">${c}</span>`).join('')}</div>`;
      }
      return match;
    });

    // 3. 技术栈标签化：识别 "技术栈：" 后面的内容
    processedContent = processedContent.replace(/技术栈[：:]\s*([^\n]+)/g, (_match, techStack) => {
      const technologies = techStack.split(/[,，、\s]+/).filter(Boolean);
      return `<div class="tech-stack-section">
        <div class="tech-tags">${technologies.map((tech: string) => `<span class="tech-tag">${tech.trim()}</span>`).join('')}</div>
      </div>`;
    });

    // 4. ::: 区块处理（工作经历、项目经验、教育背景）
    processedContent = processedContent.replace(/::: start[\t ]*\n([\s\S]*?)\n[\t ]*::: end/g, (match, inner) => {
      const normalized = inner
        .replace(/\n:::\n/g, '\n')
        .replace(/\n:::\s*$/g, '')
        .trim();
      
      // 过滤掉空行和纯数字，只保留有内容的行
      const lines = normalized.split(/\n+/).filter((line: string) => {
        const trimmed = line.trim();
        return trimmed !== '' && !/^\d+$/.test(trimmed);
      });
      
      if (lines.length >= 2) {
        if (lines.length >= 3) {
          // 工作经历格式：公司/项目、职位/角色、时间
          const first = lines[0].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          const second = lines[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          const third = lines[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          const rest = lines.slice(3).join(' ');
          
          return `
            <div class="experience-item">
              <div class="experience-header three-items">
                <div class="experience-line company">${first}</div>
                <div class="experience-line position">${second}</div>
                <div class="experience-line duration">${third}</div>
              </div>
              ${rest ? `<p class="description">${rest}</p>` : ''}
            </div>
          `;
        } else if (lines.length === 2) {
          // 教育背景格式：学校专业学位、时间
          const education = lines[0].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          const duration = lines[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          return `
            <div class="experience-item">
              <div class="experience-header two-items">
                <div class="experience-line company">${education}</div>
                <div class="experience-line duration">${duration}</div>
              </div>
            </div>
          `;
        } else if (lines.length === 1) {
          // 单个元素格式
          const single = lines[0].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          return `
            <div class="experience-item">
              <div class="experience-header one-item">
                <div class="experience-line company">${single}</div>
              </div>
            </div>
          `;
        }
      }
      return match;
    });

    // 5. 列表处理：将以 "- " 开头的行转 li，并把连续 li 包裹为 ul
    processedContent = processedContent.replace(/^- (.*)$/gm, '<li>$1</li>');
    processedContent = processedContent.replace(/(?:<li>[\s\S]*?<\/li>)(?:(?:\n)?<li>[\s\S]*?<\/li>)+/g, (m) => `<ul class="experience-list">${m}</ul>`);

    // 6. 粗体处理
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 7. 关键信息高亮：985、211等关键词
    processedContent = processedContent.replace(/\b(985|211|双一流|C9|华五|清北|清华|北大|复旦|交大|浙大|中科大|南大|哈工大|西交|华科|中山|川大|吉大|山大|中南|重大|天大|东南|北航|北理|华工|西工大|大连理工|东北大学|兰州大学|西北农林|中央民族|中国海洋|中国农业大学|北京师范大学|华东师范大学|华中师范大学|华南师范大学|东北师范大学|陕西师范大学|西南大学|南京师范大学|湖南师范大学|福建师范大学|山东师范大学|河南大学|河北大学|山西大学|内蒙古大学|辽宁大学|延边大学|黑龙江大学|苏州大学|南京大学|安徽大学|福州大学|南昌大学|山东大学|郑州大学|湖北大学|湖南大学|广西大学|海南大学|重庆大学|四川大学|贵州大学|云南大学|西藏大学|西北大学|青海大学|宁夏大学|新疆大学|石河子大学|中国石油大学|中国地质大学|中国矿业大学|北京科技大学|北京化工大学|北京邮电大学|北京林业大学|北京中医药大学|首都医科大学|首都师范大学|首都经济贸易大学|北京工业大学|北方工业大学|北京工商大学|北京服装学院|北京印刷学院|北京建筑大学|北京石油化工学院|北京农学院|首都体育学院|北京第二外国语学院|北京物资学院|首都医科大学|北京联合大学|北京城市学院|北京吉利学院|北京邮电大学世纪学院|北京工业大学耿丹学院|首都师范大学科德学院|北京工商大学嘉华学院|北京第二外国语学院中瑞酒店管理学院|北京交通大学海滨学院|北京科技大学天津学院|北京中医药大学东方学院|北京邮电大学世纪学院|北京工业大学耿丹学院|首都师范大学科德学院|北京工商大学嘉华学院|北京第二外国语学院中瑞酒店管理学院|北京交通大学海滨学院|北京科技大学天津学院|北京中医药大学东方学院)\b/g, '<span class="highlight-keyword">$1</span>');

    // 8. 普通段落：只处理还没有被包装的行
    processedContent = processedContent.replace(/^([^#\n<][^\n]*)$/gm, (match) => {
      // 跳过已经处理过的内容
      if (match.trim() && 
          !match.includes(':::') && 
          !match.startsWith('<') && 
          !/^<li>/.test(match) &&
          !match.includes('<strong>') &&
          !match.includes('<span class="tag-badge">') &&
          !match.includes('<div class="contact-info">') &&
          !match.includes('<div class="tech-stack-section">') &&
          !match.includes('<span class="highlight-keyword">')) {
        return `<p class="section-content">${match}</p>`;
      }
      return match;
    });

    // 9. 清理多余空行
    processedContent = processedContent.replace(/\n{2,}/g, '\n');
    
    return processedContent;
  }

  static getStyles(): string {
    return `
      <style>
        /* 专业简历样式 */
        .resume-container {
          font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
          max-width: 100%;
          margin: 0 auto;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }

        .resume-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
          text-align: center;
          line-height: 1.2;
          color: #000;
          overflow-wrap: break-word;
          word-wrap: break-word;
          letter-spacing: -0.025em;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2.5rem 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #3b82f6;
          color: #1e40af;
          overflow-wrap: break-word;
          word-wrap: break-word;
          letter-spacing: -0.025em;
        }

        .contact-info {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin: 0 0 1.5rem 0;
          padding: 0;
          max-width: 100%;
        }

        .contact-item {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.9rem;
          color: #2d3748;
          white-space: nowrap;
          font-weight: 500;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tech-stack-section {
          margin: 1rem 0;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .tech-tag {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tech-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
        }

        .experience-item {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          max-width: 100%;
          overflow: hidden;
        }

        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .experience-header.three-items {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
        }

        .experience-header.two-items {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .experience-header.one-item {
          display: block;
        }

        .experience-line {
          font-size: 0.9rem;
          font-weight: 600;
          color: #000;
          line-height: 1.4;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .experience-line.company {
          font-weight: 700;
          color: #1e40af;
        }

        .experience-line.position {
          text-align: center;
          color: #374151;
        }

        .experience-line.duration {
          text-align: right;
          color: #1e40af;
          font-size: 0.9rem;
          font-weight: 700;
          white-space: nowrap;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid #3b82f6;
        }

        .company-info {
          flex: 1;
          min-width: 0;
        }

        .company-name {
          font-size: 1rem;
          font-weight: 600;
          color: #000;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .position {
          font-size: 0.9rem;
          font-weight: 600;
          color: #000;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .duration {
          font-size: 0.8rem;
          color: #000;
          font-weight: 600;
          white-space: nowrap;
        }

        .description {
          font-size: 0.9rem;
          color: #374151;
          margin: 0;
          line-height: 1.6;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .experience-list {
          margin: 0.75rem 0 0 0;
          padding-left: 0;
          list-style: none;
        }
        
        .experience-list ul {
          list-style: none;
          padding-left: 0;
        }
        
        /* 确保所有列表都不显示默认的列表点 */
        .resume-container ul {
          list-style: none !important;
          padding-left: 0 !important;
        }
        
        .resume-container li {
          list-style: none !important;
        }
        
        /* 强制覆盖所有可能的列表样式 */
        .resume-container ul li {
          list-style: none !important;
        }
        
        .resume-container ul li::marker {
          display: none !important;
        }
        
        /* 确保所有嵌套列表也不显示默认样式 */
        .resume-container ul ul,
        .resume-container ul ol,
        .resume-container ol ul,
        .resume-container ol ol {
          list-style: none !important;
          padding-left: 0 !important;
        }
        
        .resume-container ul ul li,
        .resume-container ul ol li,
        .resume-container ol ul li,
        .resume-container ol ol li {
          list-style: none !important;
        }
        
        .resume-container ul ul li::marker,
        .resume-container ul ol li::marker,
        .resume-container ol ul li::marker,
        .resume-container ol ol li::marker {
          display: none !important;
        }

        .experience-list li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
          color: #2d3748;
          padding: 0.75rem 1rem 0.75rem 2rem;
          position: relative;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #667eea;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .experience-list li:hover {
          background: #f1f5f9;
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .experience-list li::before {
          content: "•";
          color: #667eea;
          font-weight: bold;
          position: absolute;
          left: 12px;
          top: 6px;
        }

        .section-content {
          font-size: 1rem;
          color: #374151;
          margin: 0 0 1.5rem 0;
          line-height: 1.7;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .section-content:first-of-type {
          margin-top: 0;
        }

        .section-content:last-of-type {
          margin-bottom: 0;
        }

        .highlight-keyword {
          background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
          color: #2d3748;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95em;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        strong {
          font-weight: 700;
          color: #000;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .resume-container {
            padding: 1rem;
            margin: 0.5rem;
          }

          .resume-title {
            font-size: 1.3rem;
          }

          .section-title {
            font-size: 1.1rem;
          }

          .contact-info {
            gap: 0.5rem;
          }

          .contact-item {
            font-size: 0.8rem;
            padding: 0.375rem 0.5rem;
          }

          .experience-header.three-items {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .experience-header.two-items {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .experience-line.position,
          .experience-line.duration {
            text-align: left;
          }

          .experience-item {
            padding: 0.75rem;
          }

          .tech-tag {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }

          .experience-list li {
            padding: 0.5rem 0.75rem 0.5rem 1.5rem;
            font-size: 0.8rem;
          }

          .section-content {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .resume-container {
            padding: 0.75rem;
            margin: 0.25rem;
          }

          .contact-info {
            flex-direction: column;
            align-items: stretch;
          }

          .contact-item {
            text-align: center;
            white-space: normal;
          }

          .experience-header {
            flex-direction: column;
            gap: 0.25rem;
          }

          .experience-line {
            text-align: left !important;
          }
        }
      </style>
    `;
  }
}