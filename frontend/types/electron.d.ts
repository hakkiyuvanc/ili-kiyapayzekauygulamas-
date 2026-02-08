export interface ElectronAPI {
    getBackendUrl: () => Promise<string>;
    checkBackendHealth: () => Promise<boolean>;
    platform: string;
    saveAnalysis: (data: any) => Promise<{ id: number; success: boolean }>;
    getHistory: (limit?: number, offset?: number) => Promise<any[]>;
    getAnalysisDetail: (id: number) => Promise<any>;
    deleteAnalysis: (id: number) => Promise<boolean>;
    versions: {
        node: string;
        chrome: string;
        electron: string;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
