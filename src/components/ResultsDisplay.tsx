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
            <div className="text-4xl font-bold text-red-500">!</div>
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
  console.log('🔍 Full results object:', results);
  console.log('🔍 Results.data:', results?.data);
  console.log('🔍 Results.data.outputs:', results?.data?.outputs);
  
  let output = '';
  let text_1 = '';
  let text = '';
  let text_3 = '';
  let name = '';
  
  // 複数の形式に対応 - より多くのパターンをチェック
  const possibleResults = [
    results?.data?.outputs,
    results?.data,
    (results as any)?.outputs,
    (results as any)?.result,
    results
  ];
  
  console.log('🔍 Checking possible result locations:', possibleResults);
  
  // 各可能な場所から値を探す
  for (const rawResult of possibleResults) {
    if (rawResult && typeof rawResult === 'object') {
      // outputフィールドを優先的にチェック
      if (rawResult.output) {
        const outputStr = String(rawResult.output);
        console.log('📝 Raw output content:', outputStr);
        
        // outputに全てのデータが含まれている場合（<hr>で区切られている）
        if (outputStr.includes('<hr>')) {
          const sections = outputStr.split('<hr>');
          console.log('📝 Found sections:', sections.length);
          
          // 最初のセクション：GoogleドライブURL
          if (sections[0]) {
            console.log('🔍 Checking first section for image URL:', sections[0]);
            // GoogleドライブのURLを抽出
            const urlMatch = sections[0].match(/https:\/\/drive\.google\.com\/file\/d\/([^\/\s]+)/);
            if (urlMatch) {
              const fileId = urlMatch[1];
              // 複数のGoogleドライブURL形式を試す
              // 1. thumbnail APIを使用（高速、CORS対応） - サイズを適切に
              output = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
              console.log('🖼️ Using Google Drive thumbnail API:', output);
              console.log('🖼️ File ID:', fileId);
            } else {
              // URLが見つからない場合、そのまま使用
              output = sections[0].trim();
              console.log('⚠️ No Google Drive URL pattern found, using raw output:', output);
            }
          }
          
          // 2番目のセクション：text_1（タイプと使い方）
          if (sections[1]) {
            text_1 = sections[1].trim();
          }
          
          // 3番目のセクション：text（AI活用分析）
          if (sections[2]) {
            text = sections[2].trim();
            // 名前を抽出
            const nameMatch = text.match(/<strong>([^さ]+)さん/);
            if (nameMatch) {
              name = nameMatch[1];
            }
          }
          
          // 4番目のセクション：text_3（AI活用指針）
          if (sections[3]) {
            text_3 = sections[3].trim();
          }
          
          console.log('✅ Parsed from output:', { output, text_1, text, text_3, name });
          break;
        }
      }
      
      // 従来の個別フィールドチェック（フォールバック）
      if (!output && rawResult.output) output = rawResult.output;
      if (!text_1 && rawResult.text_1) text_1 = rawResult.text_1;
      if (!text && rawResult.text) text = rawResult.text;
      if (!text_3 && rawResult.text_3) text_3 = rawResult.text_3;
      if (!name && rawResult.name) name = rawResult.name;
      
      // デバッグ用：どこでデータが見つかったか
      if (rawResult.output || rawResult.text_1 || rawResult.text || rawResult.text_3) {
        console.log('✅ Found data in:', rawResult);
        break;
      }
    }
  }
  
  console.log('📊 Final parsed data:', { output, text_1, text, text_3, name });
  
  // データが何も取得できていない場合の詳細なログ
  if (!output && !text_1 && !text && !text_3) {
    console.error('❌ No data found in any expected location');
    console.error('❌ Full results structure:', JSON.stringify(results, null, 2));
  }

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
      title: 'AI診断結果',
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
          <div className="w-20 h-20 rounded-full bg-[#59B3B3] flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 bg-white rounded-full"></div>
          </div>
        </div>
        <h2 className="text-4xl font-bold text-slate-800 mb-3">診断完了！</h2>
        <p className="text-lg text-slate-600 mb-6">あなたのAI活用レベルを分析しました</p>
      </div>

      {/* Googleドライブの画像表示 */}
      {console.log('🌐 Rendering image section, output value:', output)}
      {output ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">あなたのAI活用タイプは…</h3>
          </div>
          <div className="flex justify-center">
            {output.includes('drive.google.com') ? (
              // Googleドライブの場合
              <div className="w-full max-w-md mx-auto">
                <img 
                  src={output} 
                  alt="AI診断結果チャート" 
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('❌ Image load error, trying alternative URL:', output);
                    // エラー時に代替URLを試す
                    const fileIdMatch = output.match(/id=([^&]+)/);
                    if (fileIdMatch) {
                      const fileId = fileIdMatch[1];
                      // uc?export=view形式を試す
                      const altUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                      if (e.currentTarget.src !== altUrl) {
                        console.log('🔄 Trying alternative URL:', altUrl);
                        e.currentTarget.src = altUrl;
                      } else {
                        // 両方失敗した場合はリンクを表示
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                              <p class="text-gray-600 mb-4">診断チャートの表示に失敗しました</p>
                              <a href="https://drive.google.com/file/d/${fileId}/view" 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 class="px-4 py-2 bg-[#59B3B3] text-white rounded-lg hover:bg-[#4A9999] transition-colors">
                                Googleドライブで表示
                              </a>
                            </div>
                          `;
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              // 通常のURLの場合
              <div className="w-full max-w-md mx-auto">
                <img 
                  src={output} 
                  alt="AI診断結果チャート" 
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">あなたのAI活用タイプは…</h3>
          </div>
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">分析チャートを生成中...</p>
          </div>
        </div>
      )}

      {/* 分析結果セクション */}
      <div className="space-y-6">
        {text_1 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {/* タイプと使い方をパースして装飾 */}
            {(() => {
              // 【あなたのタイプ】と【こんな使い方がいいかも？】を分割
              const typeMatch = text_1.match(/【あなたのタイプ】([^【]*)/s);
              const usageMatch = text_1.match(/【こんな使い方がいいかも？】([\s\S]*?)(?=【|$)/);
              
              if (typeMatch || usageMatch) {
                const typeContent = typeMatch ? typeMatch[1].trim() : '';
                const usageContent = usageMatch ? usageMatch[1].trim() : '';
                
                return (
                  <div className="space-y-6">
                    {/* タイプセクション */}
                    {typeContent && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">A</span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-800">あなたのタイプ</h4>
                        </div>
                        <p className="text-lg text-slate-700 font-medium">
                          {typeContent.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                    )}
                    
                    {/* 使い方セクション */}
                    {usageContent && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold">✓</span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-800">こんな使い方がいいかも？</h4>
                        </div>
                        <div className="space-y-3">
                          {usageContent.split('\n').filter(line => line.trim()).map((line, index) => {
                            // 各行をパースしてリストアイテムとして表示
                            const cleanLine = line.replace(/<[^>]*>/g, '').trim();
                            if (!cleanLine) return null;
                            
                            return (
                              <div key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <p className="text-slate-700">{cleanLine}</p>
                              </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      </div>
                    )}
                    
                    {/* パースできない場合は元の表示 */}
                    {!typeContent && !usageContent && (
                      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text_1 }} />
                    )}
                  </div>
                );
              } else {
                // マッチしない場合は元の表示
                return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text_1 }} />;
              }
            })()}
          </div>
        ) : null}
        
        {text ? (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#59B3B3] rounded-2xl flex items-center justify-center mr-4 shadow-md">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">{name || 'あなた'}さんのAI活用分析</h4>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-teal-200">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          </div>
        ) : null}
        
        {text_3 ? (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#59B3B3] rounded-2xl flex items-center justify-center mr-4 shadow-md">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">{name || 'あなた'}さんのAI活用指針</h4>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-teal-200">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: text_3 }} />
            </div>
          </div>
        ) : null}
        
        {/* データが何もない場合の表示 */}
        {!text_1 && !text && !text_3 && (
          <div className="bg-yellow-50 rounded-2xl shadow-lg border border-yellow-200 p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center mr-4 shadow-md">
                <div className="text-white text-xl font-bold">!</div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">分析結果を処理中です</h4>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-yellow-200">
              <p className="text-gray-600">
                AI分析が完了しましたが、詳細な結果の取得に時間がかかっています。<br />
                しばらくお待ちいただくか、再度診断をお試しください。
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  デバッグ情報：<br />
                  - output: {output ? '取得済み' : '未取得'}<br />
                  - text_1: {text_1 ? '取得済み' : '未取得'}<br />
                  - text: {text ? '取得済み' : '未取得'}<br />
                  - text_3: {text_3 ? '取得済み' : '未取得'}<br />
                  - name: {name || '未取得'}
                </p>
              </div>
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
          <div className="w-4 h-4 bg-slate-400 rounded-full inline-block"></div>
          <span>あなたの回答データは安全に処理され、プライバシーが保護されています</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;