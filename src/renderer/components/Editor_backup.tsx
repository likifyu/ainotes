import React, { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const Editor: React.FC = () => {
  const { currentNote, updateNote, theme } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (currentNote) {
        updateNote(currentNote.id, { content: e.target.value });

        // Auto-save title from first line
        const firstLine = e.target.value.split('\n')[0].replace(/[#*`]/g, '').trim();
        if (firstLine && firstLine !== currentNote.title) {
          updateNote(currentNote.id, { title: firstLine.slice(0, 50) });
        }
      }
    },
    [currentNote, updateNote]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentNote) {
        updateNote(currentNote.id, { title: e.target.value });
      }
    },
    [currentNote, updateNote]
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentNote?.content]);

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg">选择一个笔记开始编辑</p>
          <p className="text-sm mt-2">或创建新笔记</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Title Input */}
      <div className={`
        px-8 py-4 border-b
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <input
          type="text"
          value={currentNote.title}
          onChange={handleTitleChange}
          placeholder="笔记标题"
          className={`
            w-full text-2xl font-bold bg-transparent border-none outline-none
            ${theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
          `}
        />
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={currentNote.content}
            onChange={handleContentChange}
            placeholder="开始输入... 支持 Markdown 格式

# 一级标题
## 二级标题
### 三级标题

**粗体** *斜体*

[链接](https://example.com)

![图片描述](https://example.com/image.png)"
            className={`
              w-full min-h-[calc(100vh-200px)] p-8 bg-transparent border-none outline-none resize-none
              text-base leading-relaxed
              ${theme === 'dark' ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
            `}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className={`
        px-8 py-2 border-t text-xs flex items-center justify-between
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}
      `}>
        <span>
          {currentNote.content.length} 字符
        </span>
        <span>
          最后更新: {new Date(currentNote.updatedAt).toLocaleString('zh-CN')}
        </span>
      </div>
    </div>
  );
};

export default Editor;
