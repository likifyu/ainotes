import React, { useState, useRef, useEffect } from 'react';
import { useStore, AI_PROMPTS } from '../store/useStore';

interface AIToolSelectorProps {
  onSelectPrompt: (prompt: string) => void;
}

const AIToolSelector: React.FC<AIToolSelectorProps> = ({ onSelectPrompt }) => {
  const { currentNote } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTool = (promptId: string) => {
    const tool = AI_PROMPTS.find(t => t.id === promptId);
    if (tool) {
      onSelectPrompt(tool.prompt);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gradient-to-r from-violet-500/20 to-purple-500/20
          border border-violet-500/30 hover:border-violet-500/50
          transition-all duration-300 group
        `}
      >
        <span className="text-lg">🤖</span>
        <span className="text-sm font-medium text-violet-300">AI 工具</span>
        <svg
          className={`w-4 h-4 text-violet-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 min-w-56">
            <div className={`
              rounded-2xl overflow-hidden
              bg-gray-900/95 backdrop-blur-xl
              border border-white/10 shadow-2xl
              animate-dropdown-in
            `}>
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-gray-400">AI 快捷工具</h3>
              </div>
              <div className="py-2">
                {!currentNote?.content && (
                  <div className="px-4 py-2 text-xs text-gray-500 text-center">
                    请先在笔记中输入内容
                  </div>
                )}
                {AI_PROMPTS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.id)}
                    disabled={!currentNote?.content}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2
                      transition-colors
                      ${currentNote?.content ? 'hover:bg-white/5' : 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <div className="flex-1 text-left">
                      <span className="text-sm text-white">{tool.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown-in { animation: dropdown-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default AIToolSelector;
