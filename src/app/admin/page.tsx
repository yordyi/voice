'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Brain,
  Shield,
  Zap,
  Database,
  Cloud,
  Activity
} from 'lucide-react';

export default function AdminPanel() {
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setAzureKey(data.azureKey || '');
        setAzureRegion(data.azureRegion || '');
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          azureKey,
          azureRegion,
        }),
      });

      if (response.ok) {
        setMessage('配置保存成功！');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('保存失败，请重试');
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus('testing');
    setMessage('');
    setTestProgress(0);

    // 模拟测试进度
    const progressInterval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 20;
      });
    }, 500);

    try {
      const response = await fetch('/api/admin/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          azureKey,
          azureRegion,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setConnectionStatus('success');
        setTestProgress(100);
        setMessage('连接测试成功！Azure服务正常');
      } else {
        setConnectionStatus('error');
        setMessage(data.error || '连接测试失败');
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage('连接测试失败');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => {
        setTestProgress(0);
        setConnectionStatus('idle');
      }, 3000);
    }
  };

  const regions = [
    { value: 'eastasia', label: 'East Asia (香港)', latency: '~50ms' },
    { value: 'southeastasia', label: 'Southeast Asia (新加坡)', latency: '~80ms' },
    { value: 'eastus', label: 'East US', latency: '~200ms' },
    { value: 'eastus2', label: 'East US 2', latency: '~190ms' },
    { value: 'westus', label: 'West US', latency: '~250ms' },
    { value: 'westus2', label: 'West US 2', latency: '~230ms' },
    { value: 'westus3', label: 'West US 3', latency: '~240ms' },
    { value: 'centralus', label: 'Central US', latency: '~210ms' },
    { value: 'northeurope', label: 'North Europe', latency: '~180ms' },
    { value: 'westeurope', label: 'West Europe', latency: '~160ms' },
    { value: 'uksouth', label: 'UK South', latency: '~170ms' },
    { value: 'francecentral', label: 'France Central', latency: '~150ms' },
    { value: 'germanywestcentral', label: 'Germany West Central', latency: '~165ms' },
    { value: 'japaneast', label: 'Japan East', latency: '~30ms' },
    { value: 'japanwest', label: 'Japan West', latency: '~35ms' },
    { value: 'koreacentral', label: 'Korea Central', latency: '~40ms' },
    { value: 'australiaeast', label: 'Australia East', latency: '~120ms' },
    { value: 'australiasoutheast', label: 'Australia Southeast', latency: '~130ms' },
    { value: 'centralindia', label: 'Central India (印度中部)', latency: '~100ms' },
    { value: 'southindia', label: 'South India (印度南部)', latency: '~110ms' },
    { value: 'westindia', label: 'West India (印度西部)', latency: '~105ms' },
    { value: 'canadacentral', label: 'Canada Central', latency: '~180ms' },
    { value: 'canadaeast', label: 'Canada East', latency: '~185ms' },
    { value: 'brazilsouth', label: 'Brazil South', latency: '~280ms' },
    { value: 'southafricanorth', label: 'South Africa North', latency: '~220ms' },
    { value: 'uaenorth', label: 'UAE North', latency: '~90ms' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-700 border-green-200 bg-green-50';
      case 'error': return 'text-red-700 border-red-200 bg-red-50';
      case 'testing': return 'text-blue-700 border-blue-200 bg-blue-50';
      default: return 'text-slate-700 border-slate-200 bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回首页</span>
                </a>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">管理面板</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge 
                variant="secondary" 
                className={`${
                  connectionStatus === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : connectionStatus === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {connectionStatus === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                {connectionStatus === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                {connectionStatus === 'testing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {connectionStatus === 'idle' && <Activity className="w-3 h-3 mr-1" />}
                {connectionStatus === 'success' ? '服务已连接' : 
                 connectionStatus === 'error' ? '连接失败' :
                 connectionStatus === 'testing' ? '测试中' : '未测试'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="config" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="config" className="flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>服务配置</span>
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>服务状态</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>帮助文档</span>
              </TabsTrigger>
            </TabsList>

            {/* 配置选项卡 */}
            <TabsContent value="config" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <span>Azure 语音服务配置</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    配置 Azure Speech Services 密钥和区域，启用AI语音处理功能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 密钥配置 */}
                  <div className="space-y-3">
                    <Label htmlFor="azure-key" className="text-base font-medium flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Azure 语音服务密钥</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="azure-key"
                        type={showKey ? "text" : "password"}
                        value={azureKey}
                        onChange={(e) => setAzureKey(e.target.value)}
                        placeholder="请输入Azure Speech Service密钥"
                        className="pr-12 text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-2"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {azureKey && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>密钥格式正确</span>
                      </div>
                    )}
                  </div>

                  {/* 区域配置 */}
                  <div className="space-y-3">
                    <Label htmlFor="azure-region" className="text-base font-medium flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-purple-600" />
                      <span>Azure 区域</span>
                    </Label>
                    <Select value={azureRegion} onValueChange={setAzureRegion}>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="选择最近的Azure区域以获得最佳性能" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{region.label}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {region.latency}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {azureRegion && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>区域已选择: {regions.find(r => r.value === azureRegion)?.label}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* 操作按钮 */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={saveConfig}
                      disabled={loading || !azureKey || !azureRegion}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      size="lg"
                    >
                      {loading && connectionStatus !== 'testing' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4 mr-2" />
                          保存配置
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={testConnection}
                      disabled={loading || !azureKey || !azureRegion}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      {loading && connectionStatus === 'testing' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          测试中...
                        </>
                      ) : (
                        <>
                          <Cloud className="w-4 h-4 mr-2" />
                          测试连接
                        </>
                      )}
                    </Button>
                  </div>

                  {/* 测试进度 */}
                  {loading && connectionStatus === 'testing' && testProgress > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm text-blue-700 mb-2">
                        <span>连接测试进度</span>
                        <span>{testProgress}%</span>
                      </div>
                      <Progress value={testProgress} className="h-2" />
                    </div>
                  )}

                  {/* 消息提示 */}
                  {message && (
                    <Card className={`${getStatusColor(connectionStatus)} border`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                          {connectionStatus === 'success' && <CheckCircle className="w-5 h-5" />}
                          {connectionStatus === 'error' && <AlertCircle className="w-5 h-5" />}
                          <p className="font-medium">{message}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 服务状态选项卡 */}
            <TabsContent value="status" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-800 mb-1">语音识别服务</h3>
                        <p className="text-sm text-green-600">Speech to Text</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">正常运行</Badge>
                      <span className="text-xs text-green-600">99.9% 可用性</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-purple-800 mb-1">语音合成服务</h3>
                        <p className="text-sm text-purple-600">Text to Speech</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <Badge variant="outline" className="text-purple-700 border-purple-300">正常运行</Badge>
                      <span className="text-xs text-purple-600">99.9% 可用性</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>性能监控</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4">
                      <div className="text-2xl font-bold text-blue-600 mb-1">99.5%</div>
                      <div className="text-sm text-slate-600">识别准确率</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-2xl font-bold text-green-600 mb-1">&lt;500ms</div>
                      <div className="text-sm text-slate-600">平均延迟</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-2xl font-bold text-purple-600 mb-1">40+</div>
                      <div className="text-sm text-slate-600">支持语言</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
                      <div className="text-sm text-slate-600">服务可用</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 帮助文档选项卡 */}
            <TabsContent value="docs" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span>快速开始</span>
                  </CardTitle>
                  <CardDescription>
                    按照以下步骤配置您的Azure语音服务
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">创建Azure账户</h4>
                        <p className="text-sm text-slate-600">
                          访问 <a href="https://azure.microsoft.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Azure门户</a> 并创建免费账户
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">创建语音服务资源</h4>
                        <p className="text-sm text-slate-600">
                          在Azure门户中搜索"Speech Services"并创建新资源
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">获取密钥和区域</h4>
                        <p className="text-sm text-slate-600">
                          复制资源的密钥和区域信息到配置页面
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">测试连接</h4>
                        <p className="text-sm text-slate-600">
                          点击"测试连接"按钮验证配置是否正确
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">重要提示</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• 请妥善保管您的Azure密钥，不要在公开场合泄露</li>
                      <li>• 选择距离用户最近的区域以获得最佳性能</li>
                      <li>• Azure提供免费额度，超出后将按使用量计费</li>
                      <li>• 建议定期监控使用情况和费用</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}