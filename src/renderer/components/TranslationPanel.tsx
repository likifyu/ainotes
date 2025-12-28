/**
 * 翻译面板组件
 * 支持: 多引擎翻译、语言选择、历史记录
 * 从右侧滑入面板样式
 */

import React, { useState, useCallback } from 'react';
import {
  translationService,
  SUPPORTED_LANGUAGES,
  TranslationEngine,
} from '../services/translation-service';
import { BAIDU_CONFIG } from '../config/translation-config';
import { useStore } from '../store/useStore';
import soundService from '../services/sound-service';
import { aiApi } from '../services/ai-api';

// 设置 AI 翻译函数 - 支持浏览器和 Electron 环境
const aiTranslate = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.nameCN || '自动检测';
  const targetName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.nameCN || '目标语言';

  const prompt = "请将以下文本从" + sourceName + "翻译成" + targetName + "，只输出翻译结果，不要任何解释：

" + text;

  // 优先使用 Electron API（桌面应用）
  if (window.electronAPI?.aiChat) {
    const response = await window.electronAPI.aiChat(prompt, '');
    return response;
  }

  // 浏览器环境：直接调用 AI API
  const result = await aiApi.chat(prompt, '');
  return result.content;
};

// 初始化翻译服务配置
translationService.updateConfig({
  engine: 'ai',
  appId: BAIDU_CONFIG.appId,
  secretKey: BAIDU_CONFIG.secretKey,
});

// 设置 AI 翻译回调
translationService.setAITranslateFn(aiTranslate);

// 翻译历史记录
interface TranslationHistoryItem {
  id: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  engine: TranslationEngine;
  timestamp: number;
}

const TranslationPanel: React.FC = () => {
  const { theme, currentNote, isTranslationPanelOpen, setTranslationPanelOpen } = useStore();

  // 状态
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('zh-CN');
  const [engine, setEngine] = useState<TranslationEngine>('ai');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 翻译引擎选项
  const engines: { id: TranslationEngine; name: string; icon: string }[] = [
    { id: 'ai', name: 'AI智能翻译', icon: '🤖' },
    { id: 'baidu', name: '百度翻译', icon: '🔍' },
    { id: 'youdao', name: '有道翻译', icon: '📚' },
    { id: 'google', name: 'Google翻译', icon: '🌐' },
    { id: 'deepl', name: 'DeepL', icon: '🎯' },
  ];

  // 检测语言
  const detectLanguage = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      const detected = await translationService.detectLanguage(inputText);
      if (detected !== 'en') {
        setSourceLang(detected);
      }
    } catch (err) {
      console.error('Language detection failed:', err);
    }
  }, [inputText]);

  // 翻译功能
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    setError(null);
    soundService.playClick();

    try {
      translationService.updateConfig({ engine });

      const result = await translationService.translate(inputText, sourceLang, targetLang);

      if (result.success) {
        setOutputText(result.text);

        const newItem: TranslationHistoryItem = {
          id: Date.now().toString(),
          original: inputText,
          translated: result.text,
          sourceLang: result.sourceLang,
          targetLang: result.targetLang,
          engine: result.engine,
          timestamp: Date.now(),
        };
        setHistory(prev => [newItem, ...prev].slice(0, 50));

        soundService.playComplete();
      } else {
        setError(result.error || '翻译失败');
        soundService.playClick();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败');
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, sourceLang, targetLang, engine, isTranslating]);

  // 快捷翻译当前笔记
  const translateCurrentNote = useCallback(async () => {
    if (!currentNote) return;

    const text = currentNote.content.replace(/<[^>]*>/g, '');
    setInputText(text.slice(0, 2000));
    await handleTranslate();
  }, [currentNote, handleTranslate]);

  // 复制翻译结果
  const copyResult = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      soundService.playClick();
    }
  }, [outputText]);

  // 交换语言
  const swapLanguages = useCallback(() => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);

    if (outputText) {
      setInputText(outputText);
      setOutputText(inputText);
    }
  }, [sourceLang, targetLang, inputText, outputText]);

  // 清空输入
  const clearInput = useCallback(() => {
    setInputText('');
    setOutputText('');
    setError(null);
  }, []);

  // 关闭面板
  const closePanel = useCallback(() => {
    setTranslationPanelOpen(false);
  }, [setTranslationPanelOpen]);

  // 从历史记录加载
  const loadFromHistory = (item: TranslationHistoryItem) => {
    setInputText(item.original);
    setOutputText(item.translated);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setEngine(item.engine);
  };

  // 如果面板未打开，返回空
  if (!isTranslationPanelOpen) {
    return null;
  }

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closePanel}
      />

      {/* 右侧滑入面板 */}
      <div
        className={
          "fixed top-0 right-0 h-full w-96 z-50 " +
          "transform transition-transform duration-300 ease-in-out " +
          "shadow-2xl flex flex-col " +
          (theme === 'dark' ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200')
        }
      >
        {/* 头部 */}
        <div className={
          "px-4 py-3 flex items-center justify-between border-b " +
          (theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200')
        }>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span className="font-semibold">智能翻译</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={
                "p-2 rounded-lg transition-colors " +
                (showHistory ? 'bg-violet-100 dark:bg-violet-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700')
              }
              title="翻译历史"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={closePanel}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 引擎选择 */}
        <div className={
          "px-4 py-2 border-b flex gap-2 overflow-x-auto " +
          (theme === 'dark' ? 'border-gray-700' : 'border-gray-200')
        }>
          {engines.map(e => (
            <button
              key={e.id}
              onClick={() => setEngine(e.id)}
              className={
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap " +
                "transition-all " +
                (engine === e.id
                  ? 'bg-violet-500 text-white'
                  : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')
              }
            >
              <span>{e.icon}</span>
              <span>{e.name}</span>
            </button>
          ))}
        </div>

        {/* 语言选择 */}
        <div className={
          "px-4 py-3 flex items-center gap-2 border-b " +
          (theme === 'dark' ? 'border-gray-700' : 'border-gray-200')
        }>
          <select
            value={sourceLang}
            onChange={e => setSourceLang(e.target.value)}
            className={
              "flex-1 px-3 py-2 rounded-lg text-sm outline-none " +
              (theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200') +
              " border focus:border-violet-500"
            }
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.nameCN} ({lang.name})
              </option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="交换语言"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <select
            value={targetLang}
            onChange={e => setTargetLang(e.target.value)}
            className={
              "flex-1 px-3 py-2 rounded-lg text-sm outline-none " +
              (theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200') +
              " border focus:border-violet-500"
            }
          >
            {SUPPORTED_LANGUAGES.filter(l => l.code !== 'auto').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.nameCN} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        {/* 历史记录面板 */}
        {showHistory && (
          <div className={
            "h-48 overflow-y-auto border-b " +
            (theme === 'dark' ? 'border-gray-700' : 'border-gray-200')
          }>
            {history.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                暂无翻译历史
              </div>
            ) : (
              <div className="divide-y">
                {history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className={
                      "w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 " +
                      (theme === 'dark' ? 'border-gray-700' : 'border-gray-100') +
                      " border-b"
                    }
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {SUPPORTED_LANGUAGES.find(l => l.code === item.targetLang)?.nameCN} · {item.engine}
                    </div>
                    <div className="text-sm line-clamp-2">{item.translated}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 输入区域 */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="输入要翻译的文本..."
            className={
              "w-full h-32 p-3 rounded-lg resize-none outline-none text-sm " +
              (theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200') +
              " border focus:border-violet-500"
            }
          />

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={clearInput}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="清空"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {currentNote && (
              <button
                onClick={translateCurrentNote}
                className="px-3 py-1.5 text-xs rounded-lg bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
              >
                翻译当前笔记
              </button>
            )}

            <button
              onClick={detectLanguage}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              检测语言
            </button>

            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
              className={
                "flex-1 py-2 rounded-lg text-white font-medium transition-all " +
                (isTranslating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700')
              }
            >
              {isTranslating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  翻译中...
                </span>
              ) : (
                '立即翻译'
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* 输出区域 */}
          {outputText && (
            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">翻译结果</span>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制
                </button>
              </div>
              <div className={
                "flex-1 p-3 rounded-lg overflow-y-auto text-sm " +
                (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50')
              }>
                {outputText}
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className={
          "px-4 py-2 text-xs text-center border-t " +
          (theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400')
        }>
          支持 30+ 语言翻译
        </div>
      </div>
    </>
  );
};

export default TranslationPanel;
