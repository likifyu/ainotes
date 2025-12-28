import React from 'react';
import { useStore } from '../store/useStore';
import aiApi from '../services/ai-api';

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  active?: boolean;
  isAI?: boolean;
  isTranslation?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  disabled,
  children,
  title,
  active,
  isAI,
  isTranslation,
}) => {
  const { theme } = useStore();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={"
        p-2 rounded-lg transition-all duration-200
        " + (disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700') + "
        " + (active ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : '') + "
        " + (isAI ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : '') + "
        " + (isTranslation ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : '') + "
        " + (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') + "
      "}
    >
      {children}
    </button>
  );
};

// Icons
const BoldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m0 0h4" />
  </svg>
);

const HeadingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TranslationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ContinueIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RewriteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ThemeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Toolbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentNote,
    isAILoading,
    setAILoading,
    addAIMessage,
    isTranslationPanelOpen,
    setTranslationPanelOpen,
  } = useStore();

  const insertFormat = (before: string, after: string = '') => {
    if (!currentNote) return;
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentNote.content;
    const selectedText = text.substring(start, end);
    const newContent = text.substring(0, start) + before + selectedText + after + text.substring(end);
    updateNote(currentNote.id, { content: newContent });
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + before.length, end + before.length); }, 0);
  };

  const updateNote = (id: string, updates: { content: string }) => { useStore.getState().updateNote(id, updates); };
  const toggleTranslationPanel = () => { setTranslationPanelOpen(!isTranslationPanelOpen); };

  const handleContinue = async () => {
    if (!currentNote || isAILoading) return;
    setAILoading(true);
    addAIMessage({ role: 'user', content: "请为以下内容续写：
" + currentNote.content.slice(-500), timestamp: new Date().toISOString() });
    try {
      const response = await aiApi.continue(currentNote.content);
      addAIMessage({ role: 'assistant', content: response.content, timestamp: new Date().toISOString() });
    } catch (error) {
      addAIMessage({ role: 'assistant', content: '抱歉，AI续写服务暂时不可用。', timestamp: new Date().toISOString() });
    } finally { setAILoading(false); }
  };

  const handleRewrite = async () => {
    if (!currentNote || isAILoading) return;
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea || textarea.selectionStart === textarea.selectionEnd) { alert('请先选中要改写的文字'); return; }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.content.substring(start, end);
    setAILoading(true);
    addAIMessage({ role: 'user', content: "请改写以下文字，使其更加清晰、专业：
" + selectedText, timestamp: new Date().toISOString() });
    try {
      const response = await aiApi.rewrite(selectedText, 'polish');
      addAIMessage({ role: 'assistant', content: response.content, timestamp: new Date().toISOString() });
    } catch (error) {
      addAIMessage({ role: 'assistant', content: '抱歉，AI改写服务暂时不可用。', timestamp: new Date().toISOString() });
    } finally { setAILoading(false); }
  };

  const toggleAIPanel = () => {
    const panel = document.querySelector('.ai-panel');
    if (panel) { panel.classList.toggle('translate-x-full'); }
  };

  return (
    <div className={"flex items-center justify-between px-4 py-2 border-b " + (theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => insertFormat('**', '**')} title="粗体 (Ctrl+B)"><BoldIcon /></ToolbarButton>
        <ToolbarButton onClick={() => insertFormat('*', '*')} title="斜体 (Ctrl+I)"><ItalicIcon /></ToolbarButton>
        <ToolbarButton onClick={() => insertFormat('### ')} title="三级标题"><HeadingIcon /></ToolbarButton>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <ToolbarButton onClick={() => { const url = prompt('请输入链接地址:'); if (url) insertFormat('[', '](' + url + ')'); }} title="插入链接"><LinkIcon /></ToolbarButton>
        <ToolbarButton onClick={() => { const url = prompt('请输入图片地址:'); if (url) insertFormat('![描述](', url + ')'); }} title="插入图片"><ImageIcon /></ToolbarButton>
      </div>
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={toggleTranslationPanel} title="翻译面板" isTranslation active={isTranslationPanelOpen}><TranslationIcon /></ToolbarButton>
      </div>
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={handleContinue} disabled={!currentNote || isAILoading} title="AI续写" isAI><ContinueIcon /></ToolbarButton>
        <ToolbarButton onClick={handleRewrite} disabled={!currentNote || isAILoading} title="选中文字改写" isAI><RewriteIcon /></ToolbarButton>
        <ToolbarButton onClick={toggleAIPanel} title="AI对话面板" isAI><AIIcon /></ToolbarButton>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <ToolbarButton onClick={toggleTheme} title="切换主题"><ThemeIcon /></ToolbarButton>
      </div>
    </div>
  );
};

export default Toolbar;
