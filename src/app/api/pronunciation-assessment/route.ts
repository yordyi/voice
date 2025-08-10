import { NextRequest, NextResponse } from 'next/server';
import { AzureSpeechService } from '@/lib/azure-speech';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const referenceText = formData.get('referenceText') as string;
    
    if (!file) {
      return NextResponse.json({ error: '请上传音频文件' }, { status: 400 });
    }

    if (!referenceText) {
      return NextResponse.json({ error: '请提供参考文本' }, { status: 400 });
    }

    const audioBuffer = await file.arrayBuffer();
    const speechService = new AzureSpeechService();
    await speechService.initializeFromConfig();
    
    const result = await speechService.pronunciationAssessment(audioBuffer, referenceText);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('发音评估错误:', error);
    return NextResponse.json({ error: '发音评估失败' }, { status: 500 });
  }
}