import React from 'react';
import { ExternalLink, Shield, FileText } from 'lucide-react';

interface TermsAgreementProps {
  agreed: boolean;
  onAgreementChange: (agreed: boolean) => void;
  onStart: () => void;
}

const TermsAgreement: React.FC<TermsAgreementProps> = ({ agreed, onAgreementChange, onStart }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">利用規約への同意</h2>
        <p className="text-lg text-slate-600">
          診断を開始する前に利用規約をご確認ください
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="space-y-6">
          {/* 利用規約リンク */}
          <div className="text-center">
            <a
              href="https://anddigital.co.jp/terms/ai-business-shindan/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#59B3B3] text-white rounded-xl hover:bg-[#4A9999] transition-colors duration-200 font-semibold"
            >
              <span>利用規約を確認する</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* 同意チェックボックス */}
          <div className="border-t border-slate-200 pt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => onAgreementChange(e.target.checked)}
                className="w-5 h-5 text-[#59B3B3] bg-white border-slate-300 rounded focus:ring-[#59B3B3] focus:ring-2"
              />
              <span className="text-lg text-slate-800">
                利用規約を読み、同意します
              </span>
            </label>
          </div>

          {/* 開始ボタン */}
          <button
            onClick={onStart}
            disabled={!agreed}
            className={`
              w-full py-4 font-bold text-lg rounded-xl transition-all duration-300
              ${agreed
                ? 'bg-[#59B3B3] text-white hover:bg-[#4A9999]'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            診断を開始する
          </button>
          
          {!agreed && (
            <p className="text-center text-sm text-slate-500">
              利用規約への同意が必要です
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsAgreement;