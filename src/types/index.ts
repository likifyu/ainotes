/**
 * 全局类型定义扩展
 */

// ==================== 翻译相关类型 ====================

export type TranslationEngine = 'baidu' | 'youdao' | 'google' | 'deepl' | 'ai';

export interface TranslationConfig {
  engine: TranslationEngine;
  apiKey?: string;
  appId?: string;
  secretKey?: string;
}

export interface TranslationResult {
  success: boolean;
  text: string;
  sourceLang: string;
  targetLang: string;
  engine: TranslationEngine;
  error?: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nameCN: string;
}

export interface TranslationHistory {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  engine: TranslationEngine;
  timestamp: number;
}

// ==================== 文档相关类型 ====================

export type DocumentType = 'markdown' | 'html' | 'docx' | 'xlsx' | 'pdf';

export interface DocumentInfo {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExportOptions {
  format: DocumentType;
  filename?: string;
  includeStyles?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ImportResult {
  success: boolean;
  filename: string;
  content: string;
  type: DocumentType;
  error?: string;
}

// ==================== 表格相关类型 ====================

export interface TableCell {
  content: string;
  colspan?: number;
  rowspan?: number;
  alignment?: 'left' | 'center' | 'right';
  isHeader?: boolean;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableData {
  rows: TableRow[];
  hasHeader?: boolean;
}

// ==================== AI 相关类型扩展 ====================

export interface AIRequest {
  prompt: string;
  context?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  success: boolean;
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export type AIOperation = 'continue' | 'rewrite' | 'summarize' | 'translate' | 'polish' | 'grammar';

// ==================== 编辑器相关类型 ====================

export interface EditorState {
  content: string;
  selection?: {
    from: number;
    to: number;
  };
  cursorPosition: number;
}

export interface FormatAction {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'heading' | 'list' | 'code' | 'link' | 'image';
  value?: string | number;
}

// ==================== 音效相关类型 ====================

export type SoundType = 'complete' | 'save' | 'click' | 'error' | 'notification';

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  sounds: Record<SoundType, boolean>;
}

// ==================== 主题相关类型 ====================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
}

// ==================== 存储相关类型 ====================

export interface AppSettings {
  // 基础设置
  language: string;
  theme: ThemeConfig;
  sound: SoundConfig;

  // 编辑器设置
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;

  // 翻译设置
  translationEngine: TranslationEngine;
  autoDetectLanguage: boolean;
  defaultTargetLang: string;

  // 快捷键
  shortcuts: Record<string, string>;
}

// ==================== 事件相关类型 ====================

export interface AppEventMap {
  'note:created': { noteId: string };
  'note:updated': { noteId: string; changes: Partial<DocumentInfo> };
  'note:deleted': { noteId: string };
  'translation:completed': { original: string; translated: string };
  'file:exported': { filename: string; format: DocumentType };
  'theme:changed': { mode: ThemeMode };
  'error:occurred': { error: Error; context: string };
}

// 事件监听器类型
export type EventListener<K extends keyof AppEventMap> = (data: AppEventMap[K]) => void;

// ==================== 窗口相关类型 ====================

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ==================== 导入/导出 ====================

// 从其他模块导入的类型
export { Note, NoteStore } from '../renderer/store/useStore';
