import { NextRequest, NextResponse } from 'next/server';
import { AzureSpeechService } from '@/lib/azure-speech';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    
    if (!file) {
      return NextResponse.json({ error: '请上传音频文件' }, { status: 400 });
    }

    const audioBuffer = await file.arrayBuffer();
    const speechService = new AzureSpeechService();
    await speechService.initializeFromConfig();
    
    const result = await speechService.intentRecognition(audioBuffer);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('意向识别错误:', error);
    return NextResponse.json({ error: '意向识别失败' }, { status: 500 });
  }
}