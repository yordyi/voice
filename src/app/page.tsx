'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Zap, 
  Brain, 
  Headphones, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Waves,
  Volume2,
  Languages,
  Target,
  Users,
  BookOpen,
  Globe,
  Sparkles
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [synthesizedAudio, setSynthesizedAudio] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stt');
  const [progress, setProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const speechToText = async () => {
    if (!audioBlob) return;
    
    setLoading(true);
    setProgress(0);
    
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.text) {
        setRecognizedText(data.text);
        setProgress(100);
      } else {
        alert('语音识别失败');
      }
    } catch (error) {
      alert('语音转文本失败');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const textToSpeech = async () => {
    if (!textInput.trim()) return;
    
    setLoading(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 15;
      });
    }, 300);
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });
      
      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const blob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        setSynthesizedAudio(audioUrl);
        setProgress(100);
      } else {
        alert('文本转语音失败');
      }
    } catch (error) {
      alert('文本转语音失败');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative">
          <header className="container mx-auto px-4 py-6">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VoiceAI
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  服务正常
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    管理面板
                  </a>
                </Button>
              </div>
            </nav>
          </header>
          
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <Zap className="w-3 h-3 mr-1" />
                基于 Azure 语音服务
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  智能语音处理
                </span>
                <br />
                <span className="text-slate-900">专业平台</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                高精度语音识别与自然语音合成，支持实时转换、多语言支持，让您的应用拥有人性化的声音交互体验
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <Badge variant="outline" className="px-4 py-2">
                  <Volume2 className="w-4 h-4 mr-2" />
                  多语言支持
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Waves className="w-4 h-4 mr-2" />
                  实时处理
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Brain className="w-4 h-4 mr-2" />
                  AI 驱动
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Application */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 max-w-6xl mx-auto mb-12 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="stt" className="flex flex-col items-center space-y-1 p-3">
                <Mic className="w-4 h-4" />
                <span className="text-xs">语音转文本</span>
              </TabsTrigger>
              <TabsTrigger value="translation" className="flex flex-col items-center space-y-1 p-3">
                <Languages className="w-4 h-4" />
                <span className="text-xs">语音翻译</span>
              </TabsTrigger>
              <TabsTrigger value="intent" className="flex flex-col items-center space-y-1 p-3">
                <Target className="w-4 h-4" />
                <span className="text-xs">意向识别</span>
              </TabsTrigger>
              <TabsTrigger value="speaker" className="flex flex-col items-center space-y-1 p-3">
                <Users className="w-4 h-4" />
                <span className="text-xs">说话人识别</span>
              </TabsTrigger>
              <TabsTrigger value="pronunciation" className="flex flex-col items-center space-y-1 p-3">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">发音评估</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex flex-col items-center space-y-1 p-3">
                <Globe className="w-4 h-4" />
                <span className="text-xs">语言识别</span>
              </TabsTrigger>
              <TabsTrigger value="tts" className="flex flex-col items-center space-y-1 p-3">
                <Headphones className="w-4 h-4" />
                <span className="text-xs">文本转语音</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stt" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <span>语音识别</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    点击录音按钮开始录制，支持中英文混合识别
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      size="lg"
                      className={`w-24 h-24 rounded-full text-white font-semibold transition-all duration-300 ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/25' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </Button>
                  </div>
                  
                  {isRecording && (
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 rounded-full border border-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-700 text-sm font-medium">正在录音...</span>
                      </div>
                    </div>
                  )}
                  
                  {audioBlob && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-700">录音文件</span>
                          <Badge variant="secondary">准备就绪</Badge>
                        </div>
                        <audio 
                          controls 
                          src={URL.createObjectURL(audioBlob)} 
                          className="w-full mb-4" 
                        />
                        <Button
                          onClick={speechToText}
                          disabled={loading}
                          className="w-full"
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              转换中...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              转换为文字
                            </>
                          )}
                        </Button>
                        
                        {loading && progress > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                              <span>处理进度</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {recognizedText && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-green-800">识别结果</h3>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{recognizedText}</p>
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(recognizedText)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            复制文本
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tts" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <span>语音合成</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    输入文本内容，生成高质量的自然语音
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="请输入要转换为语音的文字内容...
例如：您好，欢迎使用AI语音助手！"
                      rows={6}
                      className="resize-none text-base leading-relaxed"
                    />
                    
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>字数： {textInput.length}</span>
                      <span>预估时间： {Math.ceil(textInput.length / 10)} 秒</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={textToSpeech}
                    disabled={loading || !textInput.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        生成语音
                      </>
                    )}
                  </Button>
                  
                  {loading && progress > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>合成进度</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                  
                  {synthesizedAudio && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-purple-800">合成完成</h3>
                        </div>
                        <audio 
                          controls 
                          src={synthesizedAudio} 
                          className="w-full mb-4" 
                        />
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = synthesizedAudio;
                              a.download = 'synthesized_audio.wav';
                              a.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            下载音频
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 语音翻译 */}
            <TabsContent value="translation" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Languages className="w-5 h-5 text-white" />
                    </div>
                    <span>语音翻译</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    实时语音翻译，支持多种语言互译
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">源语言</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择源语言" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh-CN">中文</SelectItem>
                          <SelectItem value="en-US">英语</SelectItem>
                          <SelectItem value="ja-JP">日语</SelectItem>
                          <SelectItem value="ko-KR">韩语</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">目标语言</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择目标语言" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">英语</SelectItem>
                          <SelectItem value="zh-CN">中文</SelectItem>
                          <SelectItem value="ja-JP">日语</SelectItem>
                          <SelectItem value="ko-KR">韩语</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-700 mb-2">原文：</h3>
                      <p className="text-slate-800">你好，世界！</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="font-medium text-green-700 mb-2">译文：</h3>
                      <p className="text-slate-800">Hello, world!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 意向识别 */}
            <TabsContent value="intent" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span>意向识别</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    智能识别语音中的用户意图和关键实体
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Button className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-700 mb-2">识别文本：</h3>
                      <p className="text-slate-800">我想订一张明天去北京的机票</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <h3 className="font-medium text-orange-700 mb-2">意图：</h3>
                        <Badge className="bg-orange-100 text-orange-800">机票预订</Badge>
                        <p className="text-sm text-slate-600 mt-2">置信度: 92%</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="font-medium text-blue-700 mb-2">实体：</h3>
                        <div className="space-y-1">
                          <Badge variant="outline">时间: 明天</Badge>
                          <Badge variant="outline">地点: 北京</Badge>
                          <Badge variant="outline">服务: 机票</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 说话人识别 */}
            <TabsContent value="speaker" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span>说话人识别</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    识别和区分不同说话人的声音特征
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Button className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-700 mb-2">识别文本：</h3>
                      <p className="text-slate-800">大家好，我是张三</p>
                    </div>
                    <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                      <h3 className="font-medium text-violet-700 mb-2">说话人信息：</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">说话人ID</p>
                          <p className="font-medium">speaker_abc123</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">置信度</p>
                          <p className="font-medium">87%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 发音评估 */}
            <TabsContent value="pronunciation" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span>发音评估</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    专业的发音准确性和流畅性评估
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">参考文本</label>
                    <Input placeholder="请输入要评估发音的文本..." />
                  </div>

                  <div className="flex justify-center">
                    <Button className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-700 mb-2">参考文本：</h3>
                      <p className="text-slate-800">Hello world, how are you today?</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-700">准确性</span>
                            <span className="text-lg font-bold text-green-800">85分</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-700">流畅性</span>
                            <span className="text-lg font-bold text-blue-800">92分</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-purple-700">完整性</span>
                            <span className="text-lg font-bold text-purple-800">88分</span>
                          </div>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-pink-700">总体得分</span>
                            <span className="text-lg font-bold text-pink-800">88分</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 语言识别 */}
            <TabsContent value="language" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span>语言识别</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    自动检测音频中使用的语言种类
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Button className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-700 mb-2">识别文本：</h3>
                      <p className="text-slate-800">Hello, how are you doing today?</p>
                    </div>
                    
                    <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                      <h3 className="font-medium text-cyan-700 mb-3">检测结果：</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-cyan-100 text-cyan-800">英语 (en-US)</Badge>
                          <span className="text-sm text-slate-600">置信度: 95%</span>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        系统支持检测中文、英语、日语、韩语等10种常见语言
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">产品特性</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              基于Azure语音服务构建，提供企业级的语音处理能力
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">高精度识别</h3>
              <p className="text-slate-600 leading-relaxed">
                支持多语言、方言识别，准确率达99.5%以上，适应复杂的音频环境
              </p>
            </Card>
            
            <Card className="text-center p-8 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">自然语音</h3>
              <p className="text-slate-600 leading-relaxed">
                神经网络语音合成技术，声音自然流畅，支持多种声线和情感表达
              </p>
            </Card>
            
            <Card className="text-center p-8 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">快速响应</h3>
              <p className="text-slate-600 leading-relaxed">
                实时流式处理，平均响应时间小于500ms，支持大并发请求处理
              </p>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Technical Specs */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">技术规格</h3>
            <p className="text-slate-300">专业级的技术参数，满足企业级应用需求</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.5%</div>
              <div className="text-slate-300">识别准确率</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{"<500ms"}</div>
              <div className="text-slate-300">响应延迟</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">40+</div>
              <div className="text-slate-300">支持语言</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-slate-300">服务可用性</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}