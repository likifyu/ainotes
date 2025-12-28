# AI Notes App - 任务清单

## 项目初始化

### Task 1: 初始化项目结构
- **描述**: 创建Electron + React + TypeScript项目基础结构
- **文件**:
  - `package.json`: 项目配置和依赖
  - `tsconfig.json`: TypeScript配置
  - `vite.config.ts`: Vite构建配置
  - `electron-builder.json5`: Electron打包配置
- **验收标准**: 项目能够成功运行开发和构建命令
- **状态**: [ ]

### Task 2: 配置Tailwind CSS
- **描述**: 配置Tailwind CSS框架和暗色模式
- **文件**: `src/renderer/styles/index.css`, `tailwind.config.js`
- **验收标准**: 能够使用Tailwind类名进行样式编写，暗色模式切换正常
- **状态**: [ ]

## 核心功能

### Task 3: 实现数据库模块
- **描述**: 实现SQLite数据库操作，笔记的CRUD功能
- **文件**: `src/main/database.ts`
- **接口**:
  - `getAllNotes()`: 获取所有笔记
  - `getNote(id)`: 获取单个笔记
  - `createNote(note)`: 创建笔记
  - `updateNote(id, note)`: 更新笔记
  - `deleteNote(id)`: 删除笔记
- **状态**: [ ]

### Task 4: 实现笔记列表组件
- **描述**: 实现左侧笔记列表UI，支持搜索和笔记切换
- **文件**: `src/renderer/components/Sidebar.tsx`, `NoteList.tsx`, `NoteCard.tsx`
- **功能**:
  - 显示笔记列表
  - 搜索过滤
  - 笔记选择高亮
  - 新建和删除按钮
- **状态**: [ ]

### Task 5: 实现Markdown编辑器
- **描述**: 实现右侧编辑器，支持Markdown格式
- **文件**: `src/renderer/components/Editor.tsx`, `Toolbar.tsx`
- **功能**:
  - Markdown文本编辑
  - 粗体、斜体、链接、图片、标题格式化
  - 实时预览或所见即所得
- **状态**: [ ]

### Task 6: 实现状态管理
- **描述**: 使用Zustand实现应用状态管理
- **文件**: `src/renderer/store/useStore.ts`
- **状态**:
  - notes: 笔记列表
  - currentNote: 当前编辑的笔记
  - theme: 主题模式
  - aiChatMessages: AI对话消息
- **状态**: [ ]

## AI功能

### Task 7: 实现AI服务模块
- **描述**: 实现AI API调用服务
- **文件**: `src/main/ai-service.ts`
- **功能**:
  - chatCompletion(): 对话生成
  - textRewrite(): 文本改写
  - textContinue(): 文本续写
- **状态**: [ ]

### Task 8: 实现AI对话面板
- **描述**: 实现AI对话界面，支持单笔记和全局对话
- **文件**: `src/renderer/components/AIChatPanel.tsx`, `ChatMessageList.tsx`, `ChatInput.tsx`
- **功能**:
  - 对话消息显示
  - 输入框和发送
  - 对话历史管理
- **状态**: [ ]

### Task 9: 实现选中文字AI操作
- **描述**: 实现选中文字的改写、润色功能
- **文件**: `src/renderer/components/Editor.tsx`
- **功能**:
  - 右键菜单或工具栏触发
  - 选中文字获取
  - AI改写结果替换
- **状态**: [ ]

## IPC通信

### Task 10: 实现IPC通信
- **描述**: 实现主进程和渲染进程之间的IPC通信
- **文件**: `src/main/ipc-handler.ts`, `src/preload/preload.ts`
- **通道**:
  - `note:getAll`, `note:get`, `note:create`, `note:update`, `note:delete`
  - `ai:chat`, `ai:continue`, `ai:rewrite`
- **状态**: [ ]

## 整合测试

### Task 11: 整合测试
- **描述**: 测试所有功能，确保应用正常运行
- **文件**: 测试报告
- **测试项**:
  - 笔记CRUD操作
  - Markdown编辑
  - AI对话功能
  - 暗色模式切换
- **状态**: [ ]

### Task 12: 构建和打包
- **描述**: 生成可执行安装包
- **命令**: `npm run build`, `npm run make`
- **输出**: Windows/macOS安装包
- **状态**: [ ]
