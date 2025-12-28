import React, { useState, useRef, useEffect } from 'react';
import { useStore, NOTE_TEMPLATES } from '../store/useStore';

const TemplateSelector: React.FC = () => {
  const { createNote } = useStore();
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

  const handleSelectTemplate = (templateId: string) => {
    createNote(templateId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl
          bg-white/5 border border-white/10 hover:bg-white/10
          transition-all duration-300 group
        `}
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
          📄
        </div>
        <div className="flex-1 text-left">
          <span className="font-medium text-white">新建笔记</span>
          <div className="text-xs text-gray-400">选择模板快速开始</div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className={`
              rounded-2xl overflow-hidden
              bg-gray-900/95 backdrop-blur-xl
              border border-white/10 shadow-2xl
              animate-dropdown-in
            `}>
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-gray-400">选择模板</h3>
              </div>
              <div className="py-2">
                {/* Blank template option */}
                <button
                  onClick={() => {
                    createNote();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-lg">
                    📝
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-white">空白笔记</span>
                    <div className="text-xs text-gray-400">从零开始书写</div>
                  </div>
                </button>

                {NOTE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg">
                      {template.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium text-white">{template.name}</span>
                      <div className="text-xs text-gray-400">预置结构模板</div>
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

export default TemplateSelector;
