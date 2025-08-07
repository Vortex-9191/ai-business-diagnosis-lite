import React from 'react';
import { Download, Share2, RotateCcw } from 'lucide-react';
import { DiagnosisResult } from '../types';

interface ResultsDisplayProps {
  results: DiagnosisResult | null;
  onRestart: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onRestart }) => {
  console.log('🔍 Results received in component:', results);
  
  // エラーチェック：結果が有効でない場合
  if (!results || (!results.data && !results.result && !results.output && !results.text)) {
    console.log('❌ No valid results found, showing retry screen');
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">分析結果の取得に失敗しました</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            申し訳ございません。AI分析の処理中にエラーが発生しました。<br />
            もう一度診断をお試しください。
          </p>
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-[#59B3B3] text-white font-semibold rounded-2xl hover:bg-[#4A9999] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            再度診断を実行
          </button>
        </div>
      </div>
    );
  }
  
  // Difyからの結果を解析 - 新しい形式に対応
  let output = '';
  let text_1 = '';
  let text = '';
  let text_3 = '';
  let name = '';
  
  // 複数の形式に対応
  const rawResult = results?.data?.outputs || results?.data || (results as any) || {};
  
  // 新しい形式のデータを抽出
  if (rawResult.output) output = rawResult.output;
  if (rawResult.text_1) text_1 = rawResult.text_1;
  if (rawResult.text) text = rawResult.text;
  if (rawResult.text_3) text_3 = rawResult.text_3;
  if (rawResult.name) name = rawResult.name;
  
  console.log('📊 Parsed data:', { output, text_1, text, text_3, name });

  const handleDownload = () => {
    const resultsText = `
AI診断結果レポート
===================

${name ? `診断者: ${name}さん` : ''}

${text_1 ? `基本分析:\n${text_1.replace(/<[^>]*>/g, '')}\n` : ''}

${text ? `AI活用分析:\n${text.replace(/<[^>]*>/g, '')}\n` : ''}

${text_3 ? `AI活用指針:\n${text_3.replace(/<[^>]*>/g, '')}\n` : ''}

診断日時: ${new Date().toLocaleString('ja-JP')}
    `;

    const blob = new Blob([resultsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI診断結果_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'AI活用診断結果',
      text: `${name ? `${name}さんの` : '私の'}AI活用診断が完了しました 🤖✨`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('シェアがキャンセルされました');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('結果がクリップボードにコピーされました！');
      } catch (error) {
        console.error('クリップボードへのコピーに失敗しました');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#59B3B3] flex items-center justify-center text-3xl shadow-lg">
            🎯
          </div>
        </div>
        <h2 className="text-4xl font-bold text-slate-800 mb-3">診断完了！</h2>
        <p className="text-lg text-slate-600 mb-6">あなたのAI活用レベルを分析しました</p>
      </div>

      {/* Googleドライブの画像表示 */}
      {output && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">AI活用スキル分析</h3>
          </div>
          <div className="flex justify-center">
            <img 
              src={output} 
              alt="AI活用スキル分析チャート" 
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      )}

      {/* 分析結果セクション */}
      <div className="space-y-6">
        {text_1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text_1 }} />
          </div>
        )}
        
        {text && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#59B3B3] rounded-2xl flex items-center justify-center mr-4 shadow-md">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">{name || 'あなた'}さんのAI活用分析</h4>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-teal-200">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          </div>
        )}
        
        {text_3 && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#59B3B3] rounded-2xl flex items-center justify-center mr-4 shadow-md">
                <span className="text-white text-xl">💡</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">{name || 'あなた'}さんのAI活用指針</h4>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-teal-200">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text_3 }} />
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center px-6 py-3 bg-[#59B3B3] text-white font-semibold rounded-xl hover:bg-[#4A9999] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          結果をダウンロード
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center px-6 py-3 bg-[#59B3B3] text-white font-semibold rounded-xl hover:bg-[#4A9999] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          結果をシェア
        </button>
        
        <button
          onClick={onRestart}
          className="flex items-center justify-center px-6 py-3 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          再診断する
        </button>
      </div>

      {/* フッター情報 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-slate-500 bg-white rounded-full px-4 py-2 border border-slate-200">
          <span>🔒</span>
          <span>あなたの回答データは安全に処理され、プライバシーが保護されています</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;