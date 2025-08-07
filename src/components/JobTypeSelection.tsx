import React, { useState } from 'react';
import { jobTypes } from '../utils/formData';

interface JobTypeSelectionProps {
  selectedJobType: string;
  onJobTypeChange: (jobType: string) => void;
}

const JobTypeSelection: React.FC<JobTypeSelectionProps> = ({ selectedJobType, onJobTypeChange }) => {
  const [customJobType, setCustomJobType] = useState('');
  const isOtherSelected = selectedJobType === 'その他' || (selectedJobType && !jobTypes.includes(selectedJobType));

  const handleJobTypeClick = (jobType: string) => {
    if (jobType === 'その他') {
      onJobTypeChange('その他');
    } else {
      onJobTypeChange(jobType);
      setCustomJobType('');
    }
  };

  const handleCustomJobTypeChange = (value: string) => {
    setCustomJobType(value);
    onJobTypeChange(value);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">職種を選択してください</h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto px-2">
          あなたの現在の職種に最も近いものを選んでください
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {jobTypes.map((jobType) => (
          <button
            key={jobType}
            onClick={() => handleJobTypeClick(jobType)}
            className={`
              group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-sm font-semibold transform hover:scale-105 min-h-[60px] sm:min-h-[80px] flex items-center justify-center
              ${(selectedJobType === jobType) || (jobType === 'その他' && isOtherSelected)
                ? 'border-[#59B3B3] bg-teal-50 text-[#59B3B3] shadow-lg'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#59B3B3] hover:bg-teal-50 hover:shadow-lg'
              }
            `}
          >
            <span className="relative z-10 text-center leading-tight">{jobType}</span>
            {((selectedJobType === jobType) || (jobType === 'その他' && isOtherSelected)) && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#59B3B3] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* その他が選択された場合の自由記述欄 */}
      {isOtherSelected && (
        <div className="max-w-md mx-auto mt-6">
          <label htmlFor="customJobType" className="block text-sm font-semibold text-slate-700 mb-3">
            職種を入力してください
          </label>
          <input
            type="text"
            id="customJobType"
            placeholder="例：コンサルタント、エンジニア等"
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-[#59B3B3] transition-all duration-300 bg-white text-base"
            value={customJobType}
            onChange={(e) => handleCustomJobTypeChange(e.target.value)}
            maxLength={50}
          />
          <div className="text-right mt-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {customJobType.length}/50文字
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTypeSelection;