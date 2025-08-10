import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoiceAI - 智能语音处理专业平台",
  description: "基于Azure语音服务的高精度语音识别与自然语音合成平台，支持实时转换、多语言处理，为您的应用提供人性化的声音交互体验",
  keywords: "语音识别,语音合成,AI语音,Azure Speech,文本转语音,语音转文本",
  authors: [{ name: "VoiceAI Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "VoiceAI - 智能语音处理专业平台",
    description: "高精度语音识别与自然语音合成，让您的应用拥有人性化的声音交互体验",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-slate-900 text-white py-8">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
                <span className="text-lg font-semibold">VoiceAI</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                基于 Azure 语音服务构建的专业AI语音处理平台
              </p>
              <p className="text-slate-500 text-xs">
                © 2024 VoiceAI. 专注于提供高质量的语音处理解决方案.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
