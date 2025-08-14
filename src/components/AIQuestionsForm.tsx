import React from 'react';
import { aiQuestions, scaleLabels, questionCategories } from '../utils/formData';
import { FormData } from '../types';

interface AIQuestionsFormProps {
  formData: Partial<FormData>;
  onAnswerChange: (questionId: string, value: number | string) => void;
}

const AIQuestionsForm: React.FC<AIQuestionsFormProps> = ({ formData, onAnswerChange }) => {
  // 全ての質問を一度に表示
  const totalQuestions = aiQuestions.length;
  const answeredQuestions = aiQuestions.filter(q => 
    formData[q.id as keyof FormData] !== null && 
    formData[q.id as keyof FormData] !== undefined
  ).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: string, value: number | string) => {
    onAnswerChange(questionId, value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-6 sm:mb-8 px-2">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-medium text-slate-600 flex-shrink-0">
            回答済み {answeredQuestions} / {totalQuestions}
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

      {/* 全質問表示 */}
      <div className="space-y-8">
        {aiQuestions.map((question) => {
          const category = questionCategories[question.category];
          const currentValue = formData[question.id as keyof FormData];
          
          return (
            <div key={question.id} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8">
              {/* カテゴリ表示 */}
              <div className="text-center mb-4">
                <div 
                  className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-white font-semibold text-xs sm:text-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="w-2 h-2 bg-white/30 rounded-full mr-2"></span>
                  {category.name}
                </div>
              </div>
              
              {/* 質問番号と内容 */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#59B3B3] rounded-xl sm:rounded-2xl text-white font-bold text-lg sm:text-xl shadow-lg">
                    {question.id}
                  </div>
                  {question.type === 'text' && (
                    <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full font-medium">
                      任意回答
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed max-w-3xl mx-auto px-2">
                  {question.text}
                </h2>
              </div>

              {/* 選択肢 */}
              <div className="space-y-3">
                {question.type === 'text' ? (
                  <div className="max-w-2xl mx-auto w-full">
                    <textarea
                      value={(currentValue as string) || ''}
                      onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                      placeholder="ご自由にお書きください（任意回答）"
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-teal-200 focus:border-[#59B3B3] transition-all duration-300 text-base sm:text-lg resize-none"
                      maxLength={256}
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs sm:text-sm text-slate-500">
                        ※ この質問は任意回答です。スキップできます。
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {(currentValue as string)?.length || 0}/256
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scaleLabels.map((label, labelIndex) => {
                      const value = labelIndex + 1;
                      const isSelected = currentValue === value;
                      
                      return (
                        <button
                          key={labelIndex}
                          onClick={() => handleAnswerSelect(question.id, value)}
                          className={`
                            flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-left
                            ${isSelected
                              ? 'border-[#59B3B3] bg-teal-50 text-[#59B3B3] shadow-lg scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-[#59B3B3] hover:bg-teal-50 hover:shadow-md'
                            }
                          `}
                        >
                          <div className={`
                            w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-300 flex-shrink-0
                            ${isSelected ? 'border-[#59B3B3] bg-[#59B3B3]' : 'border-slate-300'}
                          `}>
                            {isSelected && (
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="flex-1 font-medium text-sm sm:text-base leading-tight">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIQuestionsForm;