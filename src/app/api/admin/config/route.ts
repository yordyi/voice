import { NextRequest, NextResponse } from 'next/server';
import { saveConfig, loadConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = await loadConfig();
    // 不返回完整密钥，只返回前几位用于显示
    const maskedKey = config.azureKey 
      ? config.azureKey.substring(0, 8) + '...' 
      : '';
    
    return NextResponse.json({
      azureKey: maskedKey,
      azureRegion: config.azureRegion
    });
  } catch (error) {
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
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 });
  }
}