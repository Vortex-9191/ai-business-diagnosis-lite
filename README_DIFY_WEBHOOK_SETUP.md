# DifyからBOLTへの分析結果転送設定ガイド

このガイドでは、DifyのWorkflowからBOLTアプリに分析結果を直接転送する方法を説明します。

## 🔧 設定手順

### 1. BOLTアプリのWebhook URL取得

BOLTアプリを起動後、ブラウザのコンソール（F12）で以下のコマンドを実行：

```javascript
// Webhook URLを取得
import { logWebhookUrl } from './src/api/webhook.ts';
logWebhookUrl();
```

または、手動でURLを構築：
```
https://your-bolt-app-url.com/api/dify-webhook
```

### 2. Dify Workflow設定

#### 2.1 Webhookノードの追加
1. Dify Workflowエディターを開く
2. 「HTTP Request」または「Webhook」ノードを追加
3. Workflow の最後（結果出力後）に配置

#### 2.2 Webhook設定
```json
{
  "method": "POST",
  "url": "https://your-bolt-app-url.com/api/dify-webhook",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-webhook-secret" // オプション
  },
  "body": {
    "event": "workflow_finished",
    "workflow_run_id": "{{workflow.run_id}}",
    "data": {
      "id": "{{workflow.id}}",
      "workflow_id": "{{workflow.workflow_id}}",
      "status": "succeeded",
      "outputs": {
        "result": "{{your_analysis_output}}",
        "text": "{{your_text_output}}"
      },
      "elapsed_time": "{{workflow.elapsed_time}}",
      "total_tokens": "{{workflow.total_tokens}}",
      "total_steps": "{{workflow.total_steps}}",
      "created_at": "{{workflow.created_at}}",
      "finished_at": "{{workflow.finished_at}}"
    },
    "user_id": "{{user.id}}"
  }
}
```

### 3. BOLTアプリでの受信処理

#### 3.1 Webhookエンドポイントの実装
```typescript
// src/api/webhook.ts で実装済み
export const handleDifyWebhook = async (payload: DifyWebhookPayload) => {
  // 結果をLocalStorageに保存
  // カスタムイベントを発火してアプリに通知
}
```

#### 3.2 アプリでの結果受信
```typescript
// src/hooks/useDifyWebhook.ts で実装済み
const { webhookResult, isWaitingForResult, error } = useDifyWebhook();
```

## 📊 データフロー

```
1. ユーザーが診断を実行
   ↓
2. BOLTからDify Workflow APIを呼び出し
   ↓
3. Difyで分析処理を実行
   ↓
4. 分析完了後、DifyからBOLTのWebhookエンドポイントに結果を送信
   ↓
5. BOLTアプリが結果を受信し、UIに表示
```

## 🔒 セキュリティ考慮事項

### Webhook認証
```typescript
// オプション: Webhook認証の実装
const validateWebhookSignature = (payload: string, signature: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
};
```

### CORS設定
```typescript
// WebhookエンドポイントでのCORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dify.ai',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
```

## 🧪 テスト方法

### 1. 手動テスト
```bash
curl -X POST https://your-bolt-app-url.com/api/dify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "workflow_finished",
    "workflow_run_id": "test-123",
    "data": {
      "id": "test-workflow",
      "status": "succeeded",
      "outputs": {
        "result": "テスト分析結果"
      }
    }
  }'
```

### 2. Dify Workflowテスト
1. Dify Workflowエディターでテスト実行
2. Webhookノードが正常に実行されることを確認
3. BOLTアプリで結果が受信されることを確認

## 🚨 トラブルシューティング

### よくある問題

1. **Webhook URLにアクセスできない**
   - CORS設定を確認
   - HTTPSを使用しているか確認

2. **結果が受信されない**
   - Dify Workflowの実行ログを確認
   - BOLTアプリのコンソールログを確認

3. **データ形式が正しくない**
   - Webhook payloadの形式を確認
   - 型定義と一致しているか確認

### デバッグ用ログ
```typescript
// コンソールでWebhook状況を確認
console.log('Webhook URL:', getBoltWebhookUrl());
console.log('Waiting for result:', isWaitingForResult);
console.log('Current result:', webhookResult);
```

## 📝 注意事項

1. **タイムアウト設定**: 長時間の分析の場合、適切なタイムアウト値を設定
2. **エラーハンドリング**: Workflow失敗時の処理も実装
3. **結果の永続化**: 必要に応じてデータベースに保存
4. **スケーラビリティ**: 複数ユーザーの同時利用を考慮

## 🔄 代替方法

Webhookが使用できない場合の代替案：

1. **ポーリング方式**: 定期的にDify APIで結果を確認
2. **WebSocket**: リアルタイム通信での結果受信
3. **Server-Sent Events**: サーバーからのプッシュ通知

この設定により、DifyからBOLTへの分析結果転送が自動化され、ユーザーエクスペリエンスが向上します。