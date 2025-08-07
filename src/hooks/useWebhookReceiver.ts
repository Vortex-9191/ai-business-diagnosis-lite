import { useEffect, useState } from 'react';
import { DiagnosisResult } from '../types';

// Webhook結果を受信するためのカスタムフック
export const useWebhookReceiver = () => {
  const [webhookResult, setWebhookResult] = useState<DiagnosisResult | null>(null);
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  useEffect(() => {
    // PostMessage受信リスナー（Difyからの直接通信用）
    const handlePostMessage = (event: MessageEvent) => {
      // セキュリティ: 信頼できるオリジンからのメッセージのみ受信
      if (event.origin !== window.location.origin && !event.origin.includes('dify.ai')) {
        return;
      }

      if (event.data && event.data.type === 'DIFY_WEBHOOK_RECEIVED') {
        console.log('📨 Webhook via PostMessage:', event.data.data);
        const result = processDifyWebhookData(event.data.data);
        setWebhookResult(result);
        setIsWaitingForWebhook(false);
        setWebhookError(null);
      }
    };

    // カスタムイベントリスナー
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('🎉 Webhook via CustomEvent:', event.detail);
      const result = processDifyWebhookData(event.detail);
      setWebhookResult(result);
      setIsWaitingForWebhook(false);
      setWebhookError(null);
    };

    // イベントリスナーを登録
    window.addEventListener('message', handlePostMessage);
    window.addEventListener('difyWebhookReceived', handleCustomEvent as EventListener);

    // LocalStorageから既存の結果をチェック
    const checkStoredResult = () => {
      const stored = localStorage.getItem('dify_webhook_result');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('📦 Found stored webhook result:', parsed);
          setWebhookResult(parsed);
          setIsWaitingForWebhook(false);
        } catch (error) {
          console.error('Error parsing stored webhook result:', error);
        }
      }
    };

    checkStoredResult();

    // 定期的にLocalStorageをチェック（ポーリング）
    const pollInterval = setInterval(() => {
      if (isWaitingForWebhook) {
        checkStoredResult();
      }
    }, 2000); // 2秒ごとにチェック

    // クリーンアップ
    return () => {
      window.removeEventListener('message', handlePostMessage);
      window.removeEventListener('difyWebhookReceived', handleCustomEvent as EventListener);
      clearInterval(pollInterval);
    };
  }, [isWaitingForWebhook]);

  // DifyのWebhookデータを処理
  const processDifyWebhookData = (data: any): DiagnosisResult => {
    console.log('🔄 Processing Dify webhook data:', data);
    
    const result: DiagnosisResult = {
      workflow_run_id: data.workflow_run_id || `webhook_${Date.now()}`,
      task_id: data.data?.id || `task_${Date.now()}`,
      data: {
        id: data.data?.id || `result_${Date.now()}`,
        workflow_id: data.data?.workflow_id || data.workflow_run_id || '',
        status: data.data?.status || 'succeeded',
        outputs: data.data?.outputs || { result: data.result || data.text || '' },
        error: data.data?.error,
        elapsed_time: data.data?.elapsed_time || 0,
        total_tokens: data.data?.total_tokens || 0,
        total_steps: data.data?.total_steps || 0,
        created_at: data.data?.created_at || Date.now(),
        finished_at: data.data?.finished_at || Date.now()
      }
    };

    // LocalStorageに保存
    localStorage.setItem('dify_webhook_result', JSON.stringify(result));
    
    return result;
  };

  // Webhook待機を開始
  const startWaitingForWebhook = () => {
    console.log('⏳ Started waiting for Dify webhook...');
    setIsWaitingForWebhook(true);
    setWebhookError(null);
    setWebhookResult(null);
    localStorage.removeItem('dify_webhook_result');
  };

  // 結果をクリア
  const clearWebhookResult = () => {
    setWebhookResult(null);
    setWebhookError(null);
    setIsWaitingForWebhook(false);
    localStorage.removeItem('dify_webhook_result');
  };

  // Webhook URLを取得（テスト用）
  const getWebhookUrl = () => {
    return `${window.location.origin}/webhook-test`;
  };

  // 手動でWebhook結果を設定（テスト用）
  const simulateWebhookResult = (testData?: any) => {
    const sampleResult = testData || {
      event: 'workflow_finished',
      workflow_run_id: `test_${Date.now()}`,
      data: {
        id: `test_workflow_${Date.now()}`,
        status: 'succeeded',
        outputs: {
          result: `AI診断結果サンプル:

【総合評価】
あなたのAI活用レベルは「スタンダード」です。

【カテゴリ別スコア】
• AI基礎知識: 72点 - AIの基本概念を理解し、実践的な活用経験があります
• セキュリティ意識: 58点 - セキュリティリスクへの理解を深める必要があります
• プロンプト技術: 81点 - 効果的なAI指示作成スキルが優秀です
• 業務自動化: 43点 - 自動化ツールの活用スキル向上が推奨されます
• 先端技術活用: 29点 - 高度なAI技術への理解を深めることをお勧めします

【改善提案】
1. セキュリティガイドラインの理解を深める
2. RPA等の自動化ツールの学習
3. 最新AI技術のトレンドをキャッチアップ

継続的な学習により、さらなるAI活用レベルの向上が期待できます。`
        }
      }
    };

    console.log('🧪 Simulating webhook result:', sampleResult);
    const result = processDifyWebhookData(sampleResult);
    setWebhookResult(result);
    setIsWaitingForWebhook(false);
  };

  return {
    webhookResult,
    isWaitingForWebhook,
    webhookError,
    startWaitingForWebhook,
    clearWebhookResult,
    getWebhookUrl,
    simulateWebhookResult, // テスト用
    setIsWaitingForWebhook
  };
};