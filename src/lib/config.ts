export interface Config {
  azureKey: string;
  azureRegion: string;
}

// 使用内存存储配置
let memoryConfig: Config = { azureKey: '', azureRegion: '' };

export async function saveConfig(config: Config): Promise<void> {
  try {
    console.log('保存配置到内存:', JSON.stringify(config, null, 2));
    memoryConfig = { ...config };
    console.log('配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
    throw new Error('保存配置失败: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function loadConfig(): Promise<Config> {
  try {
    console.log('从内存加载配置:', JSON.stringify(memoryConfig, null, 2));
    return memoryConfig;
  } catch {
    // 如果失败，返回空配置
    return { azureKey: '', azureRegion: '' };
  }
}

export async function getAzureConfig(): Promise<Config> {
  try {
    // 首先尝试从内存读取
    const config = await loadConfig();
    if (config.azureKey && config.azureRegion) {
      return config;
    }
    
    // 如果内存没有配置，则从环境变量读取
    return {
      azureKey: process.env.AZURE_SPEECH_KEY || '',
      azureRegion: process.env.AZURE_SPEECH_REGION || ''
    };
  } catch {
    // 最后兜底从环境变量读取
    return {
      azureKey: process.env.AZURE_SPEECH_KEY || '',
      azureRegion: process.env.AZURE_SPEECH_REGION || ''
    };
  }
}