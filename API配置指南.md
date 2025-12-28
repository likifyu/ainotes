# AI Notes App - API 配置指南

## 当前状态：演示模式

应用目前运行在演示模式下，AI功能返回模拟响应。要启用真实的AI功能，请配置API密钥。

## 配置方法

### 方法一：使用 .env 文件（推荐）

1. 复制配置文件模板：
   ```
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的API密钥：
   ```env
   # MiniMax API 配置示例
   AI_PROVIDER=minimax
   AI_API_KEY=你的MiniMax密钥
   AI_MODEL=abab6.5s-chat
   ```

3. 重启应用

### 方法二：使用环境变量（临时测试）

**Windows PowerShell:**
```powershell
$env:AI_PROVIDER="minimax"
$env:AI_API_KEY="你的API密钥"
$env:AI_MODEL="abab6.5s-chat"
npm run dev
```

**Windows CMD:**
```cmd
set AI_PROVIDER=minimax
set AI_API_KEY=你的API密钥
set AI_MODEL=abab6.5s-chat
npm run dev
```

## API 提供商配置

### 1. MiniMax（你提供的链接）

MiniMax 文档地址：https://api.minimax.chat/

```env
AI_PROVIDER=minimax
AI_API_KEY=从MiniMax控制台获取的API密钥
AI_MODEL=abab6.5s-chat
```

### 2. OpenRouter（支持 Kimi）

OpenRouter 地址：https://openrouter.ai/

```env
AI_PROVIDER=openrouter
AI_API_KEY=从OpenRouter获取的API密钥
AI_MODEL=moonshotai/kimi-long-context-chat-128k
```

### 3. OpenAI（GPT）

```env
AI_PROVIDER=openai
AI_API_KEY=sk-xxx...
AI_MODEL=gpt-3.5-turbo
# 或 gpt-4
```

## 验证配置

配置成功后，AI对话会显示真实响应而不是演示消息。

## 常见问题

**Q: API密钥在哪里获取？**
- MiniMax: 登录 https://api.minimax.chat/ 控制台
- OpenRouter: 登录 https://openrouter.ai/ 控制台
- OpenAI: 登录 https://platform.openai.com/api-keys

**Q: 提示"API密钥无效"？**
- 检查API密钥是否正确复制
- 确认API服务商和模型名称是否匹配
- 检查API账户是否有余额

**Q: 模型名称怎么填？**
- MiniMax: `abab6.5s-chat` 或 `abab6.5-chat`
- OpenRouter Kimi: `moonshotai/kimi-long-context-chat-128k`
- OpenRouter Claude: `anthropic/claude-3-haiku`
- OpenAI: `gpt-3.5-turbo` 或 `gpt-4`
