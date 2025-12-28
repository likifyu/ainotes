// File Service - 文件保存和导出功能
// 浏览器回退方案：支持多种文件格式导入

import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// 设置 PDF.js worker
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SaveOptions {
  content: string;
  title: string;
  defaultPath: string;
  filters: { name: string; extensions: string[] }[];
}

interface ExportPDFOptions {
  html: string;
  title: string;
  defaultPath: string;
}

interface OpenResult {
  success: boolean;
  filePath?: string;
  content?: string;
  extension?: string;
  message?: string;
}

interface SaveResult {
  success: boolean;
  filePath?: string;
  message?: string;
}

// 浏览器环境下的文件输入元素引用
let fileInputElement: HTMLInputElement | null = null;

// 获取或创建文件输入元素
function getFileInputElement(): HTMLInputElement {
  if (!fileInputElement) {
    fileInputElement = document.createElement('input');
    fileInputElement.type = 'file';
    fileInputElement.style.display = 'none';
    document.body.appendChild(fileInputElement);
  }
  return fileInputElement;
}

// 读取文本文件内容
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file, 'UTF-8');
  });
}

// 读取二进制文件内容
function readBinaryFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as ArrayBuffer);
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsArrayBuffer(file);
  });
}

// 解析 Word 文档 (.docx)
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await readBinaryFile(file);
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return htmlToMarkdown(result.value);
}

// 解析 Excel 文件 (.xlsx, .csv)
async function parseExcel(file: File): Promise<string> {
  const arrayBuffer = await readBinaryFile(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  let content = '';

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetTitle = sheetName !== 'Sheet1' ? '## ' + sheetName + '\n\n' : '';
    content += sheetTitle;

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    if (data.length > 0) {
      data.forEach((row, rowIndex) => {
        if (row.length === 0) {
          content += '\n';
          return;
        }

        if (rowIndex === 0) {
          content += '| ' + row.map(cell => cell || '').join(' | ') + ' |\n';
          content += '| ' + row.map(() => '---').join(' | ') + ' |\n';
        } else {
          content += '| ' + row.map(cell => cell || '').join(' | ') + ' |\n';
        }
      });
      content += '\n';
    }
  });

  return content;
}

// 解析 PDF 文件 (.pdf)
async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await readBinaryFile(file);

  // 加载 PDF 文档
  // @ts-ignore
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let content = '# PDF 文档内容\n\n';
  content += `> 共 ${pdf.numPages} 页\n\n`;

  // 遍历所有页面提取文本
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // 按行分组文本
    const lines: string[] = [];
    let lastY = -1;
    let currentLine = '';

    textContent.items.forEach((item: any) => {
      // @ts-ignore
      const text = item.str;
      // @ts-ignore
      const y = item.transform[5]; // 获取 Y 坐标

      // 如果 Y 坐标变化较大，认为是新行
      if (lastY !== -1 && Math.abs(y - lastY) > 10) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = text + ' ';
      } else {
        currentLine += text + ' ';
      }
      lastY = y;
    });

    // 添加最后一行
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    // 添加页面标题
    content += `## 第 ${pageNum} 页\n\n`;

    // 处理每一行
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // 检测标题模式（短行，大写开头，无标点）
      if (line.length < 50 && /^[A-Z]/.test(line) && !/[.!?]$/.test(line)) {
        content += `### ${line}\n\n`;
      }
      // 检测列表项
      else if (/^[-•*]\s/.test(line)) {
        content += `- ${line.replace(/^[-•*]\s+/, '')}\n`;
      }
      // 检测有序列表
      else if (/^\d+[.)]\s/.test(line)) {
        content += `${line}\n`;
      }
      // 普通段落
      else {
        content += `${line}\n\n`;
      }
    });

    content += '\n---\n\n';
  }

  return content;
}

// HTML 转 Markdown 辅助函数
function htmlToMarkdown(html: string): string {
  let markdown = html;

  markdown = markdown.replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>([^<]+)<\/h4>/gi, '#### $1\n\n');

  markdown = markdown.replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>([^<]+)<\/b>/gi, '**$1**');

  markdown = markdown.replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>([^<]+)<\/i>/gi, '*$1*');

  markdown = markdown.replace(/<del[^>]*>([^<]+)<\/del>/gi, '~~$1~~');

  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');
  markdown = markdown.replace(/<code[^>]*>([^<]+)<\/code>/gi, '`$1`');

  markdown = markdown.replace(/<p[^>]*>([^<]+)<\/p>/gi, '$1\n\n');
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  markdown = markdown.replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  markdown = markdown.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');

  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>([^<]+)<\/li>/gi, '- $1\n') + '\n';
  });

  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>([^<]+)<\/li>/gi, () => (index++) + '. $1\n') + '\n';
  });

  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    return content.split('\n').map(line => '> ' + line).join('\n') + '\n\n';
  });

  markdown = markdown.replace(/<hr\s*\/?>/gi, '\n---\n');
  markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, '\n[表格]\n');

  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');

  return markdown.trim();
}

