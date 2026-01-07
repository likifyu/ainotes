// Electron API 类型定义
// 扩展 Window 接口以包含 Electron 预加载脚本暴露的 API

interface ElectronAPI {
    aiChat: (message: string, context: string) => Promise<string>;
    // 可以根据实际的 Electron API 添加更多方法
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

export { };
