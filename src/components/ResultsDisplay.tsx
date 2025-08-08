import React, { useState } from 'react';
import { Download, Share2, RotateCcw, Twitter, Linkedin, X, Link2 } from 'lucide-react';
import { DiagnosisResult } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsDisplayProps {
  results: DiagnosisResult | null;
  onRestart: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onRestart }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
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
              // 1. thumbnail APIを使用（高速、CORS対応） - サイズをさらに小さく
              output = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
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

  const handleDownload = async () => {
    try {
      // PDF生成
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      
      // 日本語フォントの設定（フォントを埋め込み）
      pdf.setFont('helvetica', 'normal');
      
      // タイトル
      pdf.setFontSize(20);
      pdf.text('AI Diagnosis Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // 日付
      pdf.setFontSize(10);
      pdf.text(`Date: ${new Date().toLocaleDateString('ja-JP')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // 名前
      if (name) {
        pdf.setFontSize(12);
        pdf.text(`Name: ${name}`, margin, yPosition);
        yPosition += 15;
      }
      
      // タイプ情報
      if (text_1) {
        const typeText = text_1.replace(/<[^>]*>/g, '').trim();
        const typeMatch = typeText.match(/【あなたのタイプ】([^【]*)/);
        if (typeMatch) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Your AI Type', margin, yPosition);
          yPosition += 8;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          const typeContent = typeMatch[1].trim();
          const lines = pdf.splitTextToSize(typeContent, pageWidth - margin * 2);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 6;
          });
          yPosition += 10;
        }
        
        // 使い方情報
        const usageMatch = typeText.match(/【こんな使い方がいいかも？】([\s\S]*)/);
        if (usageMatch) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Recommended Usage', margin, yPosition);
          yPosition += 8;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          const usageContent = usageMatch[1].trim();
          const usageLines = usageContent.split('\n').filter(line => line.trim());
          usageLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            const cleanLine = line.replace(/<[^>]*>/g, '').trim();
            if (cleanLine) {
              const lines = pdf.splitTextToSize(`\u2022 ${cleanLine}`, pageWidth - margin * 2 - 10);
              lines.forEach((splitLine: string) => {
                pdf.text(splitLine, margin + 5, yPosition);
                yPosition += 6;
              });
            }
          });
        }
      }
      
      // PDFを保存
      pdf.save(`AI_Diagnosis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      // フォールバックとしてテキストダウンロード
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
    }
  };

  const handleShare = async (platform?: string) => {
    const shareText = `${name ? `${name}さんの` : '私の'}AI活用診断が完了しました！`;
    const shareUrl = window.location.href;
    
    if (!platform) {
      // メニューを表示
      setShowShareMenu(!showShareMenu);
      return;
    }
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          alert('URLがクリップボードにコピーされました！');
        } catch (error) {
          console.error('コピーに失敗しました');
        }
        setShowShareMenu(false);
        return;
      default:
        // Web Share APIを使用
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'AI診断結果',
              text: shareText,
              url: shareUrl
            });
          } catch (error) {
            console.log('シェアがキャンセルされました');
          }
        }
        setShowShareMenu(false);
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setShowShareMenu(false);
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
              <div className="w-full max-w-sm mx-auto">
                <img 
                  src={output} 
                  alt="AI診断結果チャート" 
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '280px', objectFit: 'contain' }}
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
              <div className="w-full max-w-sm mx-auto">
                <img 
                  src={output} 
                  alt="AI診断結果チャート" 
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '280px', objectFit: 'contain' }}
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
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-[#59B3B3] rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-white font-bold text-xl">A</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-2">あなたのタイプ</h4>
                            <p className="text-xl font-bold text-slate-900">
                              {typeContent.replace(/<[^>]*>/g, '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 使い方セクション */}
                    {usageContent && (
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-[#59B3B3] rounded-lg flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                          </div>
                          <h4 className="text-sm font-medium text-slate-500">こんな使い方がおすすめ</h4>
                        </div>
                        <div className="space-y-3 pl-11">
                          {usageContent.split('\n').filter(line => line.trim()).map((line, index) => {
                            // 各行をパースしてリストアイテムとして表示
                            const cleanLine = line.replace(/<[^>]*>/g, '').trim();
                            if (!cleanLine) return null;
                            
                            return (
                              <div key={index} className="flex items-start">
                                <span className="text-[#59B3B3] mr-3 mt-1 text-lg">•</span>
                                <p className="text-slate-600 leading-relaxed">{cleanLine}</p>
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
        
        <div className="relative">
          <button
            onClick={() => handleShare()}
            className="flex items-center justify-center px-6 py-3 bg-[#59B3B3] text-white font-semibold rounded-xl hover:bg-[#4A9999] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            結果をシェア
          </button>
          
          {/* SNSシェアメニュー */}
          {showShareMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[200px]">
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4 mr-3 text-[#1DA1F2]" />
                <span className="text-slate-700">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Linkedin className="w-4 h-4 mr-3 text-[#0077B5]" />
                <span className="text-slate-700">LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="w-4 h-4 mr-3 bg-[#1877F2] rounded-sm"></div>
                <span className="text-slate-700">Facebook</span>
              </button>
              <div className="border-t border-slate-200 my-1"></div>
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Link2 className="w-4 h-4 mr-3 text-slate-500" />
                <span className="text-slate-700">URLをコピー</span>
              </button>
            </div>
          )}
        </div>
        
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