/**
 * Word 文档服务
 * 支持: Markdown/HTML 转 Word (.docx)
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAsDocx } from './file-service';

// Markdown 解析辅助函数
function parseMarkdownToDocx(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // 标题检测
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const headingMap: Record<number, HeadingLevel> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };
      paragraphs.push(
        new Paragraph({
          text: headingMatch[2],
          heading: headingMap[level],
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }

    // 引用检测
    if (line.startsWith('> ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line.substring(2), italics: true })],
          indent: { left: 720 }, // 0.5 inch
          spacing: { before: 100, after: 100 },
        })
      );
      continue;
    }

    // 无序列表
    if (line.match(/^[-*+]\s+/)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^[-*+]\s+/, ''),
          bullet: { level: 0 },
          indent: { left: 360 }, // 0.25 inch
          spacing: { before: 50, after: 50 },
        })
      );
      continue;
    }

    // 有序列表
    const orderedMatch = line.match(/^\d+[.)]\s+/);
    if (orderedMatch) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(orderedMatch[0].length),
          numbering: { level: 0, reference: 'ordered' },
          indent: { left: 360 },
          spacing: { before: 50, after: 50 },
        })
      );
      continue;
    }

    // 代码块 (简单处理)
    if (line.startsWith('```') || line.startsWith('```')) {
      // 跳过代码块标记
      continue;
    }
    if (line.startsWith('    ') || line.startsWith('\t')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line.trim(), font: 'Courier New', size: 20 })],
          indent: { left: 720 },
          spacing: { before: 50, after: 50 },
        })
      );
      continue;
    }

    // 分隔线
    if (line.match(/^[-*_]{3,}$/)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '__________________________________', color: 'CCCCCC' })],
          spacing: { before: 150, after: 150 },
        })
      );
      continue;
    }

    // 普通段落
    if (line.trim()) {
      const runs = parseInlineFormatting(line);
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { before: 100, after: 100 },
        })
      );
    }
  }

  return paragraphs;
}

// 解析行内格式 (粗体、斜体等)
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      // 粗体
      if (currentText) {
        runs.push(new TextRun({ text: currentText }));
        currentText = '';
      }
      i += 2;
      let boldText = '';
      while (i < text.length - 1 && !(text[i] === '*' && text[i + 1] === '*')) {
        boldText += text[i];
        i++;
      }
      if (boldText) {
        runs.push(new TextRun({ text: boldText, bold: true }));
      }
      i += 2;
    } else if (text[i] === '*') {
      // 斜体
      if (currentText) {
        runs.push(new TextRun({ text: currentText }));
        currentText = '';
      }
      i++;
      let italicText = '';
      while (i < text.length && text[i] !== '*') {
        italicText += text[i];
        i++;
      }
      if (italicText) {
        runs.push(new TextRun({ text: italicText, italics: true }));
      }
      i++;
    } else if (text[i] === '`') {
      // 行内代码
      if (currentText) {
        runs.push(new TextRun({ text: currentText }));
        currentText = '';
      }
      i++;
      let codeText = '';
      while (i < text.length && text[i] !== '`') {
        codeText += text[i];
        i++;
      }
      if (codeText) {
        runs.push(new TextRun({ text: codeText, font: 'Courier New', size: 20 }));
      }
      i++;
    } else if (text[i] === '[' && text[i + 1] !== '!') {
      // 链接
      const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        if (currentText) {
          runs.push(new TextRun({ text: currentText }));
          currentText = '';
        }
        runs.push(
          new TextRun({
            text: linkMatch[1],
            color: '0563C1',
            underline: { color: '0563C1' },
          })
        );
        i += linkMatch[0].length;
      } else {
        currentText += text[i];
        i++;
      }
    } else {
      currentText += text[i];
      i++;
    }
  }

  if (currentText) {
    runs.push(new TextRun({ text: currentText }));
  }

  return runs;
}

// 解析 HTML 到 Docx
function parseHtmlToDocx(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // 简单 HTML 解析
  const tagRegex = /<[^>]+>/g;
  const textContent = html.replace(tagRegex, '\n').trim();

  return parseMarkdownToDocx(textContent);
}

// Word 文档服务类
class DocxService {
  /**
   * 从 Markdown 创建 Word 文档
   */
  async createFromMarkdown(markdown: string, title: string = '未命名文档'): Promise<void> {
    const paragraphs = parseMarkdownToDocx(markdown);

    const doc = new Document({
      creator: 'AI Notes',
      title: title,
      description: '由 AI Notes 导出',
      sections: [
        {
          properties: {},
          children: [
            // 标题
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
            }),
            // 分隔线
            new Paragraph({
              children: [new TextRun({ text: '__________________________________', color: 'CCCCCC' })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            // 内容
            ...paragraphs,
          ],
        },
      ],
    });

    // 导出文件
    await saveAsDocx(doc, title);
  }

  /**
   * 从 HTML 创建 Word 文档
   */
  async createFromHtml(html: string, title: string = '未命名文档'): Promise<void> {
    const paragraphs = parseHtmlToDocx(html);

    const doc = new Document({
      creator: 'AI Notes',
      title: title,
      description: '由 AI Notes 导出',
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
            }),
            new Paragraph({
              children: [new TextRun({ text: '__________________________________', color: 'CCCCCC' })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    await saveAsDocx(doc, title);
  }

  /**
   * 创建带表格的 Word 文档
   */
  async createWithTable(
    content: string,
    tableData: string[][],
    title: string = '带表格的文档'
  ): Promise<void> {
    const paragraphs = parseMarkdownToDocx(content);

    // 创建表格行
    const tableRows = tableData.map((row, rowIndex) => {
      return new Paragraph({
        children: row.map((cell, cellIndex) => {
          const isHeader = rowIndex === 0;
          return new TextRun({
            text: cell,
            bold: isHeader,
            size: isHeader ? 24 : 22,
          });
        }),
        spacing: { before: 100, after: 100 },
      });
    });

    const doc = new Document({
      creator: 'AI Notes',
      title: title,
      description: '由 AI Notes 导出',
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    await saveAsDocx(doc, title);
  }

  /**
   * 直接生成文档对象 (用于进一步处理)
   */
  createDocument(markdown: string, title: string): Document {
    const paragraphs = parseMarkdownToDocx(markdown);

    return new Document({
      creator: 'AI Notes',
      title: title,
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });
  }
}

// 导出单例
export const docxService = new DocxService();

// 导出类
export { DocxService };
