import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import fileService from '../services/file-service';
import soundService from '../services/sound-service';

const FileToolbar: React.FC = () => {
  const { currentNote, updateNote } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    if (type === 'success') {
      soundService.playSave();
    } else {
      soundService.playError();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!currentNote) {
      showToast('请先选择一个笔记', 'error');
      return;
    }

    const title = currentNote.title || '未命名笔记';
    const result = await fileService.saveAsMarkdown(currentNote.content, title);

    if (result.success) {
      showToast('文件已保存');
    } else {
      showToast('保存失败: ' + result.message, 'error');
    }
  };

  const handleExportHTML = async () => {
    if (!currentNote) {
      showToast('请先选择一个笔记', 'error');
      return;
    }

    const title = currentNote.title || '未命名笔记';
    const result = await fileService.exportAsHTML(currentNote.content, title);

    if (result.success) {
      showToast('已导出为 HTML');
    } else {
      showToast('导出失败: ' + result.message, 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!currentNote) {
      showToast('请先选择一个笔记', 'error');
      return;
    }

    setIsExporting(true);
    const title = currentNote.title || '未命名笔记';

    // 将 Markdown 转换为 HTML
    const htmlContent = fileService.markdownToHTML(currentNote.content, title);

    const result = await fileService.exportPDF({
      html: htmlContent,
      title,
      defaultPath: title + '.md',
    });

    setIsExporting(false);

    if (result.success) {
      showToast(result.message || 'PDF已导出');
    } else {
      showToast('导出失败: ' + result.message, 'error');
    }
  };

  const handleImport = async () => {
    const result = await fileService.importFile();

    if (result.success && result.content) {
      // 将导入的内容作为新笔记
      if (currentNote) {
        updateNote(currentNote.id, { content: result.content });
      }
      showToast('文件已导入');
      soundService.playComplete();
    } else if (result.message) {
      showToast(result.message, 'error');
    }
  };

  const handleCopyContent = async () => {
    if (!currentNote) return;

    try {
      await navigator.clipboard.writeText(currentNote.content);
      showToast('已复制到剪贴板');
      soundService.playClick();
    } catch {
      showToast('复制失败', 'error');
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border-t border-white/10">
        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={!currentNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-emerald-500/20 text-emerald-300 border border-emerald-500/30
            hover:bg-emerald-500/30 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="保存文件 (Ctrl+S)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>保存</span>
        </button>

        {/* 导出 HTML */}
        <button
          onClick={handleExportHTML}
          disabled={!currentNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-violet-500/20 text-violet-300 border border-violet-500/30
            hover:bg-violet-500/30 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="导出为 HTML"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>HTML</span>
        </button>

        {/* 导出 PDF */}
        <button
          onClick={handleExportPDF}
          disabled={!currentNote || isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-red-500/20 text-red-300 border border-red-500/30
            hover:bg-red-500/30 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="导出为 PDF"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>{isExporting ? '导出中...' : 'PDF'}</span>
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* 导入按钮 */}
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-blue-500/20 text-blue-300 border border-blue-500/30
            hover:bg-blue-500/30 transition-all duration-200"
          title="导入文件"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>导入</span>
        </button>

        {/* 复制内容 */}
        <button
          onClick={handleCopyContent}
          disabled={!currentNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-gray-500/20 text-gray-300 border border-gray-500/30
            hover:bg-gray-500/30 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="复制内容"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span>复制</span>
        </button>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div className={`
          fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl
          flex items-center gap-2 animate-bounce-in
          ${toast.type === 'success'
            ? 'bg-emerald-500/90 text-white border border-emerald-400'
            : 'bg-red-500/90 text-white border border-red-400'}
        `}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          50% { transform: translateY(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default FileToolbar;
