import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}

// AI Model configuration
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon: string;
  color: string;
  enableSearch: boolean;
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'minimax-m2',
    name: 'MiniMax M2',
    provider: 'MiniMax',
    icon: '🚀',
    color: 'from-purple-500 to-pink-500',
    enableSearch: true,
    description: '支持联网搜索',
  },
  {
    id: 'wolfai-claude',
    name: 'Claude 4.5',
    provider: 'WolfAI',
    icon: '🐺',
    color: 'from-orange-500 to-red-500',
    enableSearch: false,
    description: 'Claude Sonnet 高质量',
  },
  {
    id: 'leocoder-claude',
    name: 'Claude',
    provider: 'Leocoder',
    icon: '🦉',
    color: 'from-blue-500 to-cyan-500',
    enableSearch: false,
    description: 'Claude 代理服务',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    icon: '🔱',
    color: 'from-teal-500 to-emerald-500',
    enableSearch: false,
    description: '便宜高性价比',
  },
  {
    id: 'bigmodel-glm4',
    name: 'GLM-4',
    provider: '智谱AI',
    icon: '✨',
    color: 'from-violet-500 to-purple-500',
    enableSearch: false,
    description: '国内服务稳定',
  },
];

// Note Templates
export const NOTE_TEMPLATES = [
  {
    id: 'meeting',
    name: '会议记录',
    icon: '📝',
    content: `# 会议记录

## 基本信息
- **会议主题**：
- **时间**：
- **地点**：
- **参与人员**：

## 议程内容

### 1.
### 2.
### 3.

## 讨论要点

## 决议事项

## 待办事项
- [ ]
- [ ]

## 下次会议安排`,
  },
  {
    id: 'journal',
    name: '日记',
    icon: '📔',
    content: `# {{date}}

## 今日总结

## 学习收获

## 明日计划
- [ ]
- [ ]

## 心情记录`,
  },
  {
    id: 'idea',
    name: '灵感笔记',
    icon: '💡',
    content: `# 灵感记录

## 想法概述

## 详细描述

## 应用场景

## 实施步骤

## 相关资源`,
  },
  {
    id: 'study',
    name: '学习笔记',
    icon: '📚',
    content: `# {{title}}

## 学习目标

## 核心概念

### 1.
### 2.
### 3.

## 实践应用

## 常见问题

## 参考资料`,
  },
  {
    id: 'blog',
    name: '博客文章',
    icon: '✍️',
    content: `# {{title}}

## 引言

## 正文内容

### 观点一

### 观点二

## 总结

## 参考资料`,
  },
];

// AI Preset Prompts
export const AI_PROMPTS = [
  {
    id: 'polish',
    name: '润色文章',
    icon: '✨',
    prompt: '请润色以下文字，使其更加流畅、专业：',
  },
  {
    id: 'summarize',
    name: '总结摘要',
    icon: '📋',
    prompt: '请总结以下内容的要点：',
  },
  {
    id: 'translate',
    name: '翻译',
    icon: '🌐',
    prompt: '请翻译以下内容：',
  },
  {
    id: 'expand',
    name: '扩展内容',
    icon: '📖',
    prompt: '请扩展以下内容，添加更多细节：',
  },
  {
    id: 'simplify',
    name: '简化',
    icon: '🔍',
    prompt: '请简化以下内容，使其更简洁：',
  },
];

// Helper to get current timestamp
const getTimestamp = () => new Date().toISOString();

// Create store
export const useStore = create<AppState>((set, get) => ({
  // Initial state
  notes: [],
  currentNote: null,
  searchQuery: '',
  theme: 'dark',
  aiMessages: [],
  isAILoading: false,
  currentModel: AI_MODELS[0],
  isModelDropdownOpen: false,
  isTranslationPanelOpen: false,

  // Authentication state
  isAuthenticated: false,
  userPhone: '',
  userEmail: '',
  isAuthModalOpen: false,

  // Note actions
  setNotes: (notes) => set({ notes }),

  setCurrentNote: (note) => set({ currentNote: note }),

  createNote: (templateId) => {
    const template = NOTE_TEMPLATES.find(t => t.id === templateId);
    const today = new Date().toLocaleDateString('zh-CN');
    const content = template
      ? template.content.replace(/\{\{date\}\}/g, today)
      : '';

    const newNote: Note = {
      id: uuidv4(),
      title: template ? template.name : '新笔记',
      content: content,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      isFavorite: false,
    };
    set((state) => ({
      notes: [newNote, ...state.notes],
      currentNote: newNote,
    }));
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: getTimestamp() }
          : note
      ),
      currentNote:
        state.currentNote?.id === id
          ? { ...state.currentNote, ...updates, updatedAt: getTimestamp() }
          : state.currentNote,
    }));
  },

  deleteNote: (id) => {
    set((state) => {
      const newNotes = state.notes.filter((note) => note.id !== id);
      return {
        notes: newNotes,
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
      };
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleFavorite: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
      ),
    }));
  },

  // Theme actions
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // AI Chat actions
  setAIMessages: (messages) => set({ aiMessages: messages }),

  addAIMessage: (message) =>
    set((state) => ({
      aiMessages: [...state.aiMessages, message],
    })),

  setAILoading: (loading) => set({ isAILoading: loading }),

  clearAIMessages: () => set({ aiMessages: [] }),

  // AI Model actions
  setCurrentModel: (model) => {
    set({ currentModel: model, isModelDropdownOpen: false });
  },

  setModelDropdownOpen: (open) => set({ isModelDropdownOpen: open }),

  // Translation panel actions
  setTranslationPanelOpen: (open) => set({ isTranslationPanelOpen: open }),

  toggleTranslationPanel: () => set((state) => ({ isTranslationPanelOpen: !state.isTranslationPanelOpen })),

  // Authentication actions
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  setUserPhone: (phone) => set({ userPhone: phone }),

  setUserEmail: (email) => set({ userEmail: email }),

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  logout: () => set({
    isAuthenticated: false,
    userPhone: '',
    userEmail: '',
  }),
}));

// Selectors
export const selectFilteredNotes = (state: AppState) => {
  if (!state.searchQuery.trim()) return state.notes;
  const query = state.searchQuery.toLowerCase();
  return state.notes.filter(
    (note) =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
  );
};

export const selectFavoriteNotes = (state: AppState) => {
  return state.notes.filter((note) => note.isFavorite);
};
