import { NextRequest, NextResponse } from 'next/server';
import { AzureSpeechService } from '@/lib/azure-speech';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const sourceLanguage = formData.get('sourceLanguage') as string || 'zh-CN';
    const targetLanguage = formData.get('targetLanguage') as string || 'en-US';
    
    if (!file) {
      return NextResponse.json({ error: '请上传音频文件' }, { status: 400 });
    }

    const audioBuffer = await file.arrayBuffer();
    const speechService = new AzureSpeechService();
    await speechService.initializeFromConfig();
    
    const result = await speechService.speechTranslation(audioBuffer, sourceLanguage, targetLanguage);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('语音翻译错误:', error);
    return NextResponse.json({ error: '语音翻译失败' }, { status: 500 });
  }
}