import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import aiApi from '../services/ai-api';

// Icons
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const BotIcon = () => (
  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  </div>
);

const UserIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
);

const AIChatPanel: React.FC = () => {
  const {
    theme,
    aiMessages,
    isAILoading,
    setAILoading,
    addAIMessage,
    clearAIMessages,
    currentNote,
    notes,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSend = async () => {
    if (!input.trim() || isAILoading) return;

    const userMessage = input.trim();
    setInput('');

    addAIMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    setAILoading(true);

    try {
      // Build context from current note
      const context = currentNote
        ? '笔记标题: ' + currentNote.title + '\n\n笔记内容:\n' + (currentNote.content || '(空)')
        : '用户共有 ' + notes.length + ' 条笔记';

      // Call actual AI API
      const response = await aiApi.chat(userMessage, context);

      addAIMessage({
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      addAIMessage({
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAILoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Toggle Button (when panel is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed right-4 bottom-4 p-3 rounded-full shadow-lg
            bg-primary-600 hover:bg-primary-700 text-white
            transition-all duration-300 z-50
          `}
          title="打开AI对话"
        >
          <BotIcon />
        </button>
      )}

      {/* Panel */}
      <div
        className={`
          ai-panel fixed right-0 top-0 h-full w-96
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${theme === 'dark'
            ? 'bg-surface-dark border-l border-gray-700'
            : 'bg-white border-l border-gray-200'}
          shadow-2xl flex flex-col
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between p-4 border-b
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center gap-2">
            <BotIcon />
            <div>
              <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                AI 对话
              </h2>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                基于 {currentNote ? '当前笔记' : '所有笔记'} 智能分析
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAIMessages}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
              title="清空对话"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {aiMessages.length === 0 ? (
            <div className="text-center py-12">
              <BotIcon />
              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                您好！我是AI助手
              </p>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                可以基于您的笔记内容进行智能对话
              </p>
            </div>
          ) : (
            aiMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 message-enter ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {message.role === 'user' ? <UserIcon /> : <BotIcon />}
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-2
                    ${message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 text-gray-900'}
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}

          {isAILoading && (
            <div className="flex gap-3">
              <BotIcon />
              <div className={`rounded-2xl px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`
          p-4 border-t
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              rows={1}
              className={`
                flex-1 px-4 py-2 rounded-lg border resize-none
                text-sm focus:outline-none focus:ring-2 focus:ring-primary-500
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}
              `}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAILoading}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${!input.trim() || isAILoading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'}
              `}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatPanel;
