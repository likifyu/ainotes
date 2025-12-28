"use strict";
// AI Service - OpenRouter API Integration
// To use, set OPENROUTER_API_KEY environment variable
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
// Get API key from environment or user configuration
const getApiKey = () => {
    return process.env.OPENROUTER_API_KEY || null;
};
// Default to a free model if no API key
const DEFAULT_MODEL = 'anthropic/claude-3-haiku';
exports.aiService = {
    // Chat completion
    async chat(message, context, model = DEFAULT_MODEL) {
        const apiKey = getApiKey();
        if (!apiKey) {
            // Return mock response when no API key
            return {
                content: `您好！我是AI助手。

根据您提供的上下文：
${context.slice(0, 200)}...

关于您的问题，我目前运行在演示模式下。要启用完整的AI功能，请配置 API 密钥。

您可以：
1. 使用 OpenRouter API (推荐)
2. 设置环境变量 OPENROUTER_API_KEY
3. 或在应用设置中输入您的 API 密钥

请问还有什么可以帮您的吗？`,
            };
        }
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://ainotes.app',
                    'X-Title': 'AI Notes App',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: `你是一个智能笔记助手。请基于用户的笔记内容提供有帮助的回答。
用户的所有笔记都在上下文中提供。请简洁、专业地回答问题。`
                        },
                        {
                            role: 'user',
                            content: `上下文信息：\n${context}\n\n---\n\n用户问题：${message}`
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: data.usage,
            };
        }
        catch (error) {
            console.error('AI Service Error:', error);
            return {
                content: '抱歉，AI服务暂时不可用。请检查您的网络连接或API密钥配置。',
            };
        }
    },
    // Continue writing
    async continue(content, model = DEFAULT_MODEL) {
        const apiKey = getApiKey();
        if (!apiKey) {
            return {
                content: `\n\n基于您的内容，让我继续补充：

在实际应用中，这里会调用AI来智能续写您的笔记内容。AI会理解您上文的主题和风格，生成连贯的后续内容。

您可以配置 OpenAI 或其他兼容的API来启用此功能。`,
            };
        }
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://ainotes.app',
                    'X-Title': 'AI Notes App',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: `你是一个写作助手。请根据用户提供的笔记内容进行续写，保持风格一致，内容连贯。只输出续写内容，不要其他说明。`
                        },
                        {
                            role: 'user',
                            content: `请为以下内容续写：\n\n${content}`
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.8,
                }),
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: data.usage,
            };
        }
        catch (error) {
            console.error('AI Continue Error:', error);
            return {
                content: '抱歉，AI续写服务暂时不可用。',
            };
        }
    },
    // Rewrite text
    async rewrite(text, instruction = '改写这段文字，使其更加清晰、专业', model = DEFAULT_MODEL) {
        const apiKey = getApiKey();
        if (!apiKey) {
            return {
                content: `改写后的文字：

${text}

（这是在演示模式下的模拟改写结果。配置API密钥后，AI将提供更智能的改写建议。）`,
            };
        }
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://ainotes.app',
                    'X-Title': 'AI Notes App',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: `你是一个文字编辑助手。根据用户的指令改写指定的文字，保持原意但改善表达。只输出改写后的内容。`
                        },
                        {
                            role: 'user',
                            content: `指令：${instruction}\n\n原文：\n${text}`
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: data.usage,
            };
        }
        catch (error) {
            console.error('AI Rewrite Error:', error);
            return {
                content: '抱歉，AI改写服务暂时不可用。',
            };
        }
    },
};
exports.default = exports.aiService;
