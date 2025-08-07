import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: '職種選択' },
    { number: 2, title: '業務課題' },
    { number: 3, title: 'AI関連質問' },
    { number: 4, title: '個人情報' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 sm:top-6 left-0 w-full h-0.5 sm:h-1 bg-slate-200 rounded-full z-0">
          <div 
            className="h-full bg-[#59B3B3] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
            <div className={`
              w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 transform
              ${currentStep > step.number 
                ? 'bg-[#59B3B3] text-white shadow-lg scale-110' 
                : currentStep === step.number 
                  ? 'bg-[#59B3B3] text-white ring-2 sm:ring-4 ring-teal-200 shadow-lg scale-110' 
                  : 'bg-white border-2 border-slate-300 text-slate-400 shadow-md'
              }
            `}>
              {currentStep > step.number ? (
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
              ) : (
                <span className="text-xs sm:text-sm font-bold">{step.number}</span>
              )}
            </div>
            <span className={`
              text-xs sm:text-sm mt-1 sm:mt-3 font-semibold transition-all duration-300 text-center max-w-16 sm:max-w-none leading-tight
              ${currentStep >= step.number ? 'text-[#59B3B3]' : 'text-slate-400'}
            `}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;