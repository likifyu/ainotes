// AI Service - Multi-Provider API Support
// Supports: MiniMax, OpenAI, OpenRouter, Kimi (Moonshot)
// Configure via environment variables or config file

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Configuration
interface AIConfig {
  provider: 'minimax' | 'openai' | 'openrouter';
  apiKey: string;
  model: string;
  baseUrl?: string;
}

// Default configuration - reads from environment variables
function getConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || 'openrouter') as AIConfig['provider'];
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || '';

  return {
    provider,
    apiKey,
    model,
    baseUrl: process.env.AI_BASE_URL,
  };
}

// MiniMax API call
async function callMiniMax(messages: any[], config: AIConfig): Promise<AIResponse> {
  const baseUrl = config.baseUrl || 'https://api.minimax.chat/v1';
  const model = config.model || 'abab6.5s-chat';

  const response = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}

// OpenAI API call
async function callOpenAI(messages: any[], config: AIConfig): Promise<AIResponse> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const model = config.model || 'gpt-3.5-turbo';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}

// OpenRouter API call (supports Kimi, Claude, etc.)
async function callOpenRouter(messages: any[], config: AIConfig): Promise<AIResponse> {
  const baseUrl = 'https://openrouter.ai/api/v1';
  const model = config.model || 'anthropic/claude-3-haiku';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://ainotes.app',
      'X-Title': 'AI Notes App',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}

// Main chat function
async function chatCompletion(message: string, context: string, config: AIConfig): Promise<AIResponse> {
  const systemPrompt = `你是一个智能笔记助手。请基于用户的笔记内容提供有帮助的回答。
用户的所有笔记都在上下文中提供。请简洁、专业地回答问题。`;

  const userContent = `上下文信息：\n${context}\n\n---\n\n用户问题：${message}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  switch (config.provider) {
    case 'minimax':
      return callMiniMax(messages, config);
    case 'openai':
      return callOpenAI(messages, config);
    case 'openrouter':
      return callOpenRouter(messages, config);
    default:
      return callOpenRouter(messages, config);
  }
}

// Continue writing function
async function textContinue(content: string, config: AIConfig): Promise<AIResponse> {
  const systemPrompt = `你是一个写作助手。请根据用户提供的笔记内容进行续写，保持风格一致，内容连贯。只输出续写内容，不要其他说明。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请为以下内容续写：\n\n${content}` },
  ];

  switch (config.provider) {
    case 'minimax':
      return callMiniMax(messages, config);
    case 'openai':
      return callOpenAI(messages, config);
    case 'openrouter':
      return callOpenRouter(messages, config);
    default:
      return callOpenRouter(messages, config);
  }
}

// Rewrite text function
async function textRewrite(text: string, instruction: string, config: AIConfig): Promise<AIResponse> {
  const systemPrompt = `你是一个文字编辑助手。根据用户的指令改写指定的文字，保持原意但改善表达。只输出改写后的内容。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `指令：${instruction}\n\n原文：\n${text}` },
  ];

  switch (config.provider) {
    case 'minimax':
      return callMiniMax(messages, config);
    case 'openai':
      return callOpenAI(messages, config);
    case 'openrouter':
      return callOpenRouter(messages, config);
    default:
      return callOpenRouter(messages, config);
  }
}

// Mock response when no API key
function mockResponse(content: string): AIResponse {
  return {
    content,
  };
}

export const aiService = {
  // Chat completion
  async chat(message: string, context: string, model?: string): Promise<AIResponse> {
    const config = getConfig();

    if (!config.apiKey) {
      return mockResponse(`您好！我是AI助手。

根据您提供的上下文：
${context.slice(0, 200)}...

关于您的问题，我目前运行在演示模式下。要启用完整的AI功能，请配置 API 密钥。

请在应用目录创建 .env 文件，配置以下内容：
AI_PROVIDER=minimax
AI_API_KEY=您的MiniMax API密钥
AI_MODEL=abab6.5s-chat

或者使用 OpenRouter (支持 Kimi, Claude 等)：
AI_PROVIDER=openrouter
AI_API_KEY=您的OpenRouter API密钥
AI_MODEL=moonshotai/kimi-long-context-chat-128k

请问还有什么可以帮您的吗？`);
    }

    try {
      return await chatCompletion(message, context, { ...config, model: model || config.model });
    } catch (error) {
      console.error('AI Service Error:', error);
      return mockResponse('抱歉，AI服务暂时不可用。请检查您的API密钥配置。');
    }
  },

  // Continue writing
  async continue(content: string, model?: string): Promise<AIResponse> {
    const config = getConfig();

    if (!config.apiKey) {
      return mockResponse(`\n\n基于您的内容，让我继续补充：

在实际应用中，这里会调用AI来智能续写您的笔记内容。AI会理解您上文的主题和风格，生成连贯的后续内容。

配置 API 密钥后，AI 将提供真实的续写内容。`);
    }

    try {
      return await textContinue(content, { ...config, model: model || config.model });
    } catch (error) {
      console.error('AI Continue Error:', error);
      return mockResponse('抱歉，AI续写服务暂时不可用。');
    }
  },

  // Rewrite text
  async rewrite(text: string, instruction?: string): Promise<AIResponse> {
    const config = getConfig();

    if (!config.apiKey) {
      return mockResponse(`改写后的文字：

${text}

（这是在演示模式下的模拟改写结果。配置API密钥后，AI将提供更智能的改写建议。）`);
    }

    try {
      return await textRewrite(text, instruction || '改写这段文字，使其更加清晰、专业', config);
    } catch (error) {
      console.error('AI Rewrite Error:', error);
      return mockResponse('抱歉，AI改写服务暂时不可用。');
    }
  },

  // Get current config status
  getConfigStatus: () => {
    const config = getConfig();
    return {
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      model: config.model || 'default',
      isConfigured: !!config.apiKey,
    };
  },
};

export default aiService;