export const fileService = {
  // 保存文件
  async save(options: SaveOptions): Promise<SaveResult> {
    if (!window.electronAPI?.fileSave) {
      return this.downloadFile(options);
    }
    return window.electronAPI.fileSave(options);
  },

  // 导出为 PDF
  async exportPDF(options: ExportPDFOptions): Promise<SaveResult> {
    if (!window.electronAPI?.fileExportPDF) {
      return { success: false, message: 'PDF导出需要 Electron 环境' };
    }
    return window.electronAPI.fileExportPDF(options);
  },

  // 打开文件 (Electron 环境)
  async open(filters: { name: string; extensions: string[] }[]): Promise<OpenResult> {
    if (!window.electronAPI?.fileOpen) {
      return { success: false, message: '文件打开需要 Electron 环境' };
    }
    return window.electronAPI.fileOpen(filters);
  },

  // 浏览器回退：导入文件 - 支持多种格式
  async importFileBrowser(): Promise<OpenResult> {
    return new Promise((resolve) => {
      const input = getFileInputElement();
      input.accept = '.md,.txt,.markdown,.html,.htm,.docx,.xlsx,.csv,.json,.pdf';
      input.value = '';

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false, message: '未选择文件' });
          return;
        }

        const fileName = file.name;
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        try {
          if (['md', 'txt', 'markdown', 'html', 'htm'].includes(extension)) {
            const fileContent = await readTextFile(file);
            resolve({ success: true, filePath: fileName, content: fileContent, extension });
          }
          else if (extension === 'docx') {
            const markdown = await parseDocx(file);
            resolve({ success: true, filePath: fileName, content: markdown, extension });
          }
          else if (extension === 'xlsx' || extension === 'csv') {
            const markdownContent = await parseExcel(file);
            resolve({ success: true, filePath: fileName, content: markdownContent, extension });
          }
          else if (extension === 'pdf') {
            const pdfContent = await parsePdf(file);
            resolve({ success: true, filePath: fileName, content: pdfContent, extension });
          }
          else if (extension === 'json') {
            const fileContent = await readTextFile(file);
            const jsonObj = JSON.parse(fileContent);
            const prettyJson = JSON.stringify(jsonObj, null, 2);
            resolve({ success: true, filePath: fileName, content: '```json\n' + prettyJson + '\n```', extension });
          }
          else {
            resolve({ success: false, message: '不支持的文件格式: .' + extension });
          }
        } catch (error: any) {
          resolve({ success: false, message: error.message });
        }
      };
      input.click();
    });
  },

  // 降级方案：使用浏览器下载
  async downloadFile(options: SaveOptions): Promise<SaveResult> {
    try {
      const blob = new Blob([options.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.defaultPath;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, message: '下载已开始' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // 快速保存为 Markdown
  async saveAsMarkdown(content: string, title: string): Promise<SaveResult> {
    return this.save({
      content,
      title: '保存 Markdown 文件',
      defaultPath: title + '.md',
      filters: [
        { name: 'Markdown 文件', extensions: ['md'] },
        { name: '文本文件', extensions: ['txt'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    });
  },

  // 导出为 HTML
  async exportAsHTML(content: string, title: string): Promise<SaveResult> {
    const htmlContent = this.markdownToHTML(content, title);
    return this.save({
      content: htmlContent,
      title: '导出为 HTML',
      defaultPath: title + '.html',
      filters: [
        { name: 'HTML 文件', extensions: ['html'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    });
  },

  // 将 Markdown 转换为 HTML（用于导出）
  markdownToHTML(markdown: string, title: string): string {
    let html = markdown;

    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => '<pre><code>' + code + '</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    html = html.replace(/^---$/gm, '<hr />');
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter((c: string) => c.trim());
      const isHeader = cells.some((c: string) => c.trim().startsWith('-'));
      const tag = isHeader ? 'th' : 'td';
      return '<tr>' + cells.map((c: string) => '<' + tag + '>' + c.trim() + '</' + tag + '>').join('') + '</tr>';
    });
    html = html.replace(/^(<[hluop]|<ul|<li|<blockquote|<pre)(?!>)/gm, '<p>$&');
    html = html.replace(/(<\/h[123]>)(?!<)/g, '$1</p>');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: "Microsoft YaHei", "PingFang SC", sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #333; }
    h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
    h2 { color: #1a1a2e; margin-top: 30px; }
    h3 { color: #4a5568; margin-top: 24px; }
    code { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: Consolas, monospace; }
    pre { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #7c3aed; margin: 20px 0; padding: 10px 20px; background: #f8fafc; color: #64748b; }
    ul, ol { padding-left: 24px; }
    li { margin: 8px 0; }
    a { color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 30px 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  },

  // 导入文件内容 (智能选择：Electron 或浏览器)
  async importFile(): Promise<OpenResult> {
    if (window.electronAPI?.fileOpen) {
      return this.open([
        { name: '支持的文件', extensions: ['md', 'txt', 'markdown', 'html', 'htm', 'docx', 'xlsx', 'csv', 'pdf'] },
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: '文本', extensions: ['txt'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
        { name: 'Word 文档', extensions: ['docx'] },
        { name: 'Excel 文件', extensions: ['xlsx', 'csv'] },
        { name: 'PDF 文档', extensions: ['pdf'] },
        { name: '所有文件', extensions: ['*'] },
      ]);
    }
    return this.importFileBrowser();
  },
};

export default fileService;
