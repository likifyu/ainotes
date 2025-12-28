# AI Notes App - 当前 API 配置

## 状态

❌ **API 尚未正常工作**

### 测试结果

1. **官方端点** `api.minimax.chat`
   - 连接：✅ 成功
   - 认证：❌ 失败（login fail）

2. **专属端点** `api.minimax-algeng.com`
   - DNS：❌ 无法解析
   - 需要内网访问或VPN

## 需要的帮助

请提供以下信息之一：

### 选项1：确认 API 密钥格式
从你成功使用此 API 的地方，检查请求头格式：
```bash
# 完整的 curl 命令示例
curl -X POST "https://..." \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ???" \
  -d '{...}'
```

### 选项2：提供新的 API 密钥
如果旧密钥已过期，请提供新的密钥：
```
API_BASE: https://...
API_KEY: sk-...
```

### 选项3：使用其他 AI 服务
如果 MiniMax 不可用，可以配置：
- **OpenAI**: https://platform.openai.com/api-keys
- **OpenRouter (支持 Kimi)**: https://openrouter.ai/

## 下一步

请告诉我：
1. 这个 API 密钥在哪里可以正常工作？
2. 或者提供一个可用的 API 密钥？
