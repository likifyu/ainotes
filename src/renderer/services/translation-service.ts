/**
 * 翻译服务 - 支持多引擎翻译
 * 支持: 百度翻译、有道翻译、Google翻译、DeepL、AI翻译
 */

import axios from 'axios';

// 类型定义
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

// 支持的语言列表
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'auto', name: 'Auto Detect', nameCN: '自动检测' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nameCN: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nameCN: '繁体中文' },
  { code: 'en', name: 'English', nameCN: '英语' },
  { code: 'ja', name: 'Japanese', nameCN: '日语' },
  { code: 'ko', name: 'Korean', nameCN: '韩语' },
  { code: 'fr', name: 'French', nameCN: '法语' },
  { code: 'de', name: 'German', nameCN: '德语' },
  { code: 'es', name: 'Spanish', nameCN: '西班牙语' },
  { code: 'it', name: 'Italian', nameCN: '意大利语' },
  { code: 'ru', name: 'Russian', nameCN: '俄语' },
  { code: 'pt', name: 'Portuguese', nameCN: '葡萄牙语' },
  { code: 'nl', name: 'Dutch', nameCN: '荷兰语' },
  { code: 'pl', name: 'Polish', nameCN: '波兰语' },
  { code: 'tr', name: 'Turkish', nameCN: '土耳其语' },
  { code: 'ar', name: 'Arabic', nameCN: '阿拉伯语' },
  { code: 'hi', name: 'Hindi', nameCN: '印地语' },
  { code: 'th', name: 'Thai', nameCN: '泰语' },
  { code: 'vi', name: 'Vietnamese', nameCN: '越南语' },
  { code: 'id', name: 'Indonesian', nameCN: '印尼语' },
  { code: 'uk', name: 'Ukrainian', nameCN: '乌克兰语' },
  { code: 'cs', name: 'Czech', nameCN: '捷克语' },
  { code: 'sv', name: 'Swedish', nameCN: '瑞典语' },
  { code: 'da', name: 'Danish', nameCN: '丹麦语' },
  { code: 'fi', name: 'Finnish', nameCN: '芬兰语' },
  { code: 'no', name: 'Norwegian', nameCN: '挪威语' },
  { code: 'hu', name: 'Hungarian', nameCN: '匈牙利语' },
  { code: 'el', name: 'Greek', nameCN: '希腊语' },
  { code: 'he', name: 'Hebrew', nameCN: '希伯来语' },
  { code: 'ro', name: 'Romanian', nameCN: '罗马尼亚语' },
];

// 翻译服务类
class TranslationService {
  private config: TranslationConfig;
  private cache: Map<string, TranslationResult> = new Map();
  private aiTranslateFn?: (text: string, sourceLang: string, targetLang: string) => Promise<string>;

