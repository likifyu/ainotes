/**
 * 富文本编辑器 - 基于 TipTap
 * 支持: Markdown 语法、高亮显示、表格、代码块等
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useStore } from '../store/useStore';
import soundService from '../services/sound-service';

// 扩展编辑器功能
const RichEditor: React.FC = () => {
  const { currentNote, updateNote, theme } = useStore();
  const [wordCount, setWordCount] = useState(0);

  // 创建编辑器实例
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm',
          },
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: currentNote?.content || '',
    editorProps: {
      attributes: {
        class: `
          prose prose-lg max-w-none
          dark:prose-invert
          focus:outline-none
          min-h-[calc(100vh-250px)] p-8
          ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}
        `,
      },
    },
    onUpdate: ({ editor }) => {
      if (currentNote) {
        const html = editor.getHTML();
        const text = editor.getText();
        updateNote(currentNote.id, { content: html });
        setWordCount(text.length);

        // 自动更新标题
        const firstLine = text.split('\n')[0].replace(/[#*`]/g, '').trim();
        if (firstLine && firstLine !== currentNote.title) {
          updateNote(currentNote.id, { title: firstLine.slice(0, 50) });
        }
      }
    },
  });

  // 监听笔记切换
  useEffect(() => {
    if (currentNote && editor) {
      const currentContent = editor.getHTML();
      if (currentContent !== currentNote.content) {
        editor.commands.setContent(currentNote.content);
      }
      setWordCount(currentNote.content.replace(/<[^>]*>/g, '').length);
    }
  }, [currentNote?.id, editor]);

  // 监听主题变化
  useEffect(() => {
    if (editor) {
      // TipTap 自动处理主题切换
    }
  }, [theme, editor]);

  // 格式化命令
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
    soundService.playClick();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
    soundService.playClick();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
    soundService.playClick();
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
    soundService.playClick();
  }, [editor]);

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
    soundService.playClick();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
    soundService.playClick();
  }, [editor]);

  const setHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
    soundService.playClick();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
    soundService.playClick();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
    soundService.playClick();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    soundService.playClick();
  }, [editor]);

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
      {/* 固定工具栏 */}
      <div className={`
        px-4 py-2 border-b flex items-center gap-1 flex-wrap
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
      `}>
        {/* 标题按钮 */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => setHeading(1)}
            className={`px-2 py-1 rounded text-sm font-bold ${
              editor?.isActive('heading', { level: 1 })
                ? 'bg-violet-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="一级标题"
          >
            H1
          </button>
          <button
            onClick={() => setHeading(2)}
            className={`px-2 py-1 rounded text-sm font-bold ${
              editor?.isActive('heading', { level: 2 })
                ? 'bg-violet-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="二级标题"
          >
            H2
          </button>
          <button
            onClick={() => setHeading(3)}
            className={`px-2 py-1 rounded text-sm font-bold ${
              editor?.isActive('heading', { level: 3 })
                ? 'bg-violet-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="三级标题"
          >
            H3
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* 文本格式化 */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBold}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('bold')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="粗体 (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
            </svg>
          </button>
          <button
            onClick={toggleItalic}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('italic')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="斜体 (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0v4m0 0l4 4m-4-4l-4 4M4 20h16" transform="skewX(-10)" />
            </svg>
          </button>
          <button
            onClick={toggleStrike}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('strike')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="删除线"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.3 4.9c-1.2-1-2.8-1.4-4.4-1.1-2.3.4-4 2.5-4 4.9 0 1.6.5 3.1 1.4 4.3m-1.2 2.9c-.7.9-1 2-1 3.2 0 2.5 2 4.6 4.5 4.6h.5m6.5-10.3c-1.3-1.2-3-1.9-4.9-1.9-3.2 0-5.9 2.3-6.4 5.4" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* 列表 */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBulletList}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('bulletList')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="无序列表"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={toggleOrderedList}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('orderedList')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="有序列表"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* 代码和引用 */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleCode}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('code')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="行内代码"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <button
            onClick={toggleCodeBlock}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('codeBlock')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="代码块"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={toggleBlockquote}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('blockquote')
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="引用"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* 表格 */}
        <button
          onClick={insertTable}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="插入表格"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* 撤销/重做 */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="撤销 (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="重做 (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* 悬浮工具栏 - 选中文字时显示 */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg
            ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
          `}
        >
          <button
            onClick={toggleBold}
            className={`p-1 rounded ${
              editor.isActive('bold') ? 'bg-violet-100 dark:bg-violet-900' : ''
            }`}
          >
            <span className="font-bold text-sm">B</span>
          </button>
          <button
            onClick={toggleItalic}
            className={`p-1 rounded ${
              editor.isActive('italic') ? 'bg-violet-100 dark:bg-violet-900' : ''
            }`}
          >
            <span className="italic text-sm">I</span>
          </button>
          <button
            onClick={toggleCode}
            className={`p-1 rounded ${
              editor.isActive('code') ? 'bg-violet-100 dark:bg-violet-900' : ''
            }`}
          >
            <span className="font-mono text-sm">&lt;/&gt;</span>
          </button>
        </BubbleMenu>
      )}

      {/* 编辑区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 状态栏 */}
      <div className={`
        px-8 py-2 border-t text-xs flex items-center justify-between
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}
      `}>
        <span>
          {wordCount} 字符
        </span>
        <span>
          {currentNote.updatedAt ? new Date(currentNote.updatedAt).toLocaleString('zh-CN') : ''}
        </span>
      </div>
    </div>
  );
};

export default RichEditor;
