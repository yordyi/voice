import { NextRequest, NextResponse } from 'next/server';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { azureKey, azureRegion } = await request.json();

    if (!azureKey || !azureRegion) {
      return NextResponse.json({ error: '密钥和区域不能为空' }, { status: 400 });
    }

    // 测试Azure语音服务连接
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(azureKey, azureRegion);
    speechConfig.speechRecognitionLanguage = "zh-CN";

    // 创建一个简单的测试
    const testText = "测试";
    speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoNeural";
    
    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve) => {
      synthesizer.speakTextAsync(
        testText,
        result => {
          synthesizer.close();
          if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(NextResponse.json({ message: '连接测试成功' }));
          } else {
            resolve(NextResponse.json({ error: '语音服务测试失败' }, { status: 400 }));
          }
        },
        error => {
          synthesizer.close();
          resolve(NextResponse.json({ error: '连接失败：' + error }, { status: 400 }));
        }
      );
    });
  } catch {
    return NextResponse.json({ error: '测试连接时发生错误' }, { status: 500 });
  }
}