import React from 'react';
import { Brain } from 'lucide-react';

const SimpleAnalysisLoading: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        {/* ロゴ */}
        <div className="flex items-center justify-center mb-12 gap-3">
          <img 
            src="/screenshot-2025-06-18-15-32-55.png" 
            alt="AI ビジネス診断" 
            className="h-24 w-auto"
          />
          <span className="text-4xl font-bold text-[#59B3B3] tracking-wider">
            LITE
          </span>
        </div>
        
        {/* 分析中アイコン */}
        <div className="w-32 h-32 bg-gradient-to-r from-[#59B3B3] to-[#4A9999] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Brain className="w-16 h-16 text-white animate-pulse" />
        </div>
        
        {/* メッセージ */}
        <h2 className="text-5xl font-bold text-slate-800 mb-6">分析しています</h2>
        <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          あなたの回答を詳細に分析中です<br />
          しばらくお待ちください
        </p>
        
        {/* 読み込みアニメーション */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-[#59B3B3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-[#59B3B3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-[#59B3B3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalysisLoading;