import React from 'react';
import { businessUseOptions, aiTools } from '../utils/formData';

interface PersonalInfoFormProps {
  formData: {
    name: string;
    company: string;
    Yuryo: string;
    Muryo: string;
    Katsuyou: string;
  };
  onInfoChange: (field: string, value: string) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ formData, onInfoChange }) => {
  // 選択されたツールを配列として管理
  const selectedPaidTools = formData.Yuryo ? formData.Yuryo.split(',').map(tool => tool.trim()) : [];
  const selectedFreeTools = formData.Muryo ? formData.Muryo.split(',').map(tool => tool.trim()) : [];

  const handleToolSelection = (tool: string, isPaid: boolean) => {
    const field = isPaid ? 'Yuryo' : 'Muryo';
    const currentTools = isPaid ? selectedPaidTools : selectedFreeTools;
    
    let newTools;
    if (currentTools.includes(tool)) {
      // 既に選択されている場合は削除
      newTools = currentTools.filter(t => t !== tool);
    } else {
      // 3つまで選択可能
      if (currentTools.length < 3) {
        newTools = [...currentTools, tool];
      } else {
        return; // 3つ以上は選択できない
      }
    }
    
    // 文字列に変換
    const toolsString = newTools.join(', ');
    onInfoChange(field, toolsString);
  };

  const isToolSelected = (tool: string, isPaid: boolean) => {
    const selectedTools = isPaid ? selectedPaidTools : selectedFreeTools;
    return selectedTools.includes(tool);
  };


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">個人情報</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          診断結果の精度向上のため、以下の情報をご入力ください
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* 名前 */}
        <div className="space-y-3">
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
            お名前 *
          </label>
          <input
            type="text"
            id="name"
            required
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-[#59B3B3] transition-all duration-300 bg-white"
            placeholder="山田 太郎"
            value={formData.name}
            onChange={(e) => onInfoChange('name', e.target.value)}
          />
        </div>

        {/* メールアドレス */}
        <div className="space-y-3">
          <label htmlFor="company" className="block text-sm font-semibold text-slate-700">
            メールアドレス *
          </label>
          <input
            type="email"
            id="company"
            required
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-[#59B3B3] transition-all duration-300 bg-white"
            placeholder="example@company.com"
            value={formData.company}
            onChange={(e) => onInfoChange('company', e.target.value)}
          />
        </div>

        {/* 有料AIツール使用状況 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">
              有料AIツール使用状況（上位3つまで選択可能）
            </label>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {selectedPaidTools.length}/3個
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {aiTools.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => handleToolSelection(tool, true)}
                disabled={!isToolSelected(tool, true) && selectedPaidTools.length >= 3}
                className={`
                  p-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 text-left
                  ${isToolSelected(tool, true)
                    ? 'border-[#59B3B3] bg-teal-50 text-[#59B3B3]'
                    : (!isToolSelected(tool, true) && selectedPaidTools.length >= 3)
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#59B3B3] hover:bg-teal-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{tool}</span>
                  {isToolSelected(tool, true) && (
                    <div className="w-5 h-5 bg-[#59B3B3] rounded-full flex items-center justify-center ml-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          {formData.Yuryo && (
            <div className="mt-3 p-3 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-sm text-teal-800">
                <span className="font-semibold">選択済み:</span> {formData.Yuryo}
              </p>
            </div>
          )}
        </div>

        {/* 無料AIツール使用状況 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">
              無料AIツール使用状況（上位3つまで選択可能）
            </label>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {selectedFreeTools.length}/3個
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {aiTools.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => handleToolSelection(tool, false)}
                disabled={!isToolSelected(tool, false) && selectedFreeTools.length >= 3}
                className={`
                  p-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 text-left
                  ${isToolSelected(tool, false)
                    ? 'border-[#59B3B3] bg-teal-50 text-[#59B3B3]'
                    : (!isToolSelected(tool, false) && selectedFreeTools.length >= 3)
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#59B3B3] hover:bg-teal-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{tool}</span>
                  {isToolSelected(tool, false) && (
                    <div className="w-5 h-5 bg-[#59B3B3] rounded-full flex items-center justify-center ml-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          {formData.Muryo && (
            <div className="mt-3 p-3 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-sm text-teal-800">
                <span className="font-semibold">選択済み:</span> {formData.Muryo}
              </p>
            </div>
          )}
        </div>

        {/* 最も活用している業務 */}
        <div className="space-y-3">
          <label htmlFor="primaryUse" className="block text-sm font-semibold text-slate-700">
            最も活用している業務
          </label>
          <div className="relative">
            <textarea
              id="primaryUse"
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-[#59B3B3] transition-all duration-300 bg-white resize-none text-base"
              placeholder="例：文書作成、プレゼン資料作成、メール作成、コード生成、データ分析など"
              rows={3}
              maxLength={256}
              value={formData.Katsuyou || ''}
              onChange={(e) => onInfoChange('Katsuyou', e.target.value)}
            />
            <div className="absolute bottom-3 right-3">
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm">
                {(formData.Katsuyou || '').length}/256
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;