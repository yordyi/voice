import { NextRequest, NextResponse } from 'next/server';
import { AzureSpeechService } from '@/lib/azure-speech';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: '请输入要转换的文字' }, { status: 400 });
    }

    const speechService = new AzureSpeechService();
    await speechService.initializeFromConfig();
    const audioBuffer = await speechService.textToSpeech(text);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="speech.wav"'
      }
    });
  } catch (error) {
    console.error('文本转语音错误:', error);
    return NextResponse.json({ error: '文本转语音失败' }, { status: 500 });
  }
}