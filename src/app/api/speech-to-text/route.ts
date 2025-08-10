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
    const text = await speechService.speechToText(audioBuffer);

    return NextResponse.json({ text });
  } catch (error) {
    console.error('语音转文本错误:', error);
    return NextResponse.json({ error: '语音转文本失败' }, { status: 500 });
  }
}