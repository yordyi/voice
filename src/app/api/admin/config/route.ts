import { NextRequest, NextResponse } from 'next/server';
import { saveConfig, loadConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = await loadConfig();
    // 密钥部分默认返回空白，不显示任何信息
    
    return NextResponse.json({
      azureKey: '',
      azureRegion: config.azureRegion
    });
  } catch {
    return NextResponse.json({ error: '读取配置失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { azureKey, azureRegion } = await request.json();

    if (!azureKey || !azureRegion) {
      return NextResponse.json({ error: '密钥和区域都是必填项' }, { status: 400 });
    }

    await saveConfig({ azureKey, azureRegion });
    
    return NextResponse.json({ message: '配置保存成功' });
  } catch (error) {
    console.error('API: 保存配置失败:', error);
    return NextResponse.json({ 
      error: '保存配置失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}