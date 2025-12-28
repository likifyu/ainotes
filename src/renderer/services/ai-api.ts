// Frontend AI Service - Direct API calls for web version

interface AIConfig {
  provider: "minimax" | "openai" | "openrouter";
  apiKey: string;
  model: string;
  baseUrl: string;
  enableSearch: boolean;
}

function loadConfig(): AIConfig {
  const provider = (import.meta.env?.VITE_AI_PROVIDER as AIConfig["provider"]) || "openai";
  const apiKey = import.meta.env?.VITE_AI_API_KEY || "";
  const model = import.meta.env?.VITE_AI_MODEL || "";
  const enableSearch = import.meta.env?.VITE_AI_ENABLE_SEARCH === "true";
  let baseUrl = import.meta.env?.VITE_AI_BASE_URL || "";

  if (!baseUrl && provider === "minimax") {
    baseUrl = "https://api.minimax.chat/v1";
  }

  return { provider, apiKey, model, baseUrl, enableSearch };
}

function getEndpoint(baseUrl: string): string {
  if (baseUrl.includes("/chat/completions") || baseUrl.includes("/text/chatcompletion_v2")) {
    return baseUrl;
  }
  return baseUrl + "/chat/completions";
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const aiApi = {
  async chat(message: string, context: string): Promise<AIResponse> {
    const config = loadConfig();

    if (!config.apiKey) {
      return {
        content: "API未配置.请在 .env.local 文件中配置 VITE_AI_API_KEY",
      };
    }

    const messages = [
      { role: "system", content: "你是一个智能笔记助手,基于提供的笔记内容回答用户问题。" },
      { role: "user", content: "笔记内容:" + context + "\n\n用户问题:" + message },
    ];

    try {
      const endpoint = getEndpoint(config.baseUrl);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + config.apiKey,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { content: "API错误 (" + response.status + "):" + error.slice(0, 200) };
      }

      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content || "无响应",
        usage: data.usage,
      };
    } catch (error) {
      return { content: "请求失败:" + error };
    }
  },

  async continue(content: string): Promise<AIResponse> {
    const config = loadConfig();

    if (!config.apiKey) {
      return { content: "\n\n[请先配置 API 密钥]" };
    }

    const messages = [
      { role: "system", content: "请为以下内容续写,只输出续写内容,保持风格一致。" },
      { role: "user", content },
    ];

    try {
      const endpoint = getEndpoint(config.baseUrl);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + config.apiKey,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        return { content: "\n\n续写失败 (" + response.status + ")" };
      }

      const data = await response.json();
      return { content: "\n\n" + (data.choices?.[0]?.message?.content || "") };
    } catch (error) {
      return { content: "\n\n请求失败:" + error };
    }
  },

  async rewrite(text: string, style: string = "polish"): Promise<AIResponse> {
    const config = loadConfig();

    if (!config.apiKey) {
      return { content: "\n\n[请先配置 API 密钥]" };
    }

    const styleMap = {
      polish: "润色这段文字,使其更流畅、专业",
      concise: "简化这段文字,使其更简洁",
      expand: "扩展这段文字,增加细节",
      formal: "将这段文字改写成正式语气",
    };

    const messages = [
      { role: "system", content: (styleMap[style] || "润色") + "这段文字,只输出改写后的内容。" },
      { role: "user", content: text },
    ];

    try {
      const endpoint = getEndpoint(config.baseUrl);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + config.apiKey,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        return { content: "\n\n改写失败 (" + response.status + ")" };
      }

      const data = await response.json();
      return { content: data.choices?.[0]?.message?.content || "" };
    } catch (error) {
      return { content: "\n\n请求失败:" + error };
    }
  },

  isConfigured: (): boolean => {
    const config = loadConfig();
    return !!config.apiKey;
  },

  getConfig: () => {
    const config = loadConfig();
    return {
      provider: config.provider,
      model: config.model,
      enableSearch: config.enableSearch,
      baseUrl: config.baseUrl.replace("/v1/chat/completions", "").replace("/chat/completions", ""),
      hasKey: !!config.apiKey,
      keyPrefix: config.apiKey ? config.apiKey.slice(0, 8) + "..." : "",
    };
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const config = loadConfig();

    if (!config.apiKey) {
      return { success: false, message: "API密钥未配置" };
    }

    try {
      const endpoint = getEndpoint(config.baseUrl);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + config.apiKey,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 10,
        }),
      });

      if (response.ok) {
        return { success: true, message: "API 连接成功" + (config.enableSearch ? " (支持联网搜索)" : "") };
      } else if (response.status === 401) {
        return { success: false, message: "API密钥无效" };
      } else {
        return { success: false, message: "API错误 (" + response.status + ")" };
      }
    } catch (error) {
      return { success: false, message: "连接失败:" + error };
    }
  },
};

export default aiApi;