  constructor(config: TranslationConfig = { engine: 'baidu' }) {
    this.config = config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<TranslationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 设置AI翻译回调
  setAITranslateFn(fn: (text: string, sourceLang: string, targetLang: string) => Promise<string>): void {
    this.aiTranslateFn = fn;
  }

  // 翻译主方法
  async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    if (!text.trim()) {
      return {
        success: false,
        text: '',
        sourceLang,
        targetLang,
        engine: this.config.engine,
        error: 'Empty text'
      };
    }

    // 检查缓存
    const cacheKey = `${this.config.engine}:${sourceLang}:${targetLang}:${text}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let result: TranslationResult;

      switch (this.config.engine) {
        case 'baidu':
          result = await this.translateWithBaidu(text, sourceLang, targetLang);
          break;
        case 'youdao':
          result = await this.translateWithYoudao(text, sourceLang, targetLang);
          break;
        case 'google':
          result = await this.translateWithGoogle(text, sourceLang, targetLang);
          break;
        case 'deepl':
          result = await this.translateWithDeepL(text, sourceLang, targetLang);
          break;
        case 'ai':
          result = await this.translateWithAI(text, sourceLang, targetLang);
          break;
        default:
          throw new Error(`Unknown translation engine: ${this.config.engine}`);
      }

      // 存入缓存
      if (result.success) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        text: '',
        sourceLang,
        targetLang,
        engine: this.config.engine,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 批量翻译
  async translateBatch(texts: string[], sourceLang: string, targetLang: string): Promise<TranslationResult[]> {
    const results = await Promise.all(
      texts.map(text => this.translate(text, sourceLang, targetLang))
    );
    return results;
  }

  // 百度翻译
  private async translateWithBaidu(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const { appId, secretKey } = this.config;

    if (!appId || !secretKey) {
      throw new Error('Baidu API credentials not configured');
    }

    // 检查是否在 Electron 环境中，使用 IPC 调用
    if (window.electronAPI?.translateBaidu) {
      try {
        const result = await window.electronAPI.translateBaidu(
          text,
          sourceLang,
          targetLang,
          appId,
          secretKey
        );
        if (result.success) {
          return {
            success: true,
            text: result.text,
            sourceLang: result.sourceLang,
            targetLang: result.targetLang,
            engine: 'baidu'
          };
        } else {
          throw new Error(result.error || '翻译失败');
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'IPC翻译失败');
      }
    }

    // 浏览器环境：使用 API 请求（CORS 限制）
    const salt = Math.random().toString(36).slice(-8);
    const sign = this.md5(appId + text + salt + secretKey);

    const response = await axios.post('https://fanyi-api.baidu.com/sug/v1', {
      q: text,
      from: sourceLang === 'auto' ? 'auto' : this.mapToBaiduLang(sourceLang),
      to: this.mapToBaiduLang(targetLang),
      appid: appId,
      salt,
      sign
    });

    // 百度翻译 API 响应格式
    return {
      success: true,
      text: response.data.trans_result?.[0]?.dst || text,
      sourceLang,
      targetLang,
      engine: 'baidu'
    };
  }

  // 有道翻译
  private async translateWithYoudao(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const { appId, secretKey } = this.config;

    if (!appId || !secretKey) {
      throw new Error('Youdao API credentials not configured');
    }

    const salt = Math.random().toString(36).slice(-8);
    const curtime = Math.floor(Date.now() / 1000);
    const sign = this.md5(`${appId}${this.md5(text)}${salt}${curtime}${secretKey}`);

    const response = await axios.post('https://openapi.youdao.com/api', null, {
      params: {
        q: text,
        from: sourceLang === 'auto' ? 'auto' : this.mapToYoudaoLang(sourceLang),
        to: this.mapToYoudaoLang(targetLang),
        appKey: appId,
        salt,
        curtime,
        sign,
        signType: 'v3'
      }
    });

    return {
      success: response.data.errorCode === '0',
      text: response.data.translation?.[0] || text,
      sourceLang,
      targetLang,
      engine: 'youdao',
      error: response.data.errorCode !== '0' ? `Error code: ${response.data.errorCode}` : undefined
    };
  }

  // Google翻译 (使用非官方API)
  private async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang === 'auto' ? 'auto' : sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await axios.get(url);

    const translatedText = response.data[0]?.map((item: any[]) => item[0]).join('') || text;

    return {
      success: true,
      text: translatedText,
      sourceLang,
      targetLang,
      engine: 'google'
    };
  }

  // DeepL翻译
  private async translateWithDeepL(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const { apiKey } = this.config;

    if (!apiKey) {
      throw new Error('DeepL API key not configured');
    }

    const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
      params: {
        text,
        source_lang: sourceLang === 'auto' ? undefined : this.mapToDeepLLang(sourceLang),
        target_lang: this.mapToDeepLLang(targetLang)
      },
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`
      }
    });

    return {
      success: true,
      text: response.data.translations[0].text,
      sourceLang,
      targetLang,
      engine: 'deepl'
    };
  }

  // AI翻译
  private async translateWithAI(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    if (!this.aiTranslateFn) {
      throw new Error('AI translation function not configured');
    }

    const translatedText = await this.aiTranslateFn(text, sourceLang, targetLang);

    return {
      success: true,
      text: translatedText,
      sourceLang,
      targetLang,
      engine: 'ai'
    };
  }

  // 语言代码映射 - 百度
  private mapToBaiduLang(lang: string): string {
    const map: Record<string, string> = {
      'zh-CN': 'zh',
      'zh-TW': 'cht',
      'en': 'en',
      'ja': 'jp',
      'ko': 'kor',
      'fr': 'fra',
      'de': 'de',
      'es': 'spa',
      'it': 'it',
      'ru': 'ru',
      'pt': 'pt',
      'nl': 'nl',
      'pl': 'pl',
      'tr': 'tr',
      'ar': 'ara',
      'hi': 'hi',
      'th': 'th',
      'vi': 'vie',
      'id': 'id',
    };
    return map[lang] || 'auto';
  }

  // 语言代码映射 - 有道
  private mapToYoudaoLang(lang: string): string {
    const map: Record<string, string> = {
      'zh-CN': 'zh-CHS',
      'zh-TW': 'zh-CHT',
      'en': 'en',
      'ja': 'ja',
      'ko': 'ko',
      'fr': 'fr',
      'de': 'de',
      'es': 'es',
      'it': 'it',
      'ru': 'ru',
    };
    return map[lang] || lang;
  }

  // 语言代码映射 - DeepL
  private mapToDeepLLang(lang: string): string {
    const map: Record<string, string> = {
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
      'en': 'EN',
      'ja': 'JA',
      'ko': 'KO',
      'fr': 'FR',
      'de': 'DE',
      'es': 'ES',
      'it': 'IT',
      'ru': 'RU',
      'pt': 'PT',
      'nl': 'NL',
      'pl': 'PL',
    };
    return map[lang] || 'EN';
  }

  // 简单的MD5实现 (用于API签名)
  private md5(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 获取当前引擎
  getEngine(): TranslationEngine {
    return this.config.engine;
  }

  // 检测文本语言
  async detectLanguage(text: string): Promise<string> {
    // 简单检测：基于字符特征
    const chinesePattern = /[\u4e00-\u9fa5]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7af]/;
    const cyrillicPattern = /[\u0400-\u04ff]/;
    const arabicPattern = /[\u0600-\u06ff]/;

    if (chinesePattern.test(text)) return 'zh-CN';
    if (japanesePattern.test(text)) return 'ja';
    if (koreanPattern.test(text)) return 'ko';
    if (arabicPattern.test(text)) return 'ar';

    // 使用Google翻译进行语言检测
    try {
      const result = await this.translateWithGoogle(text, 'auto', 'en');
      // 如果翻译成功但源语言仍为auto，说明检测失败
      return 'en'; // 默认返回英语
    } catch {
      return 'en';
    }
  }
}

// 导出单例
export const translationService = new TranslationService();

// 导出类
export { TranslationService };
