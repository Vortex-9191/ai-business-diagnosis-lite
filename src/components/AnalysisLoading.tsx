import React, { useState, useEffect } from 'react';
import { Brain, Zap, Shield, Cpu, Rocket, Loader2, CheckCircle } from 'lucide-react';

interface AnalysisLoadingProps {
  progress?: number;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ progress = 0 }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const analysisSteps = [
    {
      id: 1,
      title: "回答データを送信中",
      icon: Brain,
      color: "#59B3B3",
      description: "10項目の回答データを分析サーバーに送信しています"
    },
    {
      id: 2,
      title: "AI診断を実行中",
      icon: Cpu,
      color: "#59B3B3",
      description: "回答パターンを基にAI診断を実行しています"
    },
    {
      id: 3,
      title: "結果を生成中",
      icon: Zap,
      color: "#59B3B3",
      description: "診断結果とレポートを生成しています"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next <= analysisSteps.length) {
          // 前のステップを完了済みに追加
          if (prev > 0) {
            setCompletedSteps(completed => [...completed, prev]);
          }
          return next;
        }
        return prev;
      });
    }, 2500); // 2.5秒ごとに次のステップへ

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        {/* ロゴとタイトル */}
        <div className="flex items-center justify-center mb-8 gap-3">
          <img 
            src="/screenshot-2025-06-18-15-32-55.png" 
            alt="AI ビジネス診断" 
            className="h-20 w-auto"
          />
          <span className="text-3xl font-bold text-[#59B3B3] tracking-wider">
            LITE
          </span>
        </div>
        
        <div className="w-24 h-24 bg-gradient-to-r from-[#59B3B3] to-[#4A9999] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Brain className="w-12 h-12 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold text-slate-800 mb-4">AI分析実行中</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          あなたの回答をもとに、高度なAIアルゴリズムが詳細な診断を実行しています
        </p>
      </div>

      {/* 進捗インジケーター */}
      <div className="mb-12">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>分析進捗</span>
          <span>{Math.min(Math.round(currentStep * 33.33), 100)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-[#59B3B3] to-[#4A9999] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(Math.round(currentStep * 33.33), 100)}%` }}
          />
        </div>
      </div>

      {/* 分析ステップ */}
      <div className="space-y-6">
        {analysisSteps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isPending = currentStep < step.id;
          const IconComponent = step.icon;

          return (
            <div 
              key={step.id}
              className={`
                relative bg-white rounded-2xl p-6 border-2 transition-all duration-500 transform
                ${isActive ? 'border-[#59B3B3] shadow-lg scale-105' : 
                  isCompleted ? 'border-green-200 bg-green-50' : 
                  'border-slate-200'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className={`
                    w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-500
                    ${isActive ? 'shadow-lg animate-pulse' : 
                      isCompleted ? 'bg-green-500' : 
                      'bg-slate-200'
                    }
                  `}
                  style={{ 
                    backgroundColor: isActive ? step.color : 
                                   isCompleted ? '#10B981' : 
                                   '#E2E8F0'
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : isActive ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <IconComponent 
                      className={`w-8 h-8 ${isPending ? 'text-slate-400' : 'text-white'}`} 
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`
                    text-xl font-bold mb-2 transition-colors duration-300
                    ${isActive ? 'text-slate-800' : 
                      isCompleted ? 'text-green-700' : 
                      'text-slate-500'
                    }
                  `}>
                    {step.title}
                    {isActive && (
                      <span className="ml-2 text-[#59B3B3] animate-pulse">●●●</span>
                    )}
                    {isCompleted && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </h3>
                  <p className={`
                    transition-colors duration-300
                    ${isActive ? 'text-slate-600' : 
                      isCompleted ? 'text-green-600' : 
                      'text-slate-400'
                    }
                  `}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分析完了後のメッセージ */}
      {currentStep > analysisSteps.length && (
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">分析完了！</h3>
          <p className="text-green-700">
            まもなく診断結果を表示します...
          </p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">分析中です</h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              分析には通常30秒〜2分程度かかります。正確な診断のため、このページを閉じずにお待ちください。
              分析完了次第、自動的に結果画面に移行いたします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;