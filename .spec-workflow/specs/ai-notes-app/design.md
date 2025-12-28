# AI Notes App - 技术设计文档

## 技术选型

### 前端框架
- **Electron**: 跨平台桌面应用框架
- **React 18**: UI组件库
- **TypeScript**: 类型安全的开发语言
- **Tailwind CSS**: 原子化CSS框架

### 状态管理
- **Zustand**: 轻量级状态管理

### 数据存储
- **SQLite**: 本地关系型数据库
- **better-sqlite3**: Node.js SQLite绑定

### AI集成
- **OpenRouter API**: 多模型AI服务接口

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                 │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   IPC Layer                         ││
│  │  ┌─────────────┐    ┌─────────────┐                ││
│  │  │  NoteStore  │    │  AIService  │                ││
│  │  │  (SQLite)   │    │  (API)      │                ││
│  │  └─────────────┘    └─────────────┘                ││
└─────────────────────────────────────────────────────────┘
                         │
                    IPC Bridge
                         │
┌─────────────────────────────────────────────────────────┐
│                    Electron Renderer Process             │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   React App                         ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐   ││
│  │  │ Sidebar   │  │  Editor   │  │ AIChatPanel   │   ││
│  │  │ Component │  │ Component │  │ Component     │   ││
│  │  └───────────┘  └───────────┘  └───────────────┘   ││
│  │  ┌───────────────────────────────────────────────┐ ││
│  │  │              Zustand Store                    │ ││
│  │  │  - notes: Note[]                              │ ││
│  │  │  - currentNote: Note | null                   │ ││
│  │  │  - aiChat: ChatMessage[]                      │ ││
│  │  │  - theme: 'light' | 'dark'                    │ ││
│  │  └───────────────────────────────────────────────┘ ││
└─────────────────────────────────────────────────────────┘
```

## 数据模型

### Note (笔记)
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

### ChatMessage (对话消息)
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

## 组件结构

### 前端组件
- `App`: 主应用组件
- `Sidebar`: 左侧笔记列表组件
- `NoteList`: 笔记列表渲染组件
- `NoteCard`: 单个笔记卡片组件
- `Editor`: 右侧编辑器组件
- `Toolbar`: 格式化工具栏组件
- `AIChatPanel`: AI对话面板组件
- `ChatMessageList`: 对话消息列表组件
- `ChatInput`: 对话输入框组件

### 主进程模块
- `database.ts`: 数据库操作模块
- `ai-service.ts`: AI服务集成模块
- `ipc-handler.ts`: IPC通信处理模块

## 目录结构

```
E:/笔记程序/
├── src/
│   ├── main/
│   │   ├── main.ts              # Electron入口
│   │   ├── database.ts          # SQLite数据库
│   │   ├── ai-service.ts        # AI服务
│   │   └── ipc-handler.ts       # IPC处理器
│   ├── renderer/
│   │   ├── App.tsx              # React主组件
│   │   ├── index.tsx            # 渲染进程入口
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Editor.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── AIChatPanel.tsx
│   │   ├── store/
│   │   │   └── useStore.ts      # Zustand状态管理
│   │   └── styles/
│   │       └── index.css
│   └── preload/
│       └── preload.ts           # 预加载脚本
├── .spec-workflow/
│   └── specs/ai-notes-app/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── UI设计图.png
├── 设计哲学.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.json5
```

## API接口设计

### IPC通信协议

| 通道名 | 方向 | 用途 |
|--------|------|------|
| `note:getAll` | renderer→main | 获取所有笔记 |
| `note:get` | renderer→main | 获取单个笔记 |
| `note:create` | renderer→main | 创建笔记 |
| `note:update` | renderer→main | 更新笔记 |
| `note:delete` | renderer→main | 删除笔记 |
| `ai:chat` | renderer→main | AI对话请求 |
| `ai:continue` | renderer→main | 续写请求 |
| `ai:rewrite` | renderer→main | 改写请求 |

## UI/UX设计

### 设计哲学
- **智慧静默**: 静默的智能，极致的细节
- **双列布局**: 左侧笔记列表，右侧编辑器
- **蓝紫色系**: 专业且现代的视觉风格
- **暗色模式**: 保护视力的深灰蓝背景

### 交互规范
- 笔记列表宽度: 280-320px
- 工具栏固定在编辑器顶部
- AI对话面板从右侧滑入
- 平滑的过渡动画 (200ms)
