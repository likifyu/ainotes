# AI Notes - 智能笔记应用

深度集成 AI 功能的原生笔记应用，支持多引擎翻译、Markdown 编辑、AI 续写和智能对话。

![AI Notes](https://img.shields.io/badge/AI-Notes-blue)
![Electron](https://img.shields.io/badge/Electron-28.1.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 功能特性

### 笔记管理
- 创建、编辑、删除笔记
- 分类管理（会议记录、日记、灵感、学习笔记、博客文章）
- 笔记收藏和搜索
- Markdown 格式支持

### AI 智能功能
- **AI 续写**：基于当前内容智能续写
- **AI 改写**：润色、简化、扩展选中内容
- **AI 对话**：与 AI 进行深度对话
- **多模型切换**：支持 MiniMax、Claude、DeepSeek 等模型

### 多引擎翻译
- AI 智能翻译
- 百度翻译
- 有道翻译
- Google 翻译
- DeepL 翻译
- 支持 30+ 语言
- 翻译历史记录

### 跨平台支持
- **Web 版**：GitHub Pages 部署
- **桌面版**：Windows / macOS / Linux

## 快速开始

### Web 版
访问: https://likifyu.github.io/ainotes

### 本地开发
```bash
# 克隆项目
git clone https://github.com/likifyu/ainotes.git
cd ainotes

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 桌面版
```bash
# 开发模式
npm run electron:dev

# 构建安装包
npm run electron:build
```

## 项目结构

```
ai-notes/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── ipc-handler.ts
│   │   ├── ai-service.ts
│   │   └── database.ts
│   ├── renderer/       # React 前端
│   │   ├── components/ # 组件
│   │   │   ├── Toolbar.tsx
│   │   │   ├── TranslationPanel.tsx
│   │   │   └── Editor.tsx
│   │   ├── services/   # 服务
│   │   │   ├── ai-api.ts
│   │   │   └── translation-service.ts
│   │   └── store/      # 状态管理
│   │       └── useStore.ts
│   └── App.tsx
├── .github/workflows/  # CI/CD 配置
├── dist/               # 构建输出
└── package.json
```

## 配置说明

### API 配置
在 `src/config/` 目录下配置：
- `ai-config.ts`：AI 模型 API 配置
- `translation-config.ts`：翻译引擎 API 配置

### 环境变量
```env
VITE_AI_API_URL=your-api-url
VITE_BAIDU_APP_ID=your-app-id
VITE_BAIDU_SECRET_KEY=your-secret-key
```

## 技术栈

- **前端框架**：React 18 + TypeScript
- **状态管理**：Zustand
- **UI 框架**：TailwindCSS
- **编辑器**：TipTap (Markdown)
- **打包工具**：Vite 5
- **桌面框架**：Electron 28
- **构建工具**：electron-builder

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## License

本项目采用 MIT License 开源。

## 致谢

- [MiniMax](https://www.minimaxi.com/) - AI 模型支持
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [TipTap](https://tiptap.dev/) - 编辑器框架
