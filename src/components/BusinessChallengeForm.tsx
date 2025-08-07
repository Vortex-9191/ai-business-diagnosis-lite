import React, { useState } from 'react';
import { CheckCircle, Edit3, ArrowRight, Clock, Target, Zap } from 'lucide-react';
import { jobSpecificTasks } from '../utils/formData';

interface BusinessChallengeFormProps {
  selectedJobType: string;
  challenges: {
    BusinessChallenge1: string;
    BusinessChallenge2: string;
    BusinessChallenge3: string;
  };
  onChallengeUpdate: (challengeKey: string, value: string) => void;
}

const BusinessChallengeForm: React.FC<BusinessChallengeFormProps> = ({
  selectedJobType,
  challenges,
  onChallengeUpdate
}) => {
  const [activeInputs, setActiveInputs] = useState({
    BusinessChallenge1: false,
    BusinessChallenge2: false,
    BusinessChallenge3: false
  });

  // その他の職種または存在しない職種（カスタム職種）の場合は空配列
  const isOtherJobType = selectedJobType === 'その他' || !jobSpecificTasks[selectedJobType] || !jobSpecificTasks.hasOwnProperty(selectedJobType);
  const tasks = isOtherJobType ? [] : (jobSpecificTasks[selectedJobType] || []);

  const challengeConfig = [
    {
      key: 'BusinessChallenge1',
      title: '最も時間がかかっている業務課題',
      subtitle: '毎日の業務で最も時間を取られている作業',
      icon: Clock,
      color: 'bg-[#59B3B3]',
      required: true,
      priority: '最優先'
    },
    {
      key: 'BusinessChallenge2',
      title: '2番目に改善したい業務課題',
      subtitle: '効率化できれば大きな効果が期待できる作業',
      icon: Target,
      color: 'bg-slate-500',
      required: false,
      priority: '重要'
    },
    {
      key: 'BusinessChallenge3',
      title: '3番目に改善したい業務課題',
      subtitle: '将来的に改善を検討したい作業',
      icon: Zap,
      color: 'bg-slate-400',
      required: false,
      priority: '検討中'
    }
  ];

  const handleTaskSelection = (task: string, challengeKey: string) => {
    if (task === 'その他（自由記述）') {
      setActiveInputs(prev => ({ ...prev, [challengeKey]: true }));
      onChallengeUpdate(challengeKey, '');
    } else {
      setActiveInputs(prev => ({ ...prev, [challengeKey]: false }));
      onChallengeUpdate(challengeKey, task);
    }
  };

  const handleTextAreaChange = (challengeKey: string, value: string) => {
    onChallengeUpdate(challengeKey, value);
  };

  return (
    <div className="space-y-12">
      {/* ヘッダー */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-6">業務課題を選択してください</h2>
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center bg-[#59B3B3] text-white px-6 py-3 rounded-2xl shadow-lg">
            <div className="w-3 h-3 bg-white/30 rounded-full mr-3"></div>
            <span className="font-semibold text-lg">{selectedJobType}</span>
            <ArrowRight className="w-5 h-5 ml-3" />
          </div>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {isOtherJobType 
            ? '日頃の業務で改善したい課題を自由記述で入力してください' 
            : 'あなたの職種に特化した業務課題から、改善したいものを優先順位順に選択してください'
          }
        </p>
      </div>

      {/* 課題選択セクション */}
      {challengeConfig.map((config, index) => {
        const challengeKey = config.key as keyof typeof challenges;
        const isActive = activeInputs[challengeKey];
        const currentValue = challenges[challengeKey];
        const IconComponent = config.icon;

        return (
          <div key={config.key} className="relative">
            {/* 課題カード */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500">
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl ${config.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-800">{config.title}</h3>
                      {config.required && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                          必須
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-lg">{config.subtitle}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl ${config.color} text-white font-semibold text-sm shadow-md`}>
                  {config.priority}
                </div>
              </div>

              {/* 選択済み表示 */}
              {currentValue && !isActive && currentValue !== 'その他（自由記述）' && (
                <div className="mb-6 p-6 bg-teal-50 border-2 border-teal-200 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-[#59B3B3] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-teal-800 mb-1">選択済み</p>
                        <p className="text-slate-700 leading-relaxed">{currentValue}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveInputs(prev => ({ ...prev, [challengeKey]: true }));
                        onChallengeUpdate(challengeKey, '');
                      }}
                      className="flex items-center space-x-2 text-[#59B3B3] hover:text-teal-700 font-medium transition-colors duration-200 bg-white px-4 py-2 rounded-xl hover:bg-teal-50 shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm">変更</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 選択肢グリッド（その他職種以外の場合のみ表示） */}
              {!isOtherJobType && !isActive && !currentValue && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map((task, taskIndex) => (
                    <button
                      key={taskIndex}
                      type="button"
                      onClick={() => handleTaskSelection(task, challengeKey)}
                      className="group text-left p-5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 hover:border-[#59B3B3] hover:bg-teal-50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between">
                        <span className="flex-1 leading-relaxed group-hover:text-[#59B3B3] transition-colors duration-300">
                          {task}
                        </span>
                        <div className="ml-3 w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-[#59B3B3] transition-colors duration-300 flex-shrink-0 mt-1"></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 自由記述エリア（その他職種の場合は常に表示、それ以外は条件付き） */}
              {(isOtherJobType || isActive || (currentValue && !tasks.includes(currentValue))) && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Edit3 className="w-5 h-5 text-[#59B3B3]" />
                    <label className="text-lg font-semibold text-slate-700">
                      自由記述（256文字以内）
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full p-6 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-200 focus:border-[#59B3B3] transition-all duration-300 bg-white resize-none text-lg leading-relaxed"
                      placeholder="具体的な業務課題を詳しく記述してください..."
                      maxLength={256}
                      rows={5}
                      required={config.required}
                      value={currentValue}
                      onChange={(e) => handleTextAreaChange(challengeKey, e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                      <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                        {currentValue.length}/256
                      </div>
                    </div>
                  </div>
                  {!isActive && !isOtherJobType && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveInputs(prev => ({ ...prev, [challengeKey]: false }));
                        onChallengeUpdate(challengeKey, '');
                      }}
                      className="text-slate-500 hover:text-slate-700 font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>選択肢に戻る</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 接続線（最後以外） */}
            {index < challengeConfig.length - 1 && (
              <div className="flex justify-center py-6">
                <div className="w-1 h-8 bg-slate-300 rounded-full"></div>
              </div>
            )}
          </div>
        );
      })}

      {/* 進行状況インジケーター */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">選択進行状況</span>
          <div className="flex items-center space-x-2">
            {challengeConfig.map((config, index) => {
              const challengeKey = config.key as keyof typeof challenges;
              const isCompleted = challenges[challengeKey] && challenges[challengeKey].trim() !== '';
              return (
                <div
                  key={config.key}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-[#59B3B3] shadow-lg' 
                      : 'bg-slate-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessChallengeForm;