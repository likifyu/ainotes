import React, { useRef, useEffect } from 'react';
import { useStore, AI_MODELS, AIModel } from '../store/useStore';

const ModelSelector: React.FC = () => {
  const { currentModel, isModelDropdownOpen, setModelDropdownOpen, setCurrentModel } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setModelDropdownOpen]);

  const handleSelectModel = (model: AIModel) => {
    setCurrentModel(model);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setModelDropdownOpen(!isModelDropdownOpen)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl
          bg-gradient-to-r ${currentModel.color} bg-opacity-10
          border border-white/10 hover:border-white/20
          transition-all duration-300 group
          backdrop-blur-sm
        `}
      >
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          bg-gradient-to-r ${currentModel.color}
          text-white text-lg shadow-lg group-hover:scale-110 transition-transform
        `}>
          {currentModel.icon}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{currentModel.name}</span>
            {currentModel.enableSearch && (
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                联网
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>{currentModel.provider}</span>
            <span>•</span>
            <span>{currentModel.description}</span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isModelDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setModelDropdownOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className={`
              rounded-2xl overflow-hidden
              bg-gray-900/95 backdrop-blur-xl
              border border-white/10 shadow-2xl
              transform transition-all duration-300 origin-top
              animate-dropdown-in
            `}>
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-gray-400">选择 AI 模型</h3>
              </div>

              {/* Model List */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3
                      transition-all duration-200
                      hover:bg-white/5
                      ${currentModel.id === model.id ? 'bg-white/10' : ''}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      bg-gradient-to-r ${model.color}
                      text-white text-lg shadow-lg
                    `}>
                      {model.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{model.name}</span>
                        {model.enableSearch && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                            联网
                          </span>
                        )}
                        {currentModel.id === model.id && (
                          <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span>{model.provider}</span>
                        <span>•</span>
                        <span>{model.description}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                <p className="text-xs text-gray-500 text-center">
                  💡 点击模型即可切换，当前：{currentModel.name}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-dropdown-in {
          animation: dropdown-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ModelSelector;
