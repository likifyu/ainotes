/**
 * Excel 表格服务
 * 支持: Markdown 表格 ↔ Excel 转换、导出、导入
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 表格数据类型
export interface TableData {
  headers: string[];
  rows: string[][];
  sheetName?: string;
}

// 导出选项
export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  autoWidth?: boolean;
}

// 导入结果
export interface ExcelImportResult {
  success: boolean;
  filename: string;
  tables: TableData[];
  error?: string;
}

class ExcelService {
  /**
   * 从 Markdown 表格解析数据
   * 格式:
   * | 列1 | 列2 |
   * |------|------|
   * | 内容 | 内容 |
   */
  parseMarkdownTable(markdown: string): TableData | null {
    const lines = markdown.trim().split('\n');
    if (lines.length < 3) return null;

    // 解析表头
    const headerLine = lines[0].trim();
    const headers = this.parseMarkdownRow(headerLine);

    // 跳过分隔行
    const dataLines = lines.slice(2);

    // 解析数据行
    const rows = dataLines.map(line => this.parseMarkdownRow(line));

    return { headers, rows };
  }

  /**
   * 解析单行 Markdown 表格
   */
  private parseMarkdownRow(line: string): string[] {
    // 移除首尾的 |，分割单元格
    const trimmed = line.trim().replace(/^\||\|$/g, '');
    return trimmed.split('|').map(cell => cell.trim());
  }

  /**
   * 从 TableData 生成 Markdown
   */
  generateMarkdown(table: TableData): string {
    const { headers, rows } = table;

    // 生成表头
    let markdown = '| ' + headers.join(' | ') + ' |\n';

    // 生成分隔线
    const separators = headers.map(() => '---');
    markdown += '| ' + separators.join(' | ') + ' |\n';

    // 生成数据行
    for (const row of rows) {
      const paddedRow = headers.map((_, i) => row[i] || '');
      markdown += '| ' + paddedRow.join(' | ') + ' |\n';
    }

    return markdown;
  }

  /**
   * 导出为 Excel 文件
   */
  async exportToExcel(
    data: TableData | TableData[],
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const { filename = 'export', sheetName = 'Sheet1', autoWidth = true } = options;

    const workbook = XLSX.utils.book_new();

    const tables = Array.isArray(data) ? data : [data];

    tables.forEach((table, index) => {
      const sheetNameUsed = tables.length > 1
        ? `${sheetName}${index + 1}`
        : sheetName;

      const ws = this.createWorksheet(table, { autoWidth });

      // 设置列宽
      if (autoWidth) {
        const colWidths = table.headers.map((header, i) => {
          const maxLen = Math.max(
            header.length,
            ...table.rows.map(row => (row[i] || '').length)
          );
          return { wch: Math.min(maxLen + 2, 50) };
        });
        (ws as any)['!cols'] = colWidths;
      }

      XLSX.utils.book_append_sheet(workbook, ws, sheetNameUsed);
    });

    // 生成文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `${filename}.xlsx`);
  }

  /**
   * 创建 Worksheet
   */
  private createWorksheet(table: TableData, options: { autoWidth: boolean }): XLSX.WorkSheet {
    const { headers, rows } = table;

    // 创建表头
    const data = [headers, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(data);

    return ws;
  }

  /**
   * 导入 Excel 文件
   */
  async importExcel(file: File): Promise<ExcelImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const tables: TableData[] = [];

          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

            if (jsonData.length > 0) {
              const headers = jsonData[0] as string[];
              const rows = jsonData.slice(1).map(row => row as string[]);

              tables.push({
                headers,
                rows,
                sheetName,
              });
            }
          });

          resolve({
            success: true,
            filename: file.name,
            tables,
          });
        } catch (error) {
          resolve({
            success: false,
            filename: file.name,
            tables: [],
            error: error instanceof Error ? error.message : 'Failed to parse Excel file',
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          filename: file.name,
          tables: [],
          error: 'Failed to read file',
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 从剪贴板导入
   */
  async importFromClipboard(): Promise<TableData | null> {
    try {
      const text = await navigator.clipboard.readText();
      return this.parseMarkdownTable(text);
    } catch {
      return null;
    }
  }

  /**
   * 导出为 CSV
   */
  async exportToCsv(data: TableData, filename: string = 'export'): Promise<void> {
    const { headers, rows } = data;

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  /**
   * 从 CSV 导入
   */
  async importFromCsv(file: File): Promise<ExcelImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const rows = lines.slice(1).map(line =>
            line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
          );

          resolve({
            success: true,
            filename: file.name,
            tables: [{ headers, rows }],
          });
        } catch (error) {
          resolve({
            success: false,
            filename: file.name,
            tables: [],
            error: error instanceof Error ? error.message : 'Failed to parse CSV',
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          filename: file.name,
          tables: [],
          error: 'Failed to read file',
        });
      };

      reader.readAsText(file);
    });
  }

  /**
   * 合并多个表格
   */
  mergeTables(tables: TableData[]): TableData | null {
    if (tables.length === 0) return null;

    // 使用第一个表格的表头
    const headers = tables[0].headers;
    const allRows: string[][] = [];

    tables.forEach(table => {
      // 验证表头是否一致
      const isSameHeaders = table.headers.every((h, i) => h === headers[i]);
      if (isSameHeaders) {
        allRows.push(...table.rows);
      }
    });

    return { headers, rows: allRows };
  }

  /**
   * 导出所有笔记为 Excel
   */
  async exportNotesToExcel(
    notes: Array<{ title: string; content: string; updatedAt: number }>,
    filename: string = 'all-notes'
  ): Promise<void> {
    const data: TableData = {
      headers: ['标题', '内容', '更新时间'],
      rows: notes.map(note => [
        note.title,
        note.content.replace(/<[^>]*>/g, ''), // 移除 HTML 标签
        new Date(note.updatedAt).toLocaleString('zh-CN'),
      ]),
    };

    await this.exportToExcel(data, { filename, autoWidth: true });
  }

  /**
   * 快速导出表格到剪贴板 (Markdown 格式)
   */
  async copyTableToClipboard(table: TableData): Promise<boolean> {
    const markdown = this.generateMarkdown(table);
    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const excelService = new ExcelService();

// 导出类
export { ExcelService };
