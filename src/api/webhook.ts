// DifyからBOLTへの分析結果転送用のWebhook処理
// このファイルは、DifyのWorkflow完了時にBOLTアプリに結果を送信するためのエンドポイント処理です

export interface DifyWebhookPayload {
  event: 'workflow_finished' | 'workflow_failed';
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'succeeded' | 'failed' | 'stopped';
    outputs: {
      result?: string;
      text?: string;
      [key: string]: any;
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
  user_id?: string;
}

// BOLTアプリでDifyからの結果を受信する処理
export const handleDifyWebhook = async (payload: DifyWebhookPayload) => {
  console.log('🔔 Dify Webhook received:', payload);
  
  try {
    if (payload.event === 'workflow_finished' && payload.data.status === 'succeeded') {
      // 成功時の処理
      const analysisResult = payload.data.outputs.result || payload.data.outputs.text || '';
      
      // LocalStorageに結果を保存（実際のアプリでは適切な状態管理を使用）
      const resultData = {
        workflow_run_id: payload.workflow_run_id,
        task_id: payload.data.id,
        data: payload.data,
        timestamp: Date.now()
      };
      
      localStorage.setItem('dify_analysis_result', JSON.stringify(resultData));
      
      // カスタムイベントを発火してアプリに通知
      window.dispatchEvent(new CustomEvent('difyResultReceived', {
        detail: resultData
      }));
      
      console.log('✅ Analysis result saved and event dispatched');
      return { success: true, message: 'Result processed successfully' };
      
    } else if (payload.event === 'workflow_failed' || payload.data.status === 'failed') {
      // 失敗時の処理
      console.error('❌ Dify workflow failed:', payload.data.error);
      
      window.dispatchEvent(new CustomEvent('difyResultError', {
        detail: { error: payload.data.error || 'Workflow failed' }
      }));
      
      return { success: false, message: 'Workflow failed', error: payload.data.error };
    }
    
    return { success: false, message: 'Unknown event or status' };
    
  } catch (error) {
    console.error('❌ Error processing Dify webhook:', error);
    return { success: false, message: 'Processing error', error: error.message };
  }
};

// BOLTアプリのURLを取得する関数
export const getBoltWebhookUrl = () => {
  // 本番環境では実際のBOLTアプリのURLを返す
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/dify-webhook`;
};

// Webhook URL をコンソールに表示する関数（開発用）
export const logWebhookUrl = () => {
  const webhookUrl = getBoltWebhookUrl();
  console.log('🔗 BOLT Webhook URL for Dify:', webhookUrl);
  console.log('📋 Copy this URL to your Dify Workflow webhook settings');
  return webhookUrl;
};