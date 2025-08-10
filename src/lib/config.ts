import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'config.json');

export interface Config {
  azureKey: string;
  azureRegion: string;
}

export async function saveConfig(config: Config): Promise<void> {
  try {
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error('保存配置失败');
  }
}

export async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，返回空配置
    return { azureKey: '', azureRegion: '' };
  }
}

export async function getAzureConfig(): Promise<Config> {
  try {
    // 首先尝试从文件读取
    const config = await loadConfig();
    if (config.azureKey && config.azureRegion) {
      return config;
    }
    
    // 如果文件没有配置，则从环境变量读取
    return {
      azureKey: process.env.AZURE_SPEECH_KEY || '',
      azureRegion: process.env.AZURE_SPEECH_REGION || ''
    };
  } catch (error) {
    // 最后兜底从环境变量读取
    return {
      azureKey: process.env.AZURE_SPEECH_KEY || '',
      azureRegion: process.env.AZURE_SPEECH_REGION || ''
    };
  }
}