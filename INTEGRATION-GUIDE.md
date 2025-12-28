# 手动集成指南

## 问题原因

由于 Bash/Shell 模板字符串转义问题，无法通过脚本自动将 FileToolbar 和表格按钮集成到 Editor.tsx。需要手动操作。

## 步骤

### 1. 打开 Editor.tsx

文件路径：`src/renderer/components/Editor.tsx`

### 2. 添加导入语句

在文件顶部添加：

```typescript
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import FileToolbar from './FileToolbar';           // ✅ 添加这行
import soundService from '../services/sound-service'; // ✅ 添加这行

const Editor: React.FC = () => {
  // ... existing code
```

### 3. 添加表格插入函数

在组件内部添加：

```typescript
const Editor: React.FC = () => {
  const { currentNote, updateNote, theme } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTableHelp, setShowTableHelp] = useState(false); // ✅ 添加这行

  // ... existing handlers

  // ✅ 添加表格插入函数
  const insertTable = () => {
    if (!currentNote || !textareaRef.current) return;
    const tableTemplate = '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n';
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const text = currentNote.content;
    const newContent = text.substring(0, start) + tableTemplate + text.substring(start);
    updateNote(currentNote.id, { content: newContent });
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tableTemplate.indexOf('内容');
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
    soundService.playClick();
  };

  // ✅ 添加复选框插入函数
  const insertCheckbox = () => {
    if (!currentNote || !textareaRef.current) return;
    const checkbox = '- [ ] ';
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const text = currentNote.content;
    const newContent = text.substring(0, start) + checkbox + text.substring(start);
    updateNote(currentNote.id, { content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + checkbox.length, start + checkbox.length);
    }, 0);
    soundService.playClick();
  };

  // ... rest of component
```

### 4. 添加 Ctrl+S 快捷键

在 useEffect 中添加：

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      soundService.playSave();
      window.dispatchEvent(new CustomEvent('save-note'));
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 5. 在 JSX 中添加 FileToolbar

在标题输入框下方添加：

```tsx
return (
  <div className="flex-1 flex flex-col overflow-hidden">
    <div className={`px-8 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <input
        type="text"
        value={currentNote.title}
        onChange={handleTitleChange}
        placeholder="笔记标题"
        className={`w-full text-2xl font-bold bg-transparent border-none outline-none ${
          theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
        }`}
      />
    </div>

    {/* ✅ 添加 FileToolbar */}
    <FileToolbar />

    {/* ✅ 添加表格按钮工具栏 */}
    <div className={`flex items-center gap-1 px-4 py-2 border-b ${
      theme === 'dark' ? 'bg-gray-800/30 border-white/5' : 'bg-gray-50 border-gray-200'
    }`}>
      <button onClick={insertTable} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-all" title="插入表格">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>表格</span>
      </button>
      <button onClick={insertCheckbox} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all" title="插入复选框">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span>待办</span>
      </button>
      <div className="w-px h-4 bg-white/10 mx-2" />
      <button onClick={() => setShowTableHelp(!showTableHelp)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white transition-all" title="表格语法帮助">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>

    {/* Add table help modal here */}

    {/* Editor textarea */}
    <div className="flex-1 overflow-y-auto">
      {/* ... textarea ... */}
    </div>

    {/* Status bar */}
    <div className={`px-8 py-2 border-t text-xs flex items-center justify-between ${
      theme === 'dark' ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
    }`}>
      {/* ... status content ... */}
    </div>
  </div>
);
```

### 6. 添加表格帮助弹窗

在组件返回值中添加：

```tsx
{showTableHelp && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowTableHelp(false)}>
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-bold text-white mb-4">Markdown 表格语法</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">基本表格：</p>
          <pre className="bg-gray-800 p-3 rounded-lg text-xs text-green-400 overflow-x-auto">
            | 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |
          </pre>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-2">对齐方式：</p>
          <pre className="bg-gray-800 p-3 rounded-lg text-xs text-green-400 overflow-x-auto">
            | 左对齐 | 居中 | 右对齐 |\n|:-----|:---:|-----:|\n| 内容 | 内容 | 内容 |
          </pre>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-2">复选框待办：</p>
          <pre className="bg-gray-800 p-3 rounded-lg text-xs text-green-400 overflow-x-auto">
            - [ ] 未完成\n- [x] 已完成
          </pre>
        </div>
      </div>
      <button onClick={() => setShowTableHelp(false)} className="mt-4 w-full py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-all">
        知道了
      </button>
    </div>
  </div>
)}
```

## 测试

完成手动集成后：

1. 运行开发服务器：
```bash
npm run dev
```

2. 创建新笔记测试：
   - 点击"新建笔记"
   - 测试 Ctrl+S 快捷键（应听到音效）
   - 点击"表格"按钮（应插入表格模板）
   - 点击"待办"按钮（应插入复选框）
   - 点击"保存"按钮（应打开文件对话框）

3. 验证功能：
   - FileToolbar 可见并正常工作
   - 表格按钮可见并正常工作
   - 音效播放正常
   - 文件保存/导出正常工作
