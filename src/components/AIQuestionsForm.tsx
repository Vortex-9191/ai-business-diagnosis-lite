import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { aiQuestions, scaleLabels, questionCategories } from '../utils/formData';
import { FormData } from '../types';

interface AIQuestionsFormProps {
  formData: Partial<FormData>;
  onAnswerChange: (questionId: string, value: number | string) => void;
}

const AIQuestionsForm: React.FC<AIQuestionsFormProps> = ({ formData, onAnswerChange }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const currentQuestion = aiQuestions[currentQuestionIndex];
  const currentCategory = questionCategories[currentQuestion.category];
  const currentValue = formData[currentQuestion.id as keyof FormData];
  
  const totalQuestions = aiQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // 質問が変わったらエラーをリセット
  React.useEffect(() => {
    setShowError(false);
  }, [currentQuestionIndex]);

  const handleNext = () => {
    // 連打防止
    if (isNavigating) return;
    
    // 回答がない場合はエラーを表示
    const currentAnswer = formData[currentQuestion.id as keyof FormData];
    if (!currentAnswer && currentAnswer !== 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    // エラーを消してから次の質問へ進む
    setShowError(false);
    
    // シングルクリックで次の質問へ進む
    if (currentQuestionIndex < totalQuestions - 1) {
      setIsNavigating(true);
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => setIsNavigating(false), 100);
    }
  };

  const handlePrevious = () => {
    setShowError(false); // 前の質問に戻る時もエラーを消す
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (value: number | string) => {
    onAnswerChange(currentQuestion.id, value);
    setShowError(false); // 選択したらエラーを消す
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-4 sm:mb-6 px-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-slate-600 flex-shrink-0">
            質問 {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs sm:text-sm font-medium text-[#59B3B3] flex-shrink-0 ml-2">
            {Math.round(progress)}% 完了
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-[#59B3B3] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* カテゴリ表示 */}
      <div className="text-center mb-4 sm:mb-6">
        <div 
          className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-white font-semibold text-xs sm:text-sm"
          style={{ backgroundColor: currentCategory.color }}
        >
          <span className="w-2 h-2 bg-white/30 rounded-full mr-2"></span>
          {currentCategory.name}
        </div>
      </div>

      {/* 質問カード */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8 min-h-[400px] sm:min-h-[450px] flex flex-col">
        {/* 質問番号と内容 */}
        <div className="flex-1">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#59B3B3] rounded-xl sm:rounded-2xl text-white font-bold text-lg sm:text-xl mb-4 shadow-lg">
              {currentQuestion.id}
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 leading-relaxed max-w-3xl mx-auto px-2">
              {currentQuestion.text}
            </h2>
          </div>

          {/* 選択肢 */}
          <div className="max-w-2xl mx-auto space-y-3">
            {scaleLabels.map((label, index) => {
              const value = index + 1;
              const isSelected = currentValue === value;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(value)}
                  className={`
                    w-full flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-left
                    ${isSelected
                      ? 'border-[#59B3B3] bg-teal-50 text-[#59B3B3] shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-[#59B3B3] hover:bg-teal-50 hover:shadow-md'
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center transition-all duration-300 flex-shrink-0
                    ${isSelected ? 'border-[#59B3B3] bg-[#59B3B3]' : 'border-slate-300'}
                  `}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="flex-1 font-medium text-sm sm:text-base leading-tight">{label}</span>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#59B3B3] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* エラーメッセージ */}
        {showError && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">
                回答を選択してください
              </span>
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 gap-4 sm:gap-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`
              flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform text-sm sm:text-base w-full sm:w-auto
              ${currentQuestionIndex === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-md hover:scale-105'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            前の質問
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2 order-first sm:order-none">
            {Array.from({ length: Math.min(5, totalQuestions) }, (_, i) => {
              const dotIndex = Math.floor((currentQuestionIndex / totalQuestions) * 5);
              return (
                <div
                  key={i}
                  className={`
                    w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300
                    ${i === dotIndex ? 'bg-[#59B3B3] w-4 sm:w-6' : 'bg-slate-300'}
                  `}
                />
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={isNavigating || currentQuestionIndex === totalQuestions - 1}
            className={`
              flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform text-sm sm:text-base w-full sm:w-auto
              ${currentQuestionIndex === totalQuestions - 1 || !currentValue
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#59B3B3] text-white hover:bg-[#4A9999] hover:shadow-lg hover:scale-105'
              }
            `}
          >
            次の質問
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* 質問一覧（小さなドット表示） */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-1 bg-white rounded-full px-4 py-2 border border-slate-200 max-w-full overflow-x-auto">
          {aiQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0
                ${index === currentQuestionIndex 
                  ? 'bg-[#59B3B3] w-4' 
                  : formData[aiQuestions[index].id as keyof FormData] 
                    ? 'bg-teal-400' 
                    : 'bg-slate-300'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionsForm;