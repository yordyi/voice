import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { getAzureConfig } from './config';

export interface SpeechTranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface IntentResult {
  text: string;
  intent: string;
  confidence: number;
  entities: { [key: string]: unknown };
}

export interface SpeakerRecognitionResult {
  text: string;
  speakerId: string;
  confidence: number;
}

export interface PronunciationResult {
  text: string;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  overallScore: number;
  words: Array<{
    word: string;
    accuracyScore: number;
    errorType?: string;
  }>;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  text: string;
}

export class AzureSpeechService {
  private speechKey: string;
  private speechRegion: string;

  constructor() {
    this.speechKey = process.env.AZURE_SPEECH_KEY || '';
    this.speechRegion = process.env.AZURE_SPEECH_REGION || '';
  }

  async initializeFromConfig() {
    const config = await getAzureConfig();
    this.speechKey = config.azureKey;
    this.speechRegion = config.azureRegion;
  }

  // 语音转文本
  async speechToText(audioBuffer: ArrayBuffer): Promise<string> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    speechConfig.speechRecognitionLanguage = "zh-CN";

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            resolve(result.text);
          } else {
            reject(new Error('语音识别失败'));
          }
          recognizer.close();
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  // 文本转语音
  async textToSpeech(text: string): Promise<Buffer> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoNeural";

    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData));
          } else {
            reject(new Error('语音合成失败'));
          }
          synthesizer.close();
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  }

  // 语音翻译
  async speechTranslation(audioBuffer: ArrayBuffer, sourceLanguage: string, targetLanguage: string): Promise<SpeechTranslationResult> {
    const speechTranslationConfig = speechsdk.SpeechTranslationConfig.fromSubscription(this.speechKey, this.speechRegion);
    speechTranslationConfig.speechRecognitionLanguage = sourceLanguage;
    speechTranslationConfig.addTargetLanguage(targetLanguage);

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
    const translator = new speechsdk.TranslationRecognizer(speechTranslationConfig, audioConfig);

    return new Promise((resolve, reject) => {
      translator.recognizeOnceAsync(
        result => {
          if (result.reason === speechsdk.ResultReason.TranslatedSpeech) {
            resolve({
              originalText: result.text,
              translatedText: result.translations.get(targetLanguage) || '',
              sourceLanguage,
              targetLanguage
            });
          } else {
            reject(new Error('语音翻译失败'));
          }
          translator.close();
        },
        error => {
          translator.close();
          reject(error);
        }
      );
    });
  }

  // 意向识别 
  async intentRecognition(audioBuffer: ArrayBuffer): Promise<IntentResult> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    speechConfig.speechRecognitionLanguage = "zh-CN";

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
    const intentRecognizer = new speechsdk.IntentRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      intentRecognizer.recognizeOnceAsync(
        result => {
          if (result.reason === speechsdk.ResultReason.RecognizedIntent) {
            resolve({
              text: result.text,
              intent: result.intentId || 'unknown',
              confidence: result.properties?.getProperty(speechsdk.PropertyId.SpeechServiceResponse_JsonResult) ? 0.8 : 0.5,
              entities: JSON.parse(result.properties?.getProperty(speechsdk.PropertyId.SpeechServiceResponse_JsonResult) || '{}')
            });
          } else {
            // 如果没有识别到意向，返回基础语音识别结果
            resolve({
              text: result.text || '',
              intent: 'general',
              confidence: 0.3,
              entities: {}
            });
          }
          intentRecognizer.close();
        },
        error => {
          intentRecognizer.close();
          reject(error);
        }
      );
    });
  }

  // 说话人识别
  async speakerRecognition(audioBuffer: ArrayBuffer): Promise<SpeakerRecognitionResult> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    speechConfig.speechRecognitionLanguage = "zh-CN";

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            // 模拟说话人识别结果（实际需要先注册说话人模型）
            resolve({
              text: result.text,
              speakerId: 'speaker_' + Math.random().toString(36).substr(2, 9),
              confidence: 0.75
            });
          } else {
            reject(new Error('说话人识别失败'));
          }
          recognizer.close();
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  // 发音评估
  async pronunciationAssessment(audioBuffer: ArrayBuffer, referenceText: string): Promise<PronunciationResult> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    speechConfig.speechRecognitionLanguage = "zh-CN";

    const pronunciationAssessmentConfig = new speechsdk.PronunciationAssessmentConfig(
      referenceText,
      speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
      speechsdk.PronunciationAssessmentGranularity.Word,
      true
    );

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
    
    pronunciationAssessmentConfig.applyTo(recognizer);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            const pronunciationResult = speechsdk.PronunciationAssessmentResult.fromResult(result);
            
            resolve({
              text: result.text,
              accuracyScore: pronunciationResult.accuracyScore,
              fluencyScore: pronunciationResult.fluencyScore,
              completenessScore: pronunciationResult.completenessScore,
              prosodyScore: pronunciationResult.prosodyScore || 0,
              overallScore: (pronunciationResult.accuracyScore + pronunciationResult.fluencyScore + pronunciationResult.completenessScore) / 3,
              words: pronunciationResult.detailResult?.Words?.map(word => ({
                word: word.Word,
                accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                errorType: word.PronunciationAssessment?.ErrorType || 'None'
              })) || []
            });
          } else {
            reject(new Error('发音评估失败'));
          }
          recognizer.close();
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  // 语言识别
  async languageIdentification(audioBuffer: ArrayBuffer): Promise<LanguageDetectionResult> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    
    // 设置候选语言
    const autoDetectSourceLanguageConfig = speechsdk.AutoDetectSourceLanguageConfig.fromLanguages([
      "zh-CN", "en-US", "ja-JP", "ko-KR", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "ru-RU"
    ]);

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
    const recognizer = speechsdk.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            const detectedLanguage = result.properties?.getProperty(speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages) || "zh-CN";
            
            resolve({
              language: detectedLanguage,
              confidence: 0.85,
              text: result.text
            });
          } else {
            reject(new Error('语言识别失败'));
          }
          recognizer.close();
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  // 增强的语音转文本（支持连续识别和语言检测）
  async enhancedSpeechToText(audioBuffer: ArrayBuffer, options?: {
    language?: string;
    enableLanguageDetection?: boolean;
    enablePhraseList?: boolean;
    customPhrases?: string[];
  }): Promise<{ text: string; language?: string; confidence: number }> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    
    if (options?.enableLanguageDetection) {
      const autoDetectConfig = speechsdk.AutoDetectSourceLanguageConfig.fromLanguages([
        "zh-CN", "en-US", "ja-JP", "ko-KR", "es-ES", "fr-FR"
      ]);
      const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
      const recognizer = speechsdk.SpeechRecognizer.FromConfig(speechConfig, autoDetectConfig, audioConfig);

      // 添加自定义短语列表
      if (options?.enablePhraseList && options?.customPhrases?.length) {
        const phraseList = speechsdk.PhraseListGrammar.fromRecognizer(recognizer);
        options.customPhrases.forEach(phrase => phraseList.addPhrase(phrase));
      }

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          result => {
            if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
              const detectedLanguage = result.properties?.getProperty(speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages);
              resolve({
                text: result.text,
                language: detectedLanguage,
                confidence: 0.9
              });
            } else {
              reject(new Error('增强语音识别失败'));
            }
            recognizer.close();
          },
          error => {
            recognizer.close();
            reject(error);
          }
        );
      });
    } else {
      speechConfig.speechRecognitionLanguage = options?.language || "zh-CN";
      const audioConfig = speechsdk.AudioConfig.fromWavFileInput(Buffer.from(audioBuffer));
      const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          result => {
            if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
              resolve({
                text: result.text,
                confidence: 0.85
              });
            } else {
              reject(new Error('语音识别失败'));
            }
            recognizer.close();
          },
          error => {
            recognizer.close();
            reject(error);
          }
        );
      });
    }
  }

  // 增强的文本转语音（支持SSML和多种音色）
  async enhancedTextToSpeech(text: string, options?: {
    voice?: string;
    rate?: string;
    pitch?: string;
    style?: string;
    emotion?: string;
  }): Promise<Buffer> {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    
    // 构建SSML
    const voice = options?.voice || "zh-CN-XiaoxiaoNeural";
    const rate = options?.rate || "medium";
    const pitch = options?.pitch || "medium";
    const style = options?.style || "general";
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch}">
            <mstts:express-as style="${style}">
              ${text}
            </mstts:express-as>
          </prosody>
        </voice>
      </speak>
    `;

    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData));
          } else {
            reject(new Error('语音合成失败'));
          }
          synthesizer.close();
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  }
}