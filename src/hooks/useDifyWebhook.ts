import { useEffect, useState } from 'react';
import { DiagnosisResult } from '../types';

// DifyのWebhook結果を受信するためのカスタムフック
export const useDifyWebhook = () => {
  const [webhookResult, setWebhookResult] = useState<DiagnosisResult | null>(null);
  const [isWaitingForResult, setIsWaitingForResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Difyからの結果受信イベントリスナー
    const handleDifyResult = (event: CustomEvent) => {
      console.log('🎉 Dify result received via webhook:', event.detail);
      setWebhookResult(event.detail);
      setIsWaitingForResult(false);
      setError(null);
    };

    // Difyからのエラー受信イベントリスナー
    const handleDifyError = (event: CustomEvent) => {
      console.error('❌ Dify error received via webhook:', event.detail);
      setError(event.detail.error || 'Unknown error occurred');
      setIsWaitingForResult(false);
    };

    // イベントリスナーを登録
    window.addEventListener('difyResultReceived', handleDifyResult as EventListener);
    window.addEventListener('difyResultError', handleDifyError as EventListener);

    // LocalStorageから既存の結果をチェック
    const checkExistingResult = () => {
      const savedResult = localStorage.getItem('dify_analysis_result');
      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult);
          // 結果が新しい場合のみ設定（5分以内）
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            setWebhookResult(parsed);
          }
        } catch (error) {
          console.error('Error parsing saved result:', error);
        }
      }
    };

    checkExistingResult();

    // クリーンアップ
    return () => {
      window.removeEventListener('difyResultReceived', handleDifyResult as EventListener);
      window.removeEventListener('difyResultError', handleDifyError as EventListener);
    };
  }, []);

  // Webhook待機を開始する関数
  const startWaitingForWebhook = () => {
    setIsWaitingForResult(true);
    setError(null);
    setWebhookResult(null);
    
    // 既存の結果をクリア
    localStorage.removeItem('dify_analysis_result');
    
    console.log('⏳ Started waiting for Dify webhook result...');
  };

  // 結果をクリアする関数
  const clearResult = () => {
    setWebhookResult(null);
    setError(null);
    setIsWaitingForResult(false);
    localStorage.removeItem('dify_analysis_result');
  };

  return {
    webhookResult,
    isWaitingForResult,
    error,
    startWaitingForWebhook,
    clearResult
  };
};