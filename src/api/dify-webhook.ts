// Dify Webhook受信用のAPIエンドポイント
import { DiagnosisResult } from '../types';

export interface DifyWebhookPayload {
  event: 'workflow_finished' | 'workflow_failed';
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id?: string;
    status: 'succeeded' | 'failed' | 'stopped';
    outputs: {
      result?: string;
      text?: string;
      [key: string]: any;
    };
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    total_steps?: number;
    created_at?: number;
    finished_at?: number;
  };
  user_id?: string;
}

// Webhook処理関数
export const processDifyWebhook = (payload: DifyWebhookPayload): DiagnosisResult => {
  console.log('🔔 Processing Dify webhook:', payload);
  
  // DifyのWebhookペイロードをDiagnosisResult形式に変換
  const result: DiagnosisResult = {
    workflow_run_id: payload.workflow_run_id,
    task_id: payload.data.id,
    data: {
      id: payload.data.id,
      workflow_id: payload.data.workflow_id || payload.workflow_run_id,
      status: payload.data.status,
      outputs: payload.data.outputs,
      error: payload.data.error,
      elapsed_time: payload.data.elapsed_time || 0,
      total_tokens: payload.data.total_tokens || 0,
      total_steps: payload.data.total_steps || 0,
      created_at: payload.data.created_at || Date.now(),
      finished_at: payload.data.finished_at || Date.now()
    }
  };

  // LocalStorageに保存
  localStorage.setItem('dify_webhook_result', JSON.stringify(result));
  
  // カスタムイベントを発火
  window.dispatchEvent(new CustomEvent('difyWebhookReceived', {
    detail: result
  }));

  console.log('✅ Webhook processed and stored:', result);
  return result;
};

// Webhook URLを取得
export const getWebhookUrl = () => {
  return `${window.location.origin}/api/dify-webhook`;
};

// 開発用: Webhook URLをコンソールに表示
export const logWebhookInfo = () => {
  const url = getWebhookUrl();
  console.log('🔗 Dify Webhook URL:', url);
  console.log('📋 この URL を Dify Workflow の HTTP Request ノードに設定してください');
  return url;
};